'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, Clock3, CreditCard, ShieldCheck } from 'lucide-react'
import { refreshPaymentsStatusAction, startPaymentsOnboardingAction } from '@/app/actions/provider'
import type { ConnectState } from '@/lib/stripe/connect-status'

const COPY: Record<ConnectState, { title: string; body: string; button: string | null; tone: string }> = {
  none: {
    title: 'Configurez vos paiements',
    body: 'Pour recevoir l’argent de vos réservations sur votre compte bancaire, Stripe (notre partenaire de paiement) vous demande une seule fois votre identité, votre adresse et votre IBAN. Cela prend 5 à 10 minutes.',
    button: 'Configurer mes paiements',
    tone: 'border-coral/30 bg-coral/5',
  },
  incomplete: {
    title: 'Il manque des informations',
    body: 'Votre compte de paiement est créé, mais Stripe attend encore des informations de votre part. Reprenez là où vous vous êtes arrêté.',
    button: 'Continuer la configuration',
    tone: 'border-star/40 bg-star/10',
  },
  pending: {
    title: 'Stripe vérifie vos informations',
    body: 'Tout est fourni. La vérification prend de quelques minutes à quelques jours. Vous pourrez recevoir des réservations dès qu’elle est terminée.',
    button: null,
    tone: 'border-mist bg-sand',
  },
  active: {
    title: 'Vos paiements sont actifs',
    body: 'Vous pouvez recevoir des réservations. L’argent est versé par Stripe sur votre compte bancaire, commission d’Ohaana déduite.',
    button: null,
    tone: 'border-turquoise/30 bg-turquoise/10',
  },
  closed: {
    title: 'Compte de paiement fermé',
    body: 'Contactez-nous pour en ouvrir un nouveau.',
    button: null,
    tone: 'border-mist bg-sand',
  },
}

export function PaymentsSetup({ initialState, approved }: { initialState: ConnectState; approved: boolean }) {
  const [state, setState] = useState<ConnectState>(initialState)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const copy = COPY[state]
  const Icon = state === 'active' ? CheckCircle2 : state === 'pending' ? Clock3 : CreditCard

  function open() {
    setMessage(null)
    start(async () => {
      const res = await startPaymentsOnboardingAction()
      if (res.url) {
        window.location.assign(res.url) // lien à usage unique, ouvert dans cet onglet
        return
      }
      setMessage(res.error ?? 'Impossible d’ouvrir la configuration pour le moment.')
    })
  }

  function refresh() {
    setMessage(null)
    start(async () => {
      const res = await refreshPaymentsStatusAction()
      if (res.state) setState(res.state)
      else setMessage(res.error ?? 'Actualisation impossible.')
    })
  }

  return (
    <section aria-labelledby="payments-setup-title" className={`rounded-card border p-5 space-y-3 ${copy.tone}`}>
      <div className="flex items-start gap-3">
        <Icon size={20} className="mt-0.5 flex-none text-deep-green" />
        <div className="space-y-1">
          <h2 id="payments-setup-title" className="text-sm font-semibold text-charcoal">{copy.title}</h2>
          <p className="text-xs text-stone leading-relaxed">{copy.body}</p>
        </div>
      </div>

      {!approved && state === 'none' ? (
        <p className="text-xs text-stone">Cette étape sera disponible dès que notre équipe aura approuvé votre dossier.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {copy.button && (
            <Button size="sm" type="button" disabled={pending} onClick={open} className="rounded-full">
              {pending ? 'Ouverture…' : copy.button}
            </Button>
          )}
          {state !== 'none' && state !== 'closed' && (
            <button type="button" disabled={pending} onClick={refresh} className="border border-mist text-stone px-4 py-2.5 rounded-full text-sm hover:bg-sand disabled:opacity-60">
              Actualiser l’état
            </button>
          )}
        </div>
      )}

      {state === 'none' || state === 'incomplete' ? (
        <p className="flex items-center gap-1.5 text-[11px] text-stone">
          <ShieldCheck size={12} /> Vos pièces d’identité et votre IBAN sont saisis sur le site de Stripe : Ohaana ne les voit jamais.
        </p>
      ) : null}
      {message && <p role="alert" className="text-xs text-danger">{message}</p>}
    </section>
  )
}
