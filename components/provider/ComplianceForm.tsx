'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/Button'
import { saveComplianceAction } from '@/app/actions/provider'
import { Field, inputClass } from './ui'
import { LEGAL_STATUSES, LEGAL_STATUS_LABELS } from '@/lib/provider/compliance'
import type { ActionState } from '@/lib/provider/schemas'
import type { ProviderRow } from '@/lib/provider/context'
import { Link } from '@/lib/i18n/navigation'

export function ComplianceForm({ provider }: { provider: Pick<ProviderRow, 'legal_status' | 'siret' | 'vat_number' | 'insurance_confirmed' | 'insurance_expires_on' | 'compliance_verified_at'> }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveComplianceAction, {})
  const err = state.fieldErrors ?? {}

  return (
    <form action={action} className="bg-coconut rounded-card border border-mist p-5 space-y-4" aria-labelledby="compliance-title">
      <div>
        <h2 id="compliance-title" className="text-sm font-semibold text-deep-green">Statut professionnel</h2>
        <p className="mt-1 text-xs text-stone">
          Ohaana met en relation des professionnels déclarés. Ces informations ne sont jamais publiques ; l’équipe les vérifie avant la validation de votre dossier.
        </p>
        {provider.compliance_verified_at ? (
          <p className="mt-2 text-xs font-medium text-turquoise-text">Dossier vérifié le {new Date(provider.compliance_verified_at).toLocaleDateString('fr-FR')}. Toute modification demandera une nouvelle vérification.</p>
        ) : (
          <p className="mt-2 text-xs text-stone">Dossier en attente de vérification.</p>
        )}
      </div>

      <Field label="Statut" htmlFor="legal_status" error={err.legal_status}>
        <select id="legal_status" name="legal_status" defaultValue={provider.legal_status ?? ''} required className={inputClass}>
          <option value="" disabled>Choisir…</option>
          {LEGAL_STATUSES.map((s) => <option key={s} value={s}>{LEGAL_STATUS_LABELS[s]}</option>)}
        </select>
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="SIRET" htmlFor="siret" error={err.siret} hint="14 chiffres. Obligatoire pour un micro-entrepreneur ou une entreprise.">
          <input id="siret" name="siret" inputMode="numeric" defaultValue={provider.siret ?? ''} maxLength={20} className={inputClass} />
        </Field>
        <Field label="N° de TVA (si assujetti)" htmlFor="vat_number" error={err.vat_number}>
          <input id="vat_number" name="vat_number" defaultValue={provider.vat_number ?? ''} maxLength={20} className={inputClass} />
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 items-end">
        <label className="flex items-start gap-2.5 text-sm text-charcoal">
          <input type="checkbox" name="insurance_confirmed" defaultChecked={provider.insurance_confirmed} className="mt-0.5 h-4 w-4 accent-deep-green" />
          <span>J’ai une assurance responsabilité civile professionnelle en cours de validité.</span>
        </label>
        <Field label="Fin de validité de l’assurance" htmlFor="insurance_expires_on" error={err.insurance_expires_on}>
          <input id="insurance_expires_on" name="insurance_expires_on" type="date" defaultValue={provider.insurance_expires_on ?? ''} className={inputClass} />
        </Field>
      </div>

      <div>
        <label className="flex items-start gap-2.5 text-sm text-charcoal">
          <input type="checkbox" name="accept_provider_terms" required className="mt-0.5 h-4 w-4 accent-deep-green" />
          <span>
            J’ai lu et j’accepte les <Link href="/provider-terms" className="text-deep-green underline underline-offset-2">conditions générales prestataire</Link>, et je certifie l’exactitude de ces informations.
          </span>
        </label>
        {err.accept_provider_terms && <p role="alert" className="mt-1 text-xs text-danger">{err.accept_provider_terms}</p>}
      </div>

      {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state.message && <p role="status" className="text-sm text-turquoise-text">{state.message}</p>}
      <Button size="sm" type="submit" disabled={pending} className="rounded-full">{pending ? 'Enregistrement…' : 'Enregistrer'}</Button>
    </form>
  )
}
