import { z } from 'zod'

// Back-office prestataire : messages d'erreur en français (l'espace pro est FR pour l'instant, i18n au Prompt 9).

export const PROVIDER_ISLANDS = ['guadeloupe', 'martinique', 'saint_martin', 'saint_barth'] as const
export const ISLAND_LABELS: Record<(typeof PROVIDER_ISLANDS)[number], string> = {
  guadeloupe: 'Guadeloupe',
  martinique: 'Martinique',
  saint_martin: 'Saint-Martin',
  saint_barth: 'Saint-Barthélemy',
}

const text = (min: number, max: number, label: string) =>
  z
    .string({ error: `${label} requis` })
    .trim()
    .min(min, { error: `${label} : ${min} caractères minimum` })
    .max(max, { error: `${label} : ${max} caractères maximum` })

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, { error: `${label} : ${max} caractères maximum` })
    .optional()
    .transform((v) => (v ? v : null))

const int = (min: number, max: number, label: string) =>
  z.coerce
    .number({ error: `${label} invalide` })
    .int({ error: `${label} : nombre entier attendu` })
    .min(min, { error: `${label} : minimum ${min}` })
    .max(max, { error: `${label} : maximum ${max}` })

export const serviceSchema = z
  .object({
    title_fr: text(5, 120, 'Titre'),
    description_fr: text(30, 4000, 'Description'),
    title_en: optionalText(120, 'Titre (EN)'),
    description_en: optionalText(4000, 'Description (EN)'),
    category_id: z.uuid({ error: 'Catégorie requise' }),
    island: z.enum(PROVIDER_ISLANDS, { error: 'Île requise' }),
    price_euros: z.coerce
      .number({ error: 'Prix invalide' })
      .min(1, { error: 'Prix : minimum 1 €' })
      .max(10000, { error: 'Prix : maximum 10 000 €' }),
    price_unit: z.enum(['per_person', 'flat'], { error: 'Type de tarif requis' }),
    duration_min: int(15, 1439, 'Durée'),
    capacity_min: int(1, 100, 'Capacité minimale'),
    capacity_max: int(1, 100, 'Capacité maximale'),
    address: optionalText(200, 'Adresse'),
    tags: z
      .string()
      .optional()
      .transform((v) =>
        (v ?? '')
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
          .slice(0, 10),
      ),
    min_notice_hours: int(0, 720, 'Délai de prévenance'),
  })
  .refine((v) => v.capacity_min <= v.capacity_max, {
    error: 'La capacité minimale doit être inférieure ou égale à la capacité maximale',
    path: ['capacity_max'],
  })

export type ServiceInput = z.infer<typeof serviceSchema>

export const availabilitySchema = z.object({
  service_id: z.uuid(),
  weekdays: z
    .array(z.coerce.number().int().min(0).max(6))
    .min(1, { error: 'Choisissez au moins un jour' }),
  times: z
    .array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: 'Horaire invalide' }))
    .min(1, { error: 'Ajoutez au moins un horaire' })
    .max(12, { error: '12 horaires maximum' }),
  horizon_days: z.coerce.number().int().min(7).max(180),
})

export const profileSchema = z.object({
  business_name: text(2, 100, 'Nom commercial'),
  bio: optionalText(2000, 'Présentation'),
  phone: optionalText(30, 'Téléphone'),
  whatsapp: optionalText(30, 'WhatsApp'),
  island: z.enum(PROVIDER_ISLANDS, { error: 'Île requise' }),
  languages: z
    .string()
    .optional()
    .transform((v) =>
      (v ?? '')
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 8),
    ),
})

/** Étapes minimales pour soumettre un service à la relecture. */
export function submissionProblems(s: {
  title_fr: string
  description_fr: string | null
  price_cents: number
  duration_min: number | null
  capacity_min: number
  capacity_max: number
}): string[] {
  const problems: string[] = []
  if (s.title_fr.trim().length < 5) problems.push('titre trop court')
  if ((s.description_fr ?? '').trim().length < 30) problems.push('description trop courte (30 caractères minimum)')
  if (s.price_cents < 100) problems.push('prix manquant')
  if (!s.duration_min || s.duration_min < 15) problems.push('durée manquante')
  if (s.capacity_min > s.capacity_max) problems.push('capacités incohérentes')
  return problems
}

export interface ActionState {
  ok?: boolean
  error?: string
  message?: string
  fieldErrors?: Record<string, string>
}
