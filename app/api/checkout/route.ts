import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getStripe } from '@/lib/stripe/client'
import { createAdminClient, createClient, hasServiceRole } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/public'
import { getServiceByIdOrSlug } from '@/lib/data/services'
import { DEMO_MODE } from '@/lib/demo-mode'
import { computeCommission } from '@/lib/utils'
import { getCommissionPct } from '@/lib/commission'
import { buildDirectChargeIntent, isStripeAccountId } from '@/lib/stripe/direct-charge'

const bodySchema = z.object({
  serviceId: z.uuid(),
  slotId: z.uuid(),
  guests: z.number().int().min(1).max(50),
  notes: z.string().max(1000).optional(),
  address: z.string().max(300).optional(),
})

const fail = (error: string, status: number) => NextResponse.json({ error }, { status })

/**
 * Creates the Stripe PaymentIntent for a booking. The amount is ALWAYS computed here from the database
 * (service price × guests + service fee) — the browser only sends ids and a guest count.
 *
 *  - Demo mode (NEXT_PUBLIC_DEMO_MODE=true): no account, no booking row; only Stripe TEST keys are accepted.
 *  - Real mode: the signed-in user's session calls the create_booking RPC (slot lock, server-side price),
 *    then a DIRECT CHARGE is created on the provider's connected account (Ohaana's commission is the
 *    application fee); the Stripe webhook confirms it. A provider whose payments are not set up cannot be booked.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) return fail('payments_not_configured', 503)
  if (DEMO_MODE && !/^(sk|rk)_test_/.test(secret)) return fail('payments_not_configured', 503) // never charge for real in demo

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return fail('invalid_request', 400)
  const { serviceId, slotId, guests, notes, address } = parsed.data

  const service = await getServiceByIdOrSlug(serviceId).catch(() => null)
  if (!service) return fail('service_not_found', 404)
  if (guests < service.capacity_min || guests > service.capacity_max) return fail('invalid_guests', 400)

  const stripe = getStripe()

  // ── Demo: price from the catalogue, slot must really be free ─────────────────────────────────
  if (DEMO_MODE) {
    const { data: slot } = await createPublicClient()
      .from('public_slot_availability').select('id').eq('id', slotId).eq('service_id', serviceId).maybeSingle()
    if (!slot) return fail('slot_unavailable', 409)

    const total = service.price_unit === 'flat' ? service.price_cents : service.price_cents * guests
    // Commission incluse : le voyageur paie exactement le prix du catalogue.
    const intent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      description: `Ohaana DEMO — ${service.title_fr}`.slice(0, 200),
      metadata: { demo: 'true', service_id: serviceId, slot_id: slotId, guests: String(guests) },
    })
    return NextResponse.json({ clientSecret: intent.client_secret, amount: total, demo: true })
  }

  // ── Real: authenticated booking + payment ───────────────────────────────────────────────────
  if (!hasServiceRole()) return fail('payments_not_configured', 503)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return fail('auth_required', 401)

  // Le prestataire doit pouvoir encaisser : vérifié AVANT de bloquer le créneau.
  const admin = await createAdminClient()
  const { data: payee } = await admin
    .from('provider_profiles')
    .select('stripe_account_id, stripe_onboarded')
    .eq('id', service.provider_id)
    .maybeSingle()
  const target = payee as { stripe_account_id: string | null; stripe_onboarded: boolean } | null
  if (!target?.stripe_onboarded || !isStripeAccountId(target.stripe_account_id)) return fail('provider_not_ready', 409)
  const connectedAccount = target.stripe_account_id

  const { data: booking, error: bookingError } = await supabase.rpc('create_booking', {
    p_service_id: serviceId, p_slot_id: slotId, p_guests: guests, p_notes: notes ?? null, p_address: address ?? null,
  })
  if (bookingError || !booking) {
    const code = (bookingError as { code?: string } | null)?.code
    if (code === '23505') return fail('slot_unavailable', 409)
    if (code === 'P0002') return fail('service_not_found', 404)
    if (code === '22023') return fail('invalid_request', 400)
    if (code === '28000') return fail('auth_required', 401)
    console.error('[checkout] create_booking failed:', bookingError?.message)
    return fail('booking_failed', 500)
  }

  // Montants faisant foi : le total vient de la réservation créée par la base ; la commission est prélevée
  // sur la part du prestataire (le voyageur paie exactement ce total), au taux réglé par l'admin.
  const amount = booking.total_cents as number
  const { platformFee, providerAmount } = computeCommission(amount, await getCommissionPct())

  try {
    const { params, options } = buildDirectChargeIntent({
      amountCents: amount,
      platformFeeCents: platformFee,
      providerAccountId: connectedAccount,
      bookingId: booking.id,
      serviceId,
      touristId: user.id,
      title: service.title_fr,
      receiptEmail: user.email ?? undefined,
    })
    const intent = await stripe.paymentIntents.create(params, options)

    const { error: paymentError } = await admin.from('payments').insert({
      booking_id: booking.id,
      stripe_payment_intent_id: intent.id,
      status: 'pending',
      total_cents: amount,
      platform_fee_cents: platformFee,
      provider_amount_cents: providerAmount,
      currency: 'eur',
    })
    if (paymentError) throw new Error(paymentError.message)

    return NextResponse.json({
      clientSecret: intent.client_secret,
      amount,
      bookingId: booking.id,
      stripeAccount: connectedAccount, // le navigateur doit initialiser Stripe.js sur ce compte
      demo: false,
    })
  } catch (error) {
    console.error('[checkout] payment setup failed:', error instanceof Error ? error.message : error)
    await supabase.rpc('cancel_booking', { p_booking_id: booking.id, p_reason: 'payment_setup_failed' }) // release the slot
    return fail('payment_failed', 502)
  }
}
