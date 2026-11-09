import { z } from 'zod'

// Statut professionnel déclaré par le prestataire et règles de contrôle de l'équipe. Fonctions pures.
// Ce ne sont PAS des conseils juridiques : les règles ci-dessous sont un premier filtre à faire valider par un juriste.

export const LEGAL_STATUSES = ['particulier', 'micro_entrepreneur', 'entreprise', 'association'] as const
export type LegalStatus = (typeof LEGAL_STATUSES)[number]

export const LEGAL_STATUS_LABELS: Record<LegalStatus, string> = {
  particulier: 'Particulier (sans immatriculation)',
  micro_entrepreneur: 'Micro-entrepreneur / auto-entrepreneur',
  entreprise: 'Entreprise (société ou entreprise individuelle)',
  association: 'Association',
}

export const normaliseSiret = (v: string) => v.replace(/[\s.]/g, '')

/** Clé de Luhn : un SIRET (14 chiffres) valide la passe. La Poste (SIREN 356000000) fait exception, non gérée ici. */
export function isValidSiret(raw: string): boolean {
  const v = normaliseSiret(raw)
  if (!/^\d{14}$/.test(v)) return false
  let sum = 0
  for (let i = 0; i < 14; i++) {
    let d = Number(v[i])
    if (i % 2 === 0) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
  }
  return sum % 10 === 0
}

export const complianceSchema = z.object({
  legal_status: z.enum(LEGAL_STATUSES, { error: 'Choisissez votre statut' }),
  siret: z
    .string()
    .optional()
    .transform((v) => normaliseSiret(v ?? ''))
    .refine((v) => v === '' || isValidSiret(v), { error: 'SIRET invalide (14 chiffres)' }),
  vat_number: z.string().trim().max(20, { error: '20 caractères maximum' }).optional(),
  insurance_confirmed: z.boolean(),
  insurance_expires_on: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), { error: 'Date invalide' }),
})
export type ComplianceInput = z.infer<typeof complianceSchema>

export interface ComplianceFacts {
  legal_status: string | null
  siret: string | null
  insurance_confirmed: boolean
  insurance_expires_on: string | null
}

/** Ce qui empêche de valider le dossier (liste vide = dossier complet, prêt pour la vérification humaine). */
export function complianceProblems(f: ComplianceFacts, today = new Date()): string[] {
  const out: string[] = []
  if (!f.legal_status) {
    out.push('Statut professionnel non renseigné')
    return out
  }
  if (f.legal_status === 'particulier') {
    out.push('Statut « particulier » : une activité rémunérée et régulière exige une immatriculation (risque de travail dissimulé), à examiner avec le prestataire')
  }
  if ((f.legal_status === 'micro_entrepreneur' || f.legal_status === 'entreprise') && !f.siret) {
    out.push('SIRET manquant')
  }
  if (f.siret && !isValidSiret(f.siret)) out.push('SIRET invalide')
  if (!f.insurance_confirmed) out.push('Assurance responsabilité civile professionnelle non confirmée')
  if (f.insurance_confirmed && f.insurance_expires_on && f.insurance_expires_on < today.toISOString().slice(0, 10)) {
    out.push('Assurance expirée')
  }
  return out
}

/** Dossier à refaire vérifier bientôt : assurance expirant dans moins de 30 jours. */
export function insuranceExpiresSoon(expires: string | null, today = new Date(), days = 30): boolean {
  if (!expires) return false
  const limit = new Date(today.getTime() + days * 86_400_000).toISOString().slice(0, 10)
  return expires <= limit
}
