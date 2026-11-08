import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { createAdminClient, hasServiceRole } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/client'
import { handleStripeEvent, type WebhookDeps } from '@/lib/stripe/webhook-handlers'

/**
 * Stripe webhook. Order of operations:
 *  1. verify the signature on the raw body (platform secret, or connected-accounts secret);
 *  2. claim the event id in webhook_events (a processed event is acknowledged and ignored);
 *  3. apply it through atomic SQL functions (replayable);
 *  4. mark it processed, or store the error and answer 500 so Stripe retries.
 */
export async function POST(request: Request) {
  // Deux endpoints Stripe possibles, chacun avec son secret : celui de la plateforme et celui des comptes connectés
  // (les paiements directs arrivent par ce dernier, avec event.account).
  const secrets = [process.env.STRIPE_WEBHOOK_SECRET, process.env.STRIPE_CONNECT_WEBHOOK_SECRET].filter((s): s is string => Boolean(s))
  if (!process.env.STRIPE_SECRET_KEY || secrets.length === 0 || !hasServiceRole()) {
    return NextResponse.json({ error: 'webhook_not_configured' }, { status: 503 })
  }

  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'missing_signature' }, { status: 400 })

  const stripe = getStripe()
  let event: Stripe.Event | null = null
  for (const secret of secrets) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, secret)
      break
    } catch {
      /* essaie le secret suivant */
    }
  }
  if (!event) return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })

  const supabase = await createAdminClient()

  const { data: claim, error: claimError } = await supabase.rpc('webhook_claim_event', {
    p_id: event.id,
    p_type: event.type,
    // Only a pointer to the object: the full payload would store customer data we do not need.
    p_payload: { object_id: (event.data.object as { id?: string }).id ?? null, livemode: event.livemode },
  })
  if (claimError) {
    console.error('[stripe-webhook] claim failed:', claimError.message)
    return NextResponse.json({ error: 'claim_failed' }, { status: 500 })
  }
  if (claim === 'duplicate') return NextResponse.json({ received: true, duplicate: true })

  const deps: WebhookDeps = {
    rpc: async (fn, args) => {
      const { data, error } = await supabase.rpc(fn, args)
      return { data, error: error ? { message: error.message } : null }
    },
    refundLatePayment: async (intentId, connectedAccount) => {
      // The idempotency key makes a replayed event reuse the same refund instead of creating another.
      await stripe.refunds.create(
        {
          payment_intent: intentId,
          reason: 'requested_by_customer',
          metadata: { cause: 'payment_after_booking_expired' },
          ...(connectedAccount ? { refund_application_fee: true } : {}),
        },
        connectedAccount
          ? { idempotencyKey: `late-payment-refund-${intentId}`, stripeAccount: connectedAccount }
          : { idempotencyKey: `late-payment-refund-${intentId}` },
      )
    },
  }

  try {
    const outcome = await handleStripeEvent(event, deps)
    await supabase.rpc('webhook_finish_event', { p_id: event.id, p_error: null })
    return NextResponse.json({ received: true, handled: outcome.handled, result: outcome.result ?? null })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error'
    console.error('[stripe-webhook] processing failed:', event.type, message)
    await supabase.rpc('webhook_finish_event', { p_id: event.id, p_error: message })
    return NextResponse.json({ error: 'processing_failed' }, { status: 500 })
  }
}
