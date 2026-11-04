import { serviceSchema } from './schemas'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const isUuid = (v: unknown): v is string => typeof v === 'string' && UUID_RE.test(v)

export function formObject(formData: FormData): Record<string, FormDataEntryValue> {
  const obj: Record<string, FormDataEntryValue> = {}
  for (const [k, v] of formData.entries()) obj[k] = v
  return obj
}

export function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of issues) {
    const key = String(issue.path[0] ?? '_')
    if (!out[key]) out[key] = issue.message
  }
  return out
}

export type ParsedServiceForm =
  | { ok: false; error: string; fieldErrors: Record<string, string> }
  | {
      ok: true
      id: string | null
      locale: string
      title_fr: string
      row: {
        title_fr: string
        description_fr: string
        title_en: string | null
        description_en: string | null
        category_id: string
        island: string
        price_cents: number
        price_unit: 'per_person' | 'flat'
        duration_min: number
        capacity_min: number
        capacity_max: number
        address: string | null
        tags: string[]
        min_notice_hours: number
      }
    }

/** Validation commune du formulaire de service (espace prestataire et espace admin). */
export function parseServiceForm(formData: FormData): ParsedServiceForm {
  const raw = formObject(formData)
  const parsed = serviceSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: 'Corrigez les champs signalés.', fieldErrors: fieldErrors(parsed.error.issues) }
  }
  const v = parsed.data
  return {
    ok: true,
    id: isUuid(raw.id) ? raw.id : null,
    locale: typeof raw.locale === 'string' ? raw.locale : 'fr',
    title_fr: v.title_fr,
    row: {
      title_fr: v.title_fr,
      description_fr: v.description_fr,
      title_en: v.title_en,
      description_en: v.description_en,
      category_id: v.category_id,
      island: v.island,
      price_cents: Math.round(v.price_euros * 100),
      price_unit: v.price_unit,
      duration_min: v.duration_min,
      capacity_min: v.capacity_min,
      capacity_max: v.capacity_max,
      address: v.address,
      tags: v.tags,
      min_notice_hours: v.min_notice_hours,
    },
  }
}
