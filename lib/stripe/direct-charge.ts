// Paiement en « direct charge » : le voyageur paie sur le compte Stripe du prestataire (compte connecté),
// Ohaana prélève sa commission via application_fee_amount. Le prestataire est le marchand de la transaction
// et Stripe porte le risque (pertes, litiges) sur son compte, ce qu'impose le modèle de risque géré par Stripe.
// Cœur pur (sans appel réseau) pour pouvoir le tester.

const ACCOUNT_ID = /^acct_[A-Za-z0-9]+$/

export const isStripeAccountId = (v: unknown): v is string => typeof v === 'string' && ACCOUNT_ID.test(v)

export interface DirectChargeInput {
  amountCents: number
  platformFeeCents: number
  providerAccountId: string
  bookingId: string
  serviceId: string
  touristId: string
  title: string
  receiptEmail?: string
}

/** Paramètres du PaymentIntent + options de requête (compte connecté et clé d'idempotence). */
export function buildDirectChargeIntent(input: DirectChargeInput) {
  if (!isStripeAccountId(input.providerAccountId)) throw new Error('invalid_provider_account')
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) throw new Error('invalid_amount')
  if (!Number.isInteger(input.platformFeeCents) || input.platformFeeCents < 0 || input.platformFeeCents >= input.amountCents) {
    throw new Error('invalid_platform_fee')
  }

  return {
    params: {
      amount: input.amountCents,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      // Stripe refuse une commission nulle : on l'omet quand le taux réglé par l'admin est 0 %.
      ...(input.platformFeeCents > 0 ? { application_fee_amount: input.platformFeeCents } : {}),
      receipt_email: input.receiptEmail,
      description: `Ohaana — ${input.title}`.slice(0, 200),
      metadata: { booking_id: input.bookingId, service_id: input.serviceId, tourist_id: input.touristId },
    },
    options: {
      stripeAccount: input.providerAccountId,
      idempotencyKey: `booking-${input.bookingId}`,
    },
  }
}
