import { loadStripe, type Stripe } from '@stripe/stripe-js'

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''

let promise: Promise<Stripe | null> | null = null

export const STRIPE_CONFIGURED = PUBLISHABLE_KEY.startsWith('pk_')
/** Test-mode publishable key → the UI shows test card hints. */
export const STRIPE_TEST_MODE = PUBLISHABLE_KEY.startsWith('pk_test_')

export function getStripePromise(): Promise<Stripe | null> | null {
  if (!STRIPE_CONFIGURED) return null
  promise ??= loadStripe(PUBLISHABLE_KEY)
  return promise
}
