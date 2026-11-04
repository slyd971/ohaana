'use client'

import { useState, useTransition } from 'react'
import { setServiceStatusAsAdminAction } from '@/app/actions/admin'
import type { ActionState } from '@/lib/provider/schemas'

const btn = 'text-xs border border-white/10 text-white/70 px-3 py-1.5 rounded-lg hover:bg-white/10 disabled:opacity-40'

export function ServiceStatusActions({ serviceId, status }: { serviceId: string; status: string }) {
  const [pending, start] = useTransition()
  const [result, setResult] = useState<ActionState | null>(null)
  const set = (next: 'draft' | 'published' | 'archived') =>
    start(async () => {
      setResult(await setServiceStatusAsAdminAction(serviceId, next))
    })

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {status !== 'published' && (
          <button type="button" disabled={pending} onClick={() => set('published')} className="text-xs bg-green-500/20 text-green-300 border border-green-400/30 px-3 py-1.5 rounded-lg hover:bg-green-500/30 disabled:opacity-40">
            Publier
          </button>
        )}
        {status === 'published' && (
          <button type="button" disabled={pending} onClick={() => set('draft')} className={btn}>Dépublier</button>
        )}
        {status !== 'archived' ? (
          <button type="button" disabled={pending} onClick={() => set('archived')} className={btn}>Archiver</button>
        ) : (
          <button type="button" disabled={pending} onClick={() => set('draft')} className={btn}>Remettre en brouillon</button>
        )}
      </div>
      {result?.error && <p role="alert" className="text-xs text-red-400 mt-2">{result.error}</p>}
      {result?.message && <p role="status" className="text-xs text-green-400 mt-2">{result.message}</p>}
    </div>
  )
}
