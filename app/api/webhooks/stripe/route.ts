import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/client'
import { computeFees } from '@/lib/utils'
import type { BookingStatus, PaymentStatus } from '@/types/database'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const supabase = await createAdminClient()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent
      const bookingId = intent.metadata.booking_id

      if (!bookingId) break

      const { platformFee, providerAmount } = computeFees(intent.amount)

      await supabase
        .from('payments')
        .update({
          status: 'succeeded' as PaymentStatus,
          stripe_charge_id: intent.latest_charge as string | null,
          platform_fee_cents: platformFee,
          provider_amount_cents: providerAmount,
        })
        .eq('stripe_payment_intent_id', intent.id)

      await supabase
        .from('bookings')
        .update({ status: 'confirmed' as BookingStatus })
        .eq('id', bookingId)

      break
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent

      await supabase
        .from('payments')
        .update({ status: 'failed' as PaymentStatus })
        .eq('stripe_payment_intent_id', intent.id)

      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge

      await supabase
        .from('payments')
        .update({ status: 'refunded' as PaymentStatus })
        .eq('stripe_charge_id', charge.id)

      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}
