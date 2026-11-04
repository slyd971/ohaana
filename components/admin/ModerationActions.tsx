'use client'

import { useState, useTransition } from 'react'
import { publishServiceAction, rejectServiceAction, setServiceFeaturedAction } from '@/app/actions/admin'
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
  if (result.error) return <p role="alert" className="text-xs text-red-400 mt-2">{result.error}</p>
  if (result.message) return <p role="status" className="text-xs text-green-400 mt-2">{result.message}</p>
  return null
}

export function ReviewActions({ serviceId, providerApproved }: { serviceId: string; providerApproved: boolean }) {
  const { pending, result, run } = useRun()
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending || !providerApproved}
          title={providerApproved ? undefined : 'Approuvez d’abord le prestataire'}
          onClick={() => run(() => publishServiceAction(serviceId))}
          className="text-xs bg-green-500/20 text-green-300 border border-green-400/30 px-3 py-1.5 rounded-lg hover:bg-green-500/30 disabled:opacity-40"
        >
          Publier
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setRejecting((v) => !v)}
          className="text-xs bg-white/5 text-white/70 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/10 disabled:opacity-40"
        >
          Refuser…
        </button>
      </div>
      {rejecting && (
        <div className="mt-3 space-y-2">
          <label htmlFor={`reason-${serviceId}`} className="block text-xs text-white/60">
            Motif (visible par le prestataire)
          </label>
          <textarea
            id={`reason-${serviceId}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-turquoise/50"
            placeholder="Ex. : photos manquantes, description trop courte…"
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => rejectServiceAction(serviceId, reason))}
            className="text-xs bg-red-500/20 text-red-300 border border-red-400/30 px-3 py-1.5 rounded-lg hover:bg-red-500/30 disabled:opacity-40"
          >
            Confirmer le refus
          </button>
        </div>
      )}
      <Feedback result={result} />
    </div>
  )
}

export function FeatureToggle({ serviceId, featured }: { serviceId: string; featured: boolean }) {
  const { pending, result, run } = useRun()
  return (
    <div className="text-right">
      <button
        type="button"
        disabled={pending}
        aria-pressed={featured}
        onClick={() => run(() => setServiceFeaturedAction(serviceId, !featured))}
        className={`text-xs px-3 py-1.5 rounded-lg border disabled:opacity-40 ${
          featured ? 'bg-turquoise/20 text-turquoise border-turquoise/30' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
        }`}
      >
        {featured ? 'En avant ✓' : 'Mettre en avant'}
      </button>
      <Feedback result={result} />
    </div>
  )
}
