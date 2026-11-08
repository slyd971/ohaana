'use client'

import { useEffect, useMemo } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { Appearance } from '@stripe/stripe-js'
import { getStripePromise } from '@/lib/stripe/browser'

// Matches the Ohaana design tokens (deep green primary, coconut surfaces, rounded-xl controls).
const APPEARANCE: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#1A3D2B',
    colorBackground: '#FFFFFF',
    colorText: '#1C1C1E',
    colorDanger: '#E8604A',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    borderRadius: '12px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': { borderColor: '#E6E0D2', boxShadow: 'none' },
    '.Input:focus': { borderColor: '#1A3D2B', boxShadow: '0 0 0 3px rgba(26,61,43,0.12)' },
    '.Tab': { borderColor: '#E6E0D2', boxShadow: 'none' },
    '.Tab--selected': { borderColor: '#1A3D2B', boxShadow: '0 0 0 1px #1A3D2B' },
  },
}

interface StripeCheckoutProps {
  clientSecret: string
  /** Compte connecté qui encaisse (paiement direct) ; absent en mode démo. */
  stripeAccount?: string | null
  returnUrl: string
  /** The page's sticky "Pay" button calls the registered function. */
  registerPay: (pay: (() => Promise<void>) | null) => void
  onSuccess: () => void
  onError: (message: string) => void
  onBusyChange: (busy: boolean) => void
}

function PayForm({ returnUrl, registerPay, onSuccess, onError, onBusyChange }: Omit<StripeCheckoutProps, 'clientSecret' | 'stripeAccount'>) {
  const stripe = useStripe()
  const elements = useElements()

  useEffect(() => {
    if (!stripe || !elements) return
    registerPay(async () => {
      onError('')
      onBusyChange(true)
      try {
        const submitted = await elements.submit()
        if (submitted.error) {
          onError(submitted.error.message ?? 'Vérifiez les informations de paiement.')
          return
        }
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: { return_url: returnUrl },
          redirect: 'if_required', // cards finish inline; 3-D Secure / wallets redirect and come back to returnUrl
        })
        if (error) {
          onError(error.message ?? 'Le paiement a échoué. Aucun montant n’a été débité.')
        } else if (paymentIntent && ['succeeded', 'processing'].includes(paymentIntent.status)) {
          onSuccess()
        } else {
          onError('Le paiement n’a pas pu être confirmé. Réessayez.')
        }
      } finally {
        onBusyChange(false)
      }
    })
    return () => registerPay(null)
  }, [stripe, elements, returnUrl, registerPay, onSuccess, onError, onBusyChange])

  return (
    <PaymentElement
      options={{
        layout: { type: 'accordion', defaultCollapsed: false, radios: 'never', spacedAccordionItems: true },
        // Apple Pay / Google Pay appear automatically on compatible devices once the domain is registered in Stripe.
        wallets: { applePay: 'auto', googlePay: 'auto' },
      }}
    />
  )
}

export function StripeCheckout({ clientSecret, stripeAccount, ...rest }: StripeCheckoutProps) {
  const stripePromise = getStripePromise(stripeAccount)
  const options = useMemo(() => ({ clientSecret, appearance: APPEARANCE, locale: 'fr' as const }), [clientSecret])
  if (!stripePromise) return null
  return (
    <Elements stripe={stripePromise} options={options}>
      <PayForm {...rest} />
    </Elements>
  )
}
