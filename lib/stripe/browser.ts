import { loadStripe, type Stripe } from '@stripe/stripe-js'

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''

const promises = new Map<string, Promise<Stripe | null>>()

export const STRIPE_CONFIGURED = PUBLISHABLE_KEY.startsWith('pk_')
/** Test-mode publishable key → the UI shows test card hints. */
export const STRIPE_TEST_MODE = PUBLISHABLE_KEY.startsWith('pk_test_')

/**
 * Stripe.js pour la plateforme, ou pour un compte connecté (paiement direct : le PaymentIntent vit sur le
 * compte du prestataire, Stripe.js doit être initialisé avec ce même compte).
 */
export function getStripePromise(stripeAccount?: string | null): Promise<Stripe | null> | null {
  if (!STRIPE_CONFIGURED) return null
  const key = stripeAccount ?? ''
  let p = promises.get(key)
  if (!p) {
    p = loadStripe(PUBLISHABLE_KEY, stripeAccount ? { stripeAccount } : undefined)
    promises.set(key, p)
  }
  return p
}
