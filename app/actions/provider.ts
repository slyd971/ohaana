'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from '@/lib/i18n/navigation'
import { getProviderContext } from '@/lib/provider/context'
import {
  availabilitySchema,
  profileSchema,
  serviceSchema,
  submissionProblems,
  type ActionState,
} from '@/lib/provider/schemas'
import { getProviderService } from '@/lib/provider/queries'
import { slugify } from '@/lib/utils'
import { CACHE_TAGS } from '@/lib/data/services'

// Toutes les mutations du back-office prestataire passent ici. Chaque action :
//  1. relit l'identité côté serveur (jamais d'identifiant fourni par le navigateur pour le prestataire),
//  2. s'exécute avec le client de l'utilisateur => la RLS et les triggers 004 restent la dernière barrière,
//  3. invalide le cache du catalogue public (tag `services`) quand une fiche change.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function session() {
  const ctx = await getProviderContext()
  if (ctx.kind === 'demo') return { error: 'Mode démo : les modifications sont désactivées.' } as const
  if (ctx.kind !== 'provider') return { error: 'Connectez-vous avec un compte prestataire.' } as const
  return { ctx } as const
}

function invalidateCatalogue() {
  revalidateTag(CACHE_TAGS.services, 'max')
  revalidateTag(CACHE_TAGS.availability, 'max')
}

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of issues) {
    const key = String(issue.path[0] ?? '_')
    if (!out[key]) out[key] = issue.message
  }
  return out
}

function formObject(formData: FormData): Record<string, FormDataEntryValue> {
  const obj: Record<string, FormDataEntryValue> = {}
  for (const [k, v] of formData.entries()) obj[k] = v
  return obj
}

// ─── Services ────────────────────────────────────────────────────────────────

export async function saveServiceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const s = await session()
  if ('error' in s) return { error: s.error }
  const { supabase, provider } = s.ctx

  const raw = formObject(formData)
  const parsed = serviceSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: 'Corrigez les champs signalés.', fieldErrors: fieldErrors(parsed.error.issues) }
  }
  const v = parsed.data
  const locale = typeof raw.locale === 'string' ? raw.locale : 'fr'
  const id = typeof raw.id === 'string' && UUID_RE.test(raw.id) ? raw.id : null

  const row = {
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
  }

  if (id) {
    const current = await getProviderService(supabase, provider.id, id)
    if (!current) return { error: 'Service introuvable.' }
    // Une fiche publiée qui change repasse en relecture : le contenu public n'est jamais modifié sans validation.
    const status = current.status === 'published' ? 'pending_review' : current.status === 'rejected' ? 'draft' : current.status
    const { error } = await supabase.from('services').update({ ...row, status }).eq('id', id)
    if (error) return { error: `Enregistrement impossible : ${error.message}` }
  } else {
    const { data, error } = await supabase
      .from('services')
      .insert({ ...row, provider_id: provider.id, status: 'draft' })
      .select('id')
      .single()
    if (error || !data) return { error: `Création impossible : ${error?.message ?? 'erreur inconnue'}` }
    // Slug lisible et unique (suffixe = début de l'identifiant).
    await supabase
      .from('services')
      .update({ slug_fr: `${slugify(v.title_fr)}-${String(data.id).slice(0, 6)}` })
      .eq('id', data.id)
  }

  invalidateCatalogue()
  revalidatePath('/provider/services')
  redirect({ href: '/provider/services', locale })
  return { ok: true }
}

/** Soumet un brouillon (ou une fiche refusée corrigée) à la relecture de l'équipe. */
export async function submitServiceAction(serviceId: string): Promise<ActionState> {
  const s = await session()
  if ('error' in s) return { error: s.error }
  if (!UUID_RE.test(serviceId)) return { error: 'Service invalide.' }
  const { supabase } = s.ctx

  const service = await getProviderService(supabase, s.ctx.provider.id, serviceId)
  if (!service) return { error: 'Service introuvable.' }
  if (service.status !== 'draft' && service.status !== 'rejected') {
    return { error: 'Seul un brouillon ou une fiche refusée peut être soumis.' }
  }
  const problems = submissionProblems(service)
  if (problems.length) return { error: `Fiche incomplète : ${problems.join(', ')}.` }

  const { error } = await supabase.from('services').update({ status: 'pending_review' }).eq('id', serviceId)
  if (error) return { error: error.message }

  revalidatePath('/provider/services')
  return {
    ok: true,
    message: s.ctx.provider.is_approved
      ? 'Fiche envoyée à la relecture.'
      : 'Fiche envoyée. Elle sera publiée après validation de votre dossier par notre équipe.',
  }
}

/** Retire une fiche du site (archive) ou la remet en brouillon. */
export async function setServiceArchivedAction(serviceId: string, archived: boolean): Promise<ActionState> {
  const s = await session()
  if ('error' in s) return { error: s.error }
  if (!UUID_RE.test(serviceId)) return { error: 'Service invalide.' }

  const { error } = await s.ctx.supabase
    .from('services')
    .update({ status: archived ? 'archived' : 'draft' })
    .eq('id', serviceId)
  if (error) return { error: error.message }

  invalidateCatalogue()
  revalidatePath('/provider/services')
  return { ok: true }
}

// ─── Disponibilités ──────────────────────────────────────────────────────────

function addDays(base: Date, n: number): Date {
  const d = new Date(base)
  d.setUTCDate(d.getUTCDate() + n)
  return d
}

function plusMinutes(time: string, minutes: number): string | null {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  if (total >= 24 * 60) return null
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}:00`
}

/** Génère les créneaux à partir d'un modèle hebdomadaire (jours + horaires). Les créneaux existants sont conservés. */
export async function generateSlotsAction(input: {
  service_id: string
  weekdays: number[]
  times: string[]
  horizon_days: number
}): Promise<ActionState> {
  const s = await session()
  if ('error' in s) return { error: s.error }
  const parsed = availabilitySchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Paramètres invalides.' }
  const v = parsed.data

  const service = await getProviderService(s.ctx.supabase, s.ctx.provider.id, v.service_id)
  if (!service) return { error: 'Service introuvable.' }
  const duration = service.duration_min ?? 60

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const rows: { service_id: string; date: string; start_time: string; end_time: string }[] = []
  for (let i = 1; i <= v.horizon_days; i++) {
    const day = addDays(today, i)
    if (!v.weekdays.includes(day.getUTCDay())) continue
    for (const t of v.times) {
      const end = plusMinutes(t, duration)
      if (!end) continue // la prestation déborderait sur le lendemain
      rows.push({ service_id: v.service_id, date: day.toISOString().slice(0, 10), start_time: `${t}:00`, end_time: end })
    }
  }
  if (rows.length === 0) return { error: 'Aucun créneau à créer avec ces réglages.' }

  const { error } = await s.ctx.supabase
    .from('availability_slots')
    .upsert(rows, { onConflict: 'service_id,date,start_time', ignoreDuplicates: true })
  if (error) return { error: error.message }

  revalidateTag(CACHE_TAGS.availability, 'max')
  revalidatePath('/provider/disponibilites')
  return { ok: true, message: `${rows.length} créneaux ajoutés (les créneaux existants sont conservés).` }
}

/** Bloque (ou rouvre) tous les créneaux libres d'un jour. Un créneau déjà réservé n'est jamais modifié. */
export async function setDayBlockedAction(serviceId: string, date: string, blocked: boolean): Promise<ActionState> {
  const s = await session()
  if ('error' in s) return { error: s.error }
  if (!UUID_RE.test(serviceId) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'Paramètres invalides.' }

  const service = await getProviderService(s.ctx.supabase, s.ctx.provider.id, serviceId)
  if (!service) return { error: 'Service introuvable.' }

  const { error } = await s.ctx.supabase
    .from('availability_slots')
    .update({ is_available: !blocked })
    .eq('service_id', serviceId)
    .eq('date', date)
  if (error) return { error: error.message }

  revalidateTag(CACHE_TAGS.availability, 'max')
  revalidatePath('/provider/disponibilites')
  return { ok: true }
}

// ─── Réservations ────────────────────────────────────────────────────────────

/** Annule une réservation (remboursement intégral côté RPC) ou la marque comme terminée. */
export async function setBookingStatusAction(
  bookingId: string,
  status: 'cancelled_provider' | 'completed',
): Promise<ActionState> {
  const s = await session()
  if ('error' in s) return { error: s.error }
  if (!UUID_RE.test(bookingId)) return { error: 'Réservation invalide.' }
  if (status !== 'cancelled_provider' && status !== 'completed') return { error: 'Statut invalide.' }

  const { error } = await s.ctx.supabase.rpc('provider_set_booking_status', {
    p_booking_id: bookingId,
    p_status: status,
  })
  if (error) {
    return {
      error:
        error.code === '22023'
          ? error.message.includes('not taken place')
            ? 'La prestation n’a pas encore eu lieu.'
            : 'Cette transition n’est pas possible pour cette réservation.'
          : 'Action impossible pour le moment.',
    }
  }

  revalidatePath('/provider/reservations')
  revalidatePath('/provider/dashboard')
  return { ok: true }
}

// ─── Profil ──────────────────────────────────────────────────────────────────

export async function saveProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const s = await session()
  if ('error' in s) return { error: s.error }

  const parsed = profileSchema.safeParse(formObject(formData))
  if (!parsed.success) return { error: 'Corrigez les champs signalés.', fieldErrors: fieldErrors(parsed.error.issues) }

  const { error } = await s.ctx.supabase.from('provider_profiles').update(parsed.data).eq('id', s.ctx.provider.id)
  if (error) return { error: `Enregistrement impossible : ${error.message}` }

  revalidateTag(CACHE_TAGS.services, 'max') // le nom et la bio apparaissent sur les fiches publiques
  revalidatePath('/provider/settings')
  return { ok: true, message: 'Profil enregistré.' }
}
