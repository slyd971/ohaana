'use client'

import { useState, useTransition } from 'react'
import { retryRefundAction } from '@/app/actions/admin'
import { eur } from '@/components/provider/ui'
import type { ActionState } from '@/lib/provider/schemas'

export interface PendingRefund {
  booking_id: string
  service_title: string
  status: string
  cancelled_at: string | null
  total_cents: number
  expected_cents: number
  refunded_cents: number
}

function Row({ r }: { r: PendingRefund }) {
  const [pending, start] = useTransition()
  const [result, setResult] = useState<ActionState | null>(null)
  return (
    <li className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm text-white truncate">{r.service_title}</p>
        <p className="text-xs text-white/40">
          Dû {eur(r.expected_cents)} · déjà remboursé {eur(r.refunded_cents)} · payé {eur(r.total_cents)}
          {r.cancelled_at && ` · annulée le ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(r.cancelled_at))}`}
        </p>
        {result?.error && <p role="alert" className="text-[11px] text-red-400 mt-1">{result.error}</p>}
        {result?.message && <p role="status" className="text-[11px] text-green-400 mt-1">{result.message}</p>}
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => setResult(await retryRefundAction(r.booking_id)))}
        className="flex-none text-xs bg-turquoise/20 text-turquoise border border-turquoise/30 px-3 py-1.5 rounded-lg hover:bg-turquoise/30 disabled:opacity-40"
      >
        {pending ? 'Envoi…' : 'Relancer le remboursement'}
      </button>
    </li>
  )
}

export function PendingRefunds({ rows }: { rows: PendingRefund[] }) {
  return (
    <section aria-labelledby="refunds-title" className="bg-white/5 rounded-2xl border border-[#F5A623]/30 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/8">
        <h2 id="refunds-title" className="text-sm font-semibold text-white">Remboursements à traiter ({rows.length})</h2>
        <p className="text-xs text-white/40 mt-0.5">Annulations enregistrées dont le remboursement n’est pas (entièrement) parti vers le voyageur.</p>
      </div>
      <ul className="divide-y divide-white/5">
        {rows.map((r) => (
          <Row key={r.booking_id} r={r} />
        ))}
      </ul>
    </section>
  )
}
