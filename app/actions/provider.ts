'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from '@/lib/i18n/navigation'
import { getProviderContext } from '@/lib/provider/context'
import { profileSchema, submissionProblems, type ActionState } from '@/lib/provider/schemas'
import { fieldErrors, formObject, isUuid, parseServiceForm } from '@/lib/provider/service-input'
import { planSlots } from '@/lib/provider/slots'
import { refundBookingPayment } from '@/lib/stripe/refunds'
import { PaymentsNotConfigured, providerOnboardingUrl, syncProviderPaymentsStatus } from '@/lib/stripe/connect-service'
import type { ConnectState } from '@/lib/stripe/connect-status'
import { hasServiceRole } from '@/lib/supabase/server'
import { MIN_PHOTOS, applyImageOp, countServiceImages, type ImageOp } from '@/lib/provider/images'
import { getProviderService } from '@/lib/provider/queries'
import { slugify } from '@/lib/utils'
import { emailBookingCancelled, refundSentence } from '@/lib/email/events'
import { CACHE_TAGS } from '@/lib/data/services'
import { complianceSchema } from '@/lib/provider/compliance'
import { LEGAL_VERSIONS } from '@/lib/legal/versions'

// Toutes les mutations du back-office prestataire passent ici. Chaque action :
//  1. relit l'identité côté serveur (jamais d'identifiant fourni par le navigateur pour le prestataire),
//  2. s'exécute avec le client de l'utilisateur => la RLS et les triggers 004 restent la dernière barrière,
//  3. invalide le cache du catalogue public (tag `services`) quand une fiche change.

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

// ─── Services ────────────────────────────────────────────────────────────────

export async function saveServiceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const s = await session()
  if ('error' in s) return { error: s.error }
  const { supabase, provider } = s.ctx

  const parsed = parseServiceForm(formData)
  if (!parsed.ok) return { error: parsed.error, fieldErrors: parsed.fieldErrors }
  const { id, locale, row, title_fr } = parsed

  let createdId: string | null = null
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
    createdId = data.id as string
    // Slug lisible et unique (suffixe = début de l'identifiant).
    await supabase
      .from('services')
      .update({ slug_fr: `${slugify(title_fr)}-${String(data.id).slice(0, 6)}` })
      .eq('id', data.id)
  }

  invalidateCatalogue()
  revalidatePath('/provider/services')
  // Une nouvelle fiche ouvre directement son écran d'édition : l'étape suivante, ce sont les photos.
  redirect({ href: createdId ? `/provider/services/${createdId}` : '/provider/services', locale })
  return { ok: true }
}

/** Soumet un brouillon (ou une fiche refusée corrigée) à la relecture de l'équipe. */
export async function submitServiceAction(serviceId: string): Promise<ActionState> {
  const s = await session()
  if ('error' in s) return { error: s.error }
  if (!isUuid(serviceId)) return { error: 'Service invalide.' }
  const { supabase } = s.ctx

  const service = await getProviderService(supabase, s.ctx.provider.id, serviceId)
  if (!service) return { error: 'Service introuvable.' }
  if (service.status !== 'draft' && service.status !== 'rejected') {
    return { error: 'Seul un brouillon ou une fiche refusée peut être soumis.' }
  }
  const problems = submissionProblems(service)
  const photos = await countServiceImages(supabase, serviceId)
  if (photos < MIN_PHOTOS) problems.push(`${MIN_PHOTOS} photos minimum (${photos} ajoutée${photos > 1 ? 's' : ''})`)
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
  if (!isUuid(serviceId)) return { error: 'Service invalide.' }

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

/** Génère les créneaux à partir d'un modèle hebdomadaire (jours + horaires). Les créneaux existants sont conservés. */
export async function generateSlotsAction(input: {
  service_id: string
  weekdays: number[]
  times: string[]
  horizon_days: number
}): Promise<ActionState> {
  const s = await session()
  if ('error' in s) return { error: s.error }
  const service = await getProviderService(s.ctx.supabase, s.ctx.provider.id, input.service_id)
  if (!service) return { error: 'Service introuvable.' }
  const plan = planSlots(input, service.duration_min, new Date())
  if (!plan.ok) return { error: plan.error }
  const rows = plan.rows

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
  if (!isUuid(serviceId) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'Paramètres invalides.' }

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
  if (!isUuid(bookingId)) return { error: 'Réservation invalide.' }
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

  if (status === 'cancelled_provider') {
    // Annulation par le prestataire : remboursement intégral (la base fixe refund_pct = 100).
    if (!hasServiceRole()) return { ok: true, message: 'Réservation annulée.' }
    try {
      const outcome = await refundBookingPayment(bookingId)
      const neverPaid = outcome.status === 'nothing_to_refund' && (outcome.reason === 'no_payment' || outcome.reason === 'not_captured')
      if (!neverPaid) {
        await emailBookingCancelled(
          bookingId,
          'provider',
          outcome.status === 'refunded' ? refundSentence('refunded', outcome.refundedCents) : undefined,
        )
      }
      return {
        ok: true,
        message:
          outcome.status === 'refunded'
            ? 'Réservation annulée : le voyageur est remboursé intégralement.'
            : 'Réservation annulée.',
      }
    } catch (e) {
      console.error('[provider-cancel] refund failed for', bookingId, e instanceof Error ? e.message : e)
      await emailBookingCancelled(bookingId, 'provider', refundSentence('pending'))
      // L'annulation est valable ; le remboursement sera relancé par l'équipe (liste « remboursements à traiter »).
      return { ok: true, message: 'Réservation annulée. Le remboursement du voyageur est en cours de traitement.' }
    }
  }
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

// ─── Photos ──────────────────────────────────────────────────────────────────

/** Ajoute, décrit, ordonne ou supprime les photos d'un service du prestataire connecté. */
export async function manageServiceImageAction(input: ImageOp): Promise<ActionState> {
  const s = await session()
  if ('error' in s) return { error: s.error }
  if (!input || !isUuid(input.serviceId)) return { error: 'Service invalide.' }

  const service = await getProviderService(s.ctx.supabase, s.ctx.provider.id, input.serviceId)
  if (!service) return { error: 'Service introuvable.' }

  const result = await applyImageOp(s.ctx.supabase, { id: service.id, provider_id: s.ctx.provider.id }, input)
  if (result.ok) {
    invalidateCatalogue()
    revalidatePath(`/provider/services/${service.id}`)
  }
  return result
}

// ─── Paiements (Stripe Connect) ──────────────────────────────────────────────

function paymentsError(e: unknown): string {
  if (e instanceof PaymentsNotConfigured) return 'Les paiements ne sont pas encore configurés sur ce site.'
  console.error('[payments] Stripe error:', e instanceof Error ? e.message : e)
  return 'Stripe est momentanément indisponible. Réessayez dans un instant.'
}

/** Ouvre (ou reprend) la configuration du compte de versement : renvoie le lien à usage unique du formulaire Stripe. */
export async function startPaymentsOnboardingAction(): Promise<ActionState & { url?: string }> {
  const s = await session()
  if ('error' in s) return { error: s.error }
  if (!s.ctx.provider.is_approved) return { error: 'Votre dossier doit d’abord être approuvé par notre équipe.' }
  try {
    return { ok: true, url: await providerOnboardingUrl(s.ctx.provider.id, '/provider/paiements') }
  } catch (e) {
    return { error: paymentsError(e) }
  }
}

/** Relit l'état du compte chez Stripe (au retour du formulaire, ou à la demande). */
export async function refreshPaymentsStatusAction(): Promise<ActionState & { state?: ConnectState }> {
  const s = await session()
  if ('error' in s) return { error: s.error }
  try {
    const status = await syncProviderPaymentsStatus(s.ctx.provider.id)
    revalidatePath('/provider/paiements')
    revalidatePath('/provider/dashboard')
    return { ok: true, state: status.state }
  } catch (e) {
    return { error: paymentsError(e) }
  }
}

// ─── Statut professionnel ────────────────────────────────────────────────────

/**
 * Enregistre le statut DÉCLARÉ par le prestataire (statut juridique, SIRET, assurance) et son acceptation des CGU prestataire.
 * La vérification est faite ensuite par l'équipe (colonnes compliance_* protégées en base) ; modifier une déclaration
 * annule une vérification existante.
 */
export async function saveComplianceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const s = await session()
  if ('error' in s) return { error: s.error }

  const raw = formObject(formData)
  const parsed = complianceSchema.safeParse({
    legal_status: raw.legal_status,
    siret: typeof raw.siret === 'string' ? raw.siret : undefined,
    vat_number: typeof raw.vat_number === 'string' ? raw.vat_number : undefined,
    insurance_confirmed: raw.insurance_confirmed === 'on',
    insurance_expires_on: typeof raw.insurance_expires_on === 'string' && raw.insurance_expires_on ? raw.insurance_expires_on : undefined,
  })
  if (!parsed.success) return { error: 'Corrigez les champs signalés.', fieldErrors: fieldErrors(parsed.error.issues) }
  if (raw.accept_provider_terms !== 'on') {
    return { error: 'Vous devez accepter les conditions prestataire.', fieldErrors: { accept_provider_terms: 'Acceptation requise' } }
  }

  const d = parsed.data
  const { error } = await s.ctx.supabase
    .from('provider_profiles')
    .update({
      legal_status: d.legal_status,
      siret: d.siret || null,
      vat_number: d.vat_number || null,
      insurance_confirmed: d.insurance_confirmed,
      insurance_expires_on: d.insurance_expires_on ?? null,
    })
    .eq('id', s.ctx.provider.id)
  if (error) return { error: `Enregistrement impossible : ${error.message}` }

  await s.ctx.supabase.rpc('accept_legal', { p_document: 'provider_terms', p_version: LEGAL_VERSIONS.provider_terms, p_source: 'provider_onboarding' })

  revalidatePath('/provider/settings')
  revalidatePath('/provider/dashboard')
  return { ok: true, message: 'Informations enregistrées. Notre équipe les vérifiera avant la validation de votre dossier.' }
}
