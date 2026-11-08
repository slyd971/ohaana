'use client'

import { useState, useTransition } from 'react'
import { setLeadStatusAction, setConciergeRequestStatusAction } from '@/app/actions/admin'
import { LEAD_LABELS, LEAD_STATUSES } from '@/lib/admin/schemas'

export function LeadStatusSelect({ leadId, status, email, kind = 'lead' }: { leadId: string; status: (typeof LEAD_STATUSES)[number]; email: string; kind?: 'lead' | 'concierge' }) {
  const setStatus = kind === 'concierge' ? setConciergeRequestStatusAction : setLeadStatusAction
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  return (
    <div>
      <label className="sr-only" htmlFor={`lead-${leadId}`}>Statut du lead {email}</label>
      <select
        id={`lead-${leadId}`}
        value={status}
        disabled={pending}
        onChange={(e) =>
          start(async () => {
            const res = await setStatus(leadId, e.target.value as (typeof LEAD_STATUSES)[number])
            setError(res.error ?? null)
          })
        }
        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-turquoise/50"
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s} className="text-black">{LEAD_LABELS[s]}</option>
        ))}
      </select>
      {error && <p role="alert" className="text-[11px] text-red-400 mt-1">{error}</p>}
    </div>
  )
}
