import { z } from 'zod'

export const USER_ROLES = ['tourist', 'provider', 'partner', 'concierge', 'admin'] as const
export type AssignableRole = (typeof USER_ROLES)[number]

export const ROLE_LABELS: Record<AssignableRole, string> = {
  tourist: 'Voyageur',
  provider: 'Prestataire',
  partner: 'Partenaire',
  concierge: 'Conciergerie',
  admin: 'Administrateur',
}

export const LEAD_STATUSES = ['new', 'contacted', 'converted', 'discarded'] as const
export const LEAD_LABELS: Record<(typeof LEAD_STATUSES)[number], string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  converted: 'Converti',
  discarded: 'Écarté',
}

const name = (label: string) =>
  z
    .string({ error: `${label} requis` })
    .trim()
    .min(2, { error: `${label} : 2 caractères minimum` })
    .max(60, { error: `${label} : 60 caractères maximum` })

export const categorySchema = z.object({
  name_fr: name('Nom (FR)'),
  name_en: name('Nom (EN)'),
  name_es: name('Nom (ES)'),
  icon: z
    .string()
    .trim()
    .max(8, { error: 'Icône : 8 caractères maximum' })
    .optional()
    .transform((v) => (v ? v : null)),
  color: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^#[0-9a-fA-F]{6}$/.test(v), { error: 'Couleur : format #RRGGBB' }),
  sort_order: z.coerce
    .number({ error: 'Ordre invalide' })
    .int({ error: 'Ordre : nombre entier' })
    .min(0, { error: 'Ordre : 0 minimum' })
    .max(999, { error: 'Ordre : 999 maximum' }),
})
