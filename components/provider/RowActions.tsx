'use client'

import { useState, useTransition } from 'react'
import { setBookingStatusAction, setServiceArchivedAction, submitServiceAction } from '@/app/actions/provider'
import type { ActionState } from '@/lib/provider/schemas'

function useRun() {
  const [pending, start] = useTransition()
  const [result, setResult] = useState<ActionState | null>(null)
  const run = (fn: () => Promise<ActionState>) =>
    start(async () => {
      setResult(await fn())
    })
  return { pending, result, run }
}

function Feedback({ result }: { result: ActionState | null }) {
  if (!result) return null
  if (result.error) return <p role="alert" className="text-[11px] text-[#C0392B] mt-1">{result.error}</p>
  if (result.message) return <p role="status" className="text-[11px] text-turquoise mt-1">{result.message}</p>
  return null
}

const primary =
  'text-xs bg-deep-green text-coconut px-3 py-1.5 rounded-lg hover:bg-deep-green/90 disabled:opacity-60 transition-colors'
const secondary =
  'text-xs border border-mist text-stone px-3 py-1.5 rounded-lg hover:bg-sand disabled:opacity-60 transition-colors'

export function ServiceActions({ id, status }: { id: string; status: string }) {
  const { pending, result, run } = useRun()
  const canSubmit = status === 'draft' || status === 'rejected'
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {canSubmit && (
          <button type="button" disabled={pending} onClick={() => run(() => submitServiceAction(id))} className={primary}>
            Soumettre à la relecture
          </button>
        )}
        {status !== 'archived' ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (window.confirm('Retirer cette fiche du site ? Vous pourrez la remettre en brouillon ensuite.')) {
                run(() => setServiceArchivedAction(id, true))
              }
            }}
            className={secondary}
          >
            Archiver
          </button>
        ) : (
          <button type="button" disabled={pending} onClick={() => run(() => setServiceArchivedAction(id, false))} className={secondary}>
            Remettre en brouillon
          </button>
        )}
      </div>
      <Feedback result={result} />
    </div>
  )
}

export function BookingActions({
  id,
  status,
  past,
}: {
  id: string
  status: string
  past: boolean
}) {
  const { pending, result, run } = useRun()
  const canComplete = status === 'confirmed' && past
  const canCancel = status === 'confirmed' || status === 'pending'
  if (!canComplete && !canCancel) return null
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {canComplete && (
          <button type="button" disabled={pending} onClick={() => run(() => setBookingStatusAction(id, 'completed'))} className={primary}>
            Marquer comme terminée
          </button>
        )}
        {canCancel && (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (window.confirm('Annuler cette réservation ? Le voyageur sera remboursé intégralement.')) {
                run(() => setBookingStatusAction(id, 'cancelled_provider'))
              }
            }}
            className={secondary}
          >
            Annuler (remboursement intégral)
          </button>
        )}
      </div>
      <Feedback result={result} />
    </div>
  )
}
