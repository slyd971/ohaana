'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { setUserActiveAction, setUserRoleAction } from '@/app/actions/admin'
import { ROLE_LABELS, USER_ROLES, type AssignableRole } from '@/lib/admin/schemas'
import { ConfirmButton } from '@/components/ui/ConfirmButton'
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
  const [nextRole, setNextRole] = useState<AssignableRole | null>(null)

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
          value={nextRole ?? role}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value as AssignableRole
            setNextRole(next === role ? null : next)
          }}
          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-turquoise/50"
        >
          {USER_ROLES.map((r) => (
            <option key={r} value={r} className="text-black">{ROLE_LABELS[r]}</option>
          ))}
        </select>
        {active ? (
          <ConfirmButton
            tone="dark"
            label="Désactiver"
            ariaLabel={`Désactiver ${name}`}
            message={`Désactiver le compte de ${name} ?`}
            confirmLabel="Désactiver"
            disabled={pending}
            onConfirm={() => run(() => setUserActiveAction(userId, false))}
            className="text-xs px-3 py-1.5 rounded-lg border disabled:opacity-40 border-white/10 text-white/60 hover:bg-white/10"
          />
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setUserActiveAction(userId, true))}
            className="text-xs px-3 py-1.5 rounded-lg border disabled:opacity-40 border-green-400/30 text-green-300 bg-green-500/10 hover:bg-green-500/20"
          >
            Réactiver
          </button>
        )}
      </div>
      {nextRole && (
        <div role="group" aria-label="Confirmer le changement de rôle" className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-white/70">Passer {name} en « {ROLE_LABELS[nextRole]} » ?</span>
          <Button
            variant="soft"
            size="bare"
            type="button"
            disabled={pending}
            onClick={() => {
              const target = nextRole
              setNextRole(null)
              run(() => setUserRoleAction(userId, target))
            }}
            className="text-xs px-3 py-1.5 rounded-lg"
          >
            Confirmer
          </Button>
          <button type="button" onClick={() => setNextRole(null)} className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/60 hover:bg-white/10">
            Annuler
          </button>
        </div>
      )}
      {result?.error && <p role="alert" className="text-[11px] text-red-400">{result.error}</p>}
    </div>
  )
}
