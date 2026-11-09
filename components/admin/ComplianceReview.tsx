'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { verifyProviderComplianceAction } from '@/app/actions/admin'
import { LEGAL_STATUS_LABELS, complianceProblems, insuranceExpiresSoon, type LegalStatus } from '@/lib/provider/compliance'

interface Props {
  providerId: string
  legalStatus: string | null
  siret: string | null
  vatNumber: string | null
  insuranceConfirmed: boolean
  insuranceExpiresOn: string | null
  verifiedAt: string | null
  note: string | null
  acceptedProviderTerms: string | null
}

export function ComplianceReview(p: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [note, setNote] = useState(p.note ?? '')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const problems = complianceProblems({ legal_status: p.legalStatus, siret: p.siret, insurance_confirmed: p.insuranceConfirmed, insurance_expires_on: p.insuranceExpiresOn })
  const soon = insuranceExpiresSoon(p.insuranceExpiresOn)

  function run(verified: boolean) {
    setMsg(null)
    start(async () => {
      const res = await verifyProviderComplianceAction(p.providerId, verified, note)
      if (res.error) setMsg({ ok: false, text: res.error })
      else {
        setMsg({ ok: true, text: res.message ?? 'Enregistré.' })
        router.refresh()
      }
    })
  }

  const row = (k: string, v: string) => (
    <div className="flex justify-between gap-4 text-sm"><dt className="text-white/40">{k}</dt><dd className="text-white/80 text-right">{v}</dd></div>
  )

  return (
    <section aria-labelledby="compliance-title" className="space-y-3">
      <h2 id="compliance-title" className="text-sm font-semibold text-white/80">Vérification du dossier</h2>
      <div className="space-y-4 rounded-card border border-white/10 bg-white/5 p-4">
        <dl className="space-y-1.5">
          {row('Statut déclaré', p.legalStatus ? LEGAL_STATUS_LABELS[p.legalStatus as LegalStatus] ?? p.legalStatus : '—')}
          {row('SIRET', p.siret ?? '—')}
          {row('N° de TVA', p.vatNumber ?? '—')}
          {row('Assurance RC pro', p.insuranceConfirmed ? `confirmée${p.insuranceExpiresOn ? `, jusqu’au ${p.insuranceExpiresOn}` : ''}` : 'non confirmée')}
          {row('CGU prestataire acceptées', p.acceptedProviderTerms ? `version ${p.acceptedProviderTerms}` : 'non')}
        </dl>

        {problems.length > 0 && (
          <ul className="space-y-1 text-xs text-amber-300">
            {problems.map((x) => <li key={x}>⚠ {x}</li>)}
          </ul>
        )}
        {soon && p.insuranceConfirmed && <p className="text-xs text-amber-300">⚠ L’assurance expire dans moins de 30 jours.</p>}
        <p className="text-xs text-white/40">
          À contrôler vous-même : le SIRET existe et correspond à l’activité (annuaire des entreprises), l’attestation d’assurance est lisible et à jour, l’identité correspond au titulaire. Ces vérifications ne sont pas automatisées.
        </p>

        <label className="block text-xs text-white/50" htmlFor="compliance-note">Note interne (non visible du prestataire)</label>
        <textarea id="compliance-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={1000} className="w-full rounded-control border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-turquoise/50" />

        <div className="flex flex-wrap items-center gap-3">
          {p.verifiedAt ? (
            <>
              <span className="text-xs text-turquoise">Vérifié le {new Date(p.verifiedAt).toLocaleDateString('fr-FR')}</span>
              <button type="button" disabled={pending} onClick={() => run(false)} className="rounded-control border border-white/15 px-4 py-2 text-xs text-white/70 hover:bg-white/10 disabled:opacity-50">Retirer la vérification</button>
            </>
          ) : (
            <button type="button" disabled={pending || problems.length > 0} onClick={() => run(true)} className="rounded-control border border-turquoise/30 bg-turquoise/20 px-4 py-2 text-xs text-turquoise hover:bg-turquoise/30 disabled:opacity-40">Marquer comme vérifié</button>
          )}
        </div>
        {msg && <p role={msg.ok ? 'status' : 'alert'} className={`text-xs ${msg.ok ? 'text-turquoise' : 'text-red-400'}`}>{msg.text}</p>}
      </div>
    </section>
  )
}
