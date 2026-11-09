'use client'

import { useEffect, useMemo } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { Appearance } from '@stripe/stripe-js'
import { getStripePromise } from '@/lib/stripe/browser'

// Matches the Ohaana design tokens (deep green primary, coconut surfaces, rounded-control controls).
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
  const t = useTranslations('checkout')
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
          onError(submitted.error.message ?? t('checkDetails'))
          return
        }
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: { return_url: returnUrl },
          redirect: 'if_required', // cards finish inline; 3-D Secure / wallets redirect and come back to returnUrl
        })
        if (error) {
          onError(error.message ?? t('failedNoCharge'))
        } else if (paymentIntent && ['succeeded', 'processing'].includes(paymentIntent.status)) {
          onSuccess()
        } else {
          onError(t('notConfirmed'))
        }
      } finally {
        onBusyChange(false)
      }
    })
    return () => registerPay(null)
  }, [stripe, elements, returnUrl, registerPay, onSuccess, onError, onBusyChange, t])

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
  const current = useLocale()
  const stripeLocale = current === 'en' || current === 'es' ? current : 'fr'
  const options = useMemo(() => ({ clientSecret, appearance: APPEARANCE, locale: stripeLocale as 'fr' | 'en' | 'es' }), [clientSecret, stripeLocale])
  if (!stripePromise) return null
  return (
    <Elements stripe={stripePromise} options={options}>
      <PayForm {...rest} />
    </Elements>
  )
}
