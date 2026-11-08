'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { adminOnboardingLinkAction, adminRefreshPaymentsStatusAction } from '@/app/actions/admin'
import type { ConnectState } from '@/lib/stripe/connect-status'

const LABELS: Record<ConnectState, string> = {
  none: 'Aucun compte de paiement',
  incomplete: 'Informations manquantes',
  pending: 'En vérification chez Stripe',
  active: 'Actif : peut recevoir des paiements',
  closed: 'Fermé',
}

export function AdminPaymentsPanel({ providerId, initialState }: { providerId: string; initialState: ConnectState }) {
  const [state, setState] = useState<ConnectState>(initialState)
  const [link, setLink] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, start] = useTransition()

  return (
    <div className="bg-white/5 rounded-card border border-white/8 p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">Paiements du prestataire (Stripe)</p>
          <p className={`text-xs mt-0.5 ${state === 'active' ? 'text-green-400' : 'text-white/50'}`}>{LABELS[state]}</p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setMessage(null)
              const res = await adminRefreshPaymentsStatusAction(providerId)
              if (res.state) setState(res.state)
              else setMessage(res.error ?? 'Actualisation impossible.')
            })
          }
          className="text-xs border border-white/10 text-white/70 px-3 py-1.5 rounded-lg hover:bg-white/10 disabled:opacity-40"
        >
          Actualiser
        </button>
      </div>

      {state !== 'active' && state !== 'closed' && (
        <div className="space-y-2">
          <Button
            variant="soft"
            size="bare"
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                setMessage(null)
                const res = await adminOnboardingLinkAction(providerId)
                if (res.url) setLink(res.url)
                else setMessage(res.error ?? 'Lien indisponible.')
              })
            }
            className="text-xs px-3 py-1.5 rounded-lg"
          >
            Générer le lien d’inscription
          </Button>
          <p className="text-[11px] text-white/40">
            Pour accompagner le prestataire pendant un appel. Le lien est à usage unique et ouvre la saisie de son identité et de son IBAN : il doit
            être ouvert par lui (partage d’écran), jamais envoyé par message ni par e-mail.
          </p>
        </div>
      )}

      {link && (
        <a href={link} target="_blank" rel="noopener noreferrer" className="block text-xs text-turquoise underline break-all">
          Ouvrir le formulaire Stripe
        </a>
      )}
      {message && <p role="alert" className="text-xs text-red-400">{message}</p>}
    </div>
  )
}
