'use client'

import { useState, useTransition } from 'react'
import { setUserActiveAction, setUserRoleAction } from '@/app/actions/admin'
import { ROLE_LABELS, USER_ROLES, type AssignableRole } from '@/lib/admin/schemas'
import type { ActionState } from '@/lib/provider/schemas'

export function UserRowActions({
  userId,
  name,
  role,
  active,
  isSelf,
}: {
  userId: string
  name: string
  role: AssignableRole
  active: boolean
  isSelf: boolean
}) {
  const [pending, start] = useTransition()
  const [result, setResult] = useState<ActionState | null>(null)

  const run = (fn: () => Promise<ActionState>) =>
    start(async () => {
      setResult(await fn())
    })

  if (isSelf) return <span className="text-xs text-white/40">Vous</span>

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor={`role-${userId}`}>Rôle de {name}</label>
        <select
          id={`role-${userId}`}
          value={role}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value as AssignableRole
            if (window.confirm(`Passer ${name} en « ${ROLE_LABELS[next]} » ?`)) run(() => setUserRoleAction(userId, next))
            else e.target.value = role
          }}
          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-turquoise/50"
        >
          {USER_ROLES.map((r) => (
            <option key={r} value={r} className="text-black">{ROLE_LABELS[r]}</option>
          ))}
        </select>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (active && !window.confirm(`Désactiver le compte de ${name} ?`)) return
            run(() => setUserActiveAction(userId, !active))
          }}
          className={`text-xs px-3 py-1.5 rounded-lg border disabled:opacity-40 ${
            active ? 'border-white/10 text-white/60 hover:bg-white/10' : 'border-green-400/30 text-green-300 bg-green-500/10 hover:bg-green-500/20'
          }`}
        >
          {active ? 'Désactiver' : 'Réactiver'}
        </button>
      </div>
      {result?.error && <p role="alert" className="text-[11px] text-red-400">{result.error}</p>}
    </div>
  )
}
