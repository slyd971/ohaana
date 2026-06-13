import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-05-27.dahlia',
    })
  }
  return _stripe
}

export async function createPaymentIntent({
  totalCents,
  currency = 'eur',
  bookingId,
  providerStripeAccountId,
  providerAmountCents,
}: {
  totalCents: number
  currency?: string
  bookingId: string
  providerStripeAccountId: string
  providerAmountCents: number
}) {
  const platformFeeCents = totalCents - providerAmountCents

  return getStripe().paymentIntents.create({
    amount: totalCents,
    currency,
    application_fee_amount: platformFeeCents,
    transfer_data: { destination: providerStripeAccountId },
    metadata: { booking_id: bookingId },
    automatic_payment_methods: { enabled: true },
  })
}
