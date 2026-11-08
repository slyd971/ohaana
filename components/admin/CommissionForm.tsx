'use client'

import { useState, useTransition } from 'react'
import { setCommissionPctAction } from '@/app/actions/admin'
import { computeCommission } from '@/lib/utils'
import { Field, eur, inputClass } from '@/components/provider/ui'
import { Button } from '@/components/ui/Button'
import type { ActionState } from '@/lib/provider/schemas'

export function CommissionForm({ current }: { current: number }) {
  const [value, setValue] = useState(String(current))
  const [pending, start] = useTransition()
  const [result, setResult] = useState<ActionState | null>(null)

  const pct = Number(value.replace(',', '.'))
  const valid = Number.isFinite(pct) && pct >= 0 && pct <= 50
  const example = valid ? computeCommission(10000, pct) : null

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        if (!valid) {
          setResult({ error: 'Le taux doit être compris entre 0 et 50 %.' })
          return
        }
        start(async () => setResult(await setCommissionPctAction(pct)))
      }}
      className="bg-coconut rounded-card border border-mist p-5 space-y-4"
    >
      <Field label="Commission d’Ohaana (%)" htmlFor="commission" hint="Entre 0 et 50. Prélevée sur la part du prestataire : le voyageur paie toujours le prix affiché.">
        <input id="commission" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} className={`${inputClass} max-w-[10rem]`} />
      </Field>
      {example && (
        <p className="text-xs text-stone">
          Exemple pour une réservation de {eur(10000)} : Ohaana garde <strong className="text-charcoal">{eur(example.platformFee)}</strong>, le prestataire reçoit{' '}
          <strong className="text-charcoal">{eur(example.providerAmount)}</strong>.
        </p>
      )}
      <p className="text-[11px] text-stone">
        S’applique aux <strong>nouvelles</strong> réservations. Les paiements déjà créés gardent leur répartition.
      </p>
      {result?.error && <p role="alert" className="text-sm text-danger">{result.error}</p>}
      {result?.message && <p role="status" className="text-sm text-turquoise">{result.message}</p>}
      <Button type="submit" size="sm" loading={pending} className="rounded-full">
        {pending ? 'Enregistrement…' : 'Enregistrer'}
      </Button>
    </form>
  )
}
