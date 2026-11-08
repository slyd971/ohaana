'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { getAdminContext } from '@/lib/admin/context'
import { redirect } from '@/lib/i18n/navigation'
import { CACHE_TAGS } from '@/lib/data/services'
import { profileSchema, type ActionState } from '@/lib/provider/schemas'
import { fieldErrors, formObject, isUuid, parseServiceForm } from '@/lib/provider/service-input'
import { planSlots } from '@/lib/provider/slots'
import { slugify } from '@/lib/utils'
import { applyImageOp, type ImageOp } from '@/lib/provider/images'
import { refundBookingPayment } from '@/lib/stripe/refunds'
import { PaymentsNotConfigured, providerOnboardingUrl, syncProviderPaymentsStatus } from '@/lib/stripe/connect-service'
import type { ConnectState } from '@/lib/stripe/connect-status'
import { SETTINGS_TAG } from '@/lib/commission'
import { LEAD_STATUSES, USER_ROLES, categorySchema, type AssignableRole } from '@/lib/admin/schemas'

// Mutations de l'espace admin. Chaque action : (1) relit le rôle admin côté serveur, (2) s'exécute avec la
// session de l'admin (RLS is_admin() + triggers), (3) écrit une ligne dans admin_logs, (4) invalide le cache public.

async function admin() {
  const ctx = await getAdminContext()
  if (ctx.kind === 'demo') return { error: 'Mode démo : les modifications sont désactivées.' } as const
  if (ctx.kind !== 'admin') return { error: 'Accès réservé aux administrateurs.' } as const
  return { ctx } as const
}

async function log(
  ctx: { supabase: import('@supabase/supabase-js').SupabaseClient; userId: string },
  action: string,
  targetType: string,
  targetId: string,
  details: Record<string, unknown> = {},
) {
  // RLS : seul un admin peut écrire, et admin_id doit être l'admin connecté.
  const { error } = await ctx.supabase
    .from('admin_logs')
    .insert({ admin_id: ctx.userId, action, target_type: targetType, target_id: targetId, details })
  if (error) console.error('[admin] log failed:', error.message)
}

function invalidate() {
  revalidateTag(CACHE_TAGS.services, 'max')
  revalidatePath('/admin/moderation')
  revalidatePath('/admin/providers')
}

/** Publie une fiche en relecture. Le trigger refuse si le prestataire n'est pas approuvé. */
export async function publishServiceAction(serviceId: string): Promise<ActionState> {
  const a = await admin()
  if ('error' in a) return { error: a.error }
  if (!isUuid(serviceId)) return { error: 'Service invalide.' }

  const { data, error } = await a.ctx.supabase
    .from('services')
    .update({ status: 'published', rejection_reason: null })
    .eq('id', serviceId)
    .eq('status', 'pending_review')
    .select('id')
    .maybeSingle()
  if (error) {
    return {
      error: error.code === '23514' ? 'Le prestataire doit d’abord être approuvé.' : `Publication impossible : ${error.message}`,
    }
  }
  if (!data) return { error: 'Cette fiche n’est plus en relecture.' }

  await log(a.ctx, 'service.publish', 'service', serviceId)
  invalidate()
  return { ok: true, message: 'Fiche publiée.' }
}

/** Refuse une fiche avec un motif visible par le prestataire. */
export async function rejectServiceAction(serviceId: string, reason: string): Promise<ActionState> {
  const a = await admin()
  if ('error' in a) return { error: a.error }
  if (!isUuid(serviceId)) return { error: 'Service invalide.' }
  const clean = reason.trim()
  if (clean.length < 5) return { error: 'Indiquez un motif (5 caractères minimum).' }
  if (clean.length > 500) return { error: 'Motif trop long (500 caractères maximum).' }

  const { data, error } = await a.ctx.supabase
    .from('services')
    .update({ status: 'rejected', rejection_reason: clean })
    .eq('id', serviceId)
    .eq('status', 'pending_review')
    .select('id')
    .maybeSingle()
  if (error) return { error: `Refus impossible : ${error.message}` }
  if (!data) return { error: 'Cette fiche n’est plus en relecture.' }

  await log(a.ctx, 'service.reject', 'service', serviceId, { reason: clean })
  invalidate()
  return { ok: true, message: 'Fiche refusée, le motif est visible par le prestataire.' }
}

/** Approuve ou suspend un prestataire. Suspendre dépublie aussi ses fiches (retour en relecture). */
export async function setProviderApprovalAction(providerId: string, approved: boolean): Promise<ActionState> {
  const a = await admin()
  if ('error' in a) return { error: a.error }
  if (!isUuid(providerId)) return { error: 'Prestataire invalide.' }

  const { data, error } = await a.ctx.supabase
    .from('provider_profiles')
    .update({ is_approved: approved })
    .eq('id', providerId)
    .select('id')
    .maybeSingle()
  if (error) return { error: `Mise à jour impossible : ${error.message}` }
  if (!data) return { error: 'Prestataire introuvable.' }

  let unpublished = 0
  if (!approved) {
    const { data: rows } = await a.ctx.supabase
      .from('services')
      .update({ status: 'pending_review' })
      .eq('provider_id', providerId)
      .eq('status', 'published')
      .select('id')
    unpublished = rows?.length ?? 0
  }

  await log(a.ctx, approved ? 'provider.approve' : 'provider.suspend', 'provider_profile', providerId, { unpublished })
  invalidate()
  return {
    ok: true,
    message: approved ? 'Prestataire approuvé.' : `Prestataire suspendu (${unpublished} fiche(s) dépubliée(s)).`,
  }
}

/** Met une fiche en avant (ou non) sur la home. */
export async function setServiceFeaturedAction(serviceId: string, featured: boolean): Promise<ActionState> {
  const a = await admin()
  if ('error' in a) return { error: a.error }
  if (!isUuid(serviceId)) return { error: 'Service invalide.' }

  const { error } = await a.ctx.supabase.from('services').update({ is_featured: featured }).eq('id', serviceId)
  if (error) return { error: error.message }

  await log(a.ctx, featured ? 'service.feature' : 'service.unfeature', 'service', serviceId)
  invalidate()
  return { ok: true }
}

// ─── Prestataires « gérés » (créés par l'admin, sans compte) ─────────────────

function localeOf(formData: FormData): string {
  const v = formData.get('locale')
  return typeof v === 'string' && /^(fr|en|es)$/.test(v) ? v : 'fr'
}

/** Crée un prestataire sans compte (approuvé, non revendiqué). Une invitation pourra le rattacher plus tard. */
export async function createManagedProviderAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const a = await admin()
  if ('error' in a) return { error: a.error }

  const parsed = profileSchema.safeParse(formObject(formData))
  if (!parsed.success) return { error: 'Corrigez les champs signalés.', fieldErrors: fieldErrors(parsed.error.issues) }

  const { data, error } = await a.ctx.supabase
    .from('provider_profiles')
    .insert({
      ...parsed.data,
      user_id: null,
      is_approved: true,
      claimed: false,
      created_by_admin_id: a.ctx.userId,
    })
    .select('id')
    .single()
  if (error || !data) return { error: `Création impossible : ${error?.message ?? 'erreur inconnue'}` }

  await log(a.ctx, 'provider.create_managed', 'provider_profile', data.id, { business_name: parsed.data.business_name })
  invalidate()
  redirect({ href: `/admin/providers/${data.id}`, locale: localeOf(formData) })
  return { ok: true }
}

/** Modifie la fiche d'un prestataire (géré ou non). */
export async function saveProviderAsAdminAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const a = await admin()
  if ('error' in a) return { error: a.error }
  const id = formData.get('provider_id')
  if (!isUuid(id)) return { error: 'Prestataire invalide.' }

  const parsed = profileSchema.safeParse(formObject(formData))
  if (!parsed.success) return { error: 'Corrigez les champs signalés.', fieldErrors: fieldErrors(parsed.error.issues) }

  const { data, error } = await a.ctx.supabase
    .from('provider_profiles')
    .update(parsed.data)
    .eq('id', id)
    .select('id')
    .maybeSingle()
  if (error) return { error: `Enregistrement impossible : ${error.message}` }
  if (!data) return { error: 'Prestataire introuvable.' }

  await log(a.ctx, 'provider.update', 'provider_profile', id)
  invalidate()
  revalidatePath(`/admin/providers/${id}`)
  return { ok: true, message: 'Profil enregistré.' }
}

/** Crée ou modifie un service pour n'importe quel prestataire. Les nouvelles fiches démarrent en brouillon. */
export async function saveServiceAsAdminAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const a = await admin()
  if ('error' in a) return { error: a.error }
  const providerId = formData.get('provider_id')
  if (!isUuid(providerId)) return { error: 'Prestataire invalide.' }

  const parsed = parseServiceForm(formData)
  if (!parsed.ok) return { error: parsed.error, fieldErrors: parsed.fieldErrors }
  const { id, locale, row, title_fr } = parsed

  const { data: owner } = await a.ctx.supabase.from('provider_profiles').select('id').eq('id', providerId).maybeSingle()
  if (!owner) return { error: 'Prestataire introuvable.' }

  let serviceId = id
  if (id) {
    const { data, error } = await a.ctx.supabase
      .from('services')
      .update(row)
      .eq('id', id)
      .eq('provider_id', providerId)
      .select('id')
      .maybeSingle()
    if (error) return { error: `Enregistrement impossible : ${error.message}` }
    if (!data) return { error: 'Service introuvable.' }
  } else {
    const { data, error } = await a.ctx.supabase
      .from('services')
      .insert({ ...row, provider_id: providerId, status: 'draft', created_by_admin_id: a.ctx.userId })
      .select('id')
      .single()
    if (error || !data) return { error: `Création impossible : ${error?.message ?? 'erreur inconnue'}` }
    serviceId = data.id
    await a.ctx.supabase
      .from('services')
      .update({ slug_fr: `${slugify(title_fr)}-${String(data.id).slice(0, 6)}` })
      .eq('id', data.id)
  }

  await log(a.ctx, id ? 'service.update' : 'service.create', 'service', String(serviceId), { provider_id: providerId })
  invalidate()
  redirect({ href: id ? `/admin/providers/${providerId}` : `/admin/providers/${providerId}/services/${serviceId}`, locale })
  return { ok: true }
}

/** Fait passer un service par l'admin : brouillon, publié ou archivé. */
export async function setServiceStatusAsAdminAction(
  serviceId: string,
  status: 'draft' | 'published' | 'archived',
): Promise<ActionState> {
  const a = await admin()
  if ('error' in a) return { error: a.error }
  if (!isUuid(serviceId)) return { error: 'Service invalide.' }
  if (!['draft', 'published', 'archived'].includes(status)) return { error: 'Statut invalide.' }

  const { data, error } = await a.ctx.supabase
    .from('services')
    .update({ status, ...(status === 'published' ? { rejection_reason: null } : {}) })
    .eq('id', serviceId)
    .select('id')
    .maybeSingle()
  if (error) {
    return { error: error.code === '23514' ? 'Le prestataire doit d’abord être approuvé.' : `Mise à jour impossible : ${error.message}` }
  }
  if (!data) return { error: 'Service introuvable.' }

  await log(a.ctx, `service.set_${status}`, 'service', serviceId)
  invalidate()
  return { ok: true, message: status === 'published' ? 'Fiche publiée.' : status === 'archived' ? 'Fiche archivée.' : 'Fiche remise en brouillon.' }
}

export async function generateSlotsAsAdminAction(input: {
  service_id: string
  weekdays: number[]
  times: string[]
  horizon_days: number
}): Promise<ActionState> {
  const a = await admin()
  if ('error' in a) return { error: a.error }
  if (!isUuid(input.service_id)) return { error: 'Service invalide.' }

  const { data: service } = await a.ctx.supabase.from('services').select('duration_min').eq('id', input.service_id).maybeSingle()
  if (!service) return { error: 'Service introuvable.' }
  const plan = planSlots(input, service.duration_min as number | null, new Date())
  if (!plan.ok) return { error: plan.error }

  const { error } = await a.ctx.supabase
    .from('availability_slots')
    .upsert(plan.rows, { onConflict: 'service_id,date,start_time', ignoreDuplicates: true })
  if (error) return { error: error.message }

  await log(a.ctx, 'slots.generate', 'service', input.service_id, { count: plan.rows.length })
  revalidateTag(CACHE_TAGS.availability, 'max')
  return { ok: true, message: `${plan.rows.length} créneaux ajoutés (les créneaux existants sont conservés).` }
}

export async function setDayBlockedAsAdminAction(serviceId: string, date: string, blocked: boolean): Promise<ActionState> {
  const a = await admin()
  if ('error' in a) return { error: a.error }
  if (!isUuid(serviceId) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'Paramètres invalides.' }

  const { error } = await a.ctx.supabase
    .from('availability_slots')
    .update({ is_available: !blocked })
    .eq('service_id', serviceId)
    .eq('date', date)
  if (error) return { error: error.message }

  await log(a.ctx, blocked ? 'slots.block_day' : 'slots.unblock_day', 'service', serviceId, { date })
  revalidateTag(CACHE_TAGS.availability, 'max')
  return { ok: true }
}

/** Photos d'un service pour n'importe quel prestataire (l'admin passe par ses propres règles Storage). */
export async function manageServiceImageAsAdminAction(input: ImageOp): Promise<ActionState> {
  const a = await admin()
  if ('error' in a) return { error: a.error }
  if (!input || !isUuid(input.serviceId)) return { error: 'Service invalide.' }

  const { data: service } = await a.ctx.supabase.from('services').select('id, provider_id').eq('id', input.serviceId).maybeSingle()
  if (!service) return { error: 'Service introuvable.' }

  const result = await applyImageOp(a.ctx.supabase, { id: service.id as string, provider_id: service.provider_id as string }, input)
  if (result.ok) {
    await log(a.ctx, `image.${input.op}`, 'service', service.id as string)
    invalidate()
  }
  return result
}

// ─── Utilisateurs ────────────────────────────────────────────────────────────

/** Active ou désactive un compte. Un admin ne peut pas se désactiver lui-même. */
export async function setUserActiveAction(userId: string, active: boolean): Promise<ActionState> {
  const a = await admin()
  if ('error' in a) return { error: a.error }
  if (!isUuid(userId)) return { error: 'Utilisateur invalide.' }
  if (userId === a.ctx.userId) return { error: 'Vous ne pouvez pas désactiver votre propre compte.' }

  const { data, error } = await a.ctx.supabase.from('users').update({ is_active: active }).eq('id', userId).select('id').maybeSingle()
  if (error) return { error: error.message }
  if (!data) return { error: 'Utilisateur introuvable.' }

  await log(a.ctx, active ? 'user.activate' : 'user.deactivate', 'user', userId)
  revalidatePath('/admin/users')
  return { ok: true }
}

/** Change le rôle d'un compte (admin uniquement, journalisé). Jamais le sien : on ne perd pas l'accès par erreur. */
export async function setUserRoleAction(userId: string, role: AssignableRole): Promise<ActionState> {
  const a = await admin()
  if ('error' in a) return { error: a.error }
  if (!isUuid(userId)) return { error: 'Utilisateur invalide.' }
  if (!USER_ROLES.includes(role)) return { error: 'Rôle invalide.' }
  if (userId === a.ctx.userId) return { error: 'Vous ne pouvez pas changer votre propre rôle.' }

  const { data: before } = await a.ctx.supabase.from('users').select('role').eq('id', userId).maybeSingle()
  if (!before) return { error: 'Utilisateur introuvable.' }
  if (before.role === role) return { ok: true }

  const { error } = await a.ctx.supabase.from('users').update({ role }).eq('id', userId)
  if (error) return { error: error.message }

  await log(a.ctx, 'user.set_role', 'user', userId, { from: before.role, to: role })
  revalidatePath('/admin/users')
  return { ok: true }
}

// ─── Catégories ──────────────────────────────────────────────────────────────

/** Crée ou modifie une catégorie. Le slug est fixé à la création : il sert aux liens et aux filtres. */
export async function saveCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const a = await admin()
  if ('error' in a) return { error: a.error }

  const raw = formObject(formData)
  const parsed = categorySchema.safeParse(raw)
  if (!parsed.success) return { error: 'Corrigez les champs signalés.', fieldErrors: fieldErrors(parsed.error.issues) }
  const row = { ...parsed.data, is_active: raw.is_active === 'on' }
  const id = isUuid(raw.id) ? raw.id : null

  if (id) {
    const { data, error } = await a.ctx.supabase.from('service_categories').update(row).eq('id', id).select('id').maybeSingle()
    if (error) return { error: error.message }
    if (!data) return { error: 'Catégorie introuvable.' }
    await log(a.ctx, 'category.update', 'category', id)
  } else {
    const base = slugify(row.name_fr).replace(/-/g, '_') || 'categorie'
    let slug = base
    for (let i = 2; i < 10; i++) {
      const { data: taken } = await a.ctx.supabase.from('service_categories').select('id').eq('slug', slug).maybeSingle()
      if (!taken) break
      slug = `${base}_${i}`
    }
    const { data, error } = await a.ctx.supabase.from('service_categories').insert({ ...row, slug }).select('id').single()
    if (error || !data) return { error: error?.message ?? 'Création impossible.' }
    await log(a.ctx, 'category.create', 'category', data.id as string, { slug })
  }

  invalidate()
  revalidatePath('/admin/categories')
  return { ok: true, message: 'Catégorie enregistrée.' }
}

// ─── Leads ───────────────────────────────────────────────────────────────────

export async function setLeadStatusAction(leadId: string, status: (typeof LEAD_STATUSES)[number]): Promise<ActionState> {
  const a = await admin()
  if ('error' in a) return { error: a.error }
  if (!isUuid(leadId) || !LEAD_STATUSES.includes(status)) return { error: 'Paramètres invalides.' }

  const { data, error } = await a.ctx.supabase.from('leads').update({ status }).eq('id', leadId).select('id').maybeSingle()
  if (error) return { error: error.message }
  if (!data) return { error: 'Lead introuvable.' }

  await log(a.ctx, 'lead.set_status', 'lead', leadId, { status })
  revalidatePath('/admin/leads')
  return { ok: true }
}

// ─── Remboursements ──────────────────────────────────────────────────────────

/**
 * Relance le remboursement d'une annulation dont l'envoi a échoué (liste « remboursements à traiter »).
 * Sans risque de doublon : le montant restant dû est recalculé et la clé d'idempotence de Stripe protège
 * contre un remboursement déjà parti.
 */
export async function retryRefundAction(bookingId: string): Promise<ActionState> {
  const a = await admin()
  if ('error' in a) return { error: a.error }
  if (!isUuid(bookingId)) return { error: 'Réservation invalide.' }

  try {
    const outcome = await refundBookingPayment(bookingId)
    await log(a.ctx, 'refund.retry', 'booking', bookingId, { outcome: outcome.status })
    revalidatePath('/admin/dashboard')
    if (outcome.status === 'refunded') return { ok: true, message: 'Remboursement envoyé.' }
    if (outcome.status === 'not_cancelled') return { error: 'Cette réservation n’est pas annulée.' }
    return { ok: true, message: 'Rien à rembourser : déjà réglé ou non dû.' }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'erreur inconnue'
    console.error('[admin] refund retry failed for', bookingId, message)
    return { error: message === 'refunds_not_configured' ? 'Remboursements non configurés (clés Stripe / service_role).' : 'Stripe a refusé le remboursement. Réessayez ou vérifiez le paiement dans Stripe.' }
  }
}

// ─── Paiements d'un prestataire (inscription accompagnée) ────────────────────

function adminPaymentsError(e: unknown): string {
  if (e instanceof PaymentsNotConfigured) return 'Paiements non configurés (clés Stripe / service_role).'
  console.error('[admin] Stripe error:', e instanceof Error ? e.message : e)
  return 'Stripe est momentanément indisponible. Réessayez dans un instant.'
}

/** Relit l'état du compte de versement d'un prestataire chez Stripe. */
export async function adminRefreshPaymentsStatusAction(providerId: string): Promise<ActionState & { state?: ConnectState; dueCount?: number }> {
  const a = await admin()
  if ('error' in a) return { error: a.error }
  if (!isUuid(providerId)) return { error: 'Prestataire invalide.' }
  try {
    const status = await syncProviderPaymentsStatus(providerId)
    revalidatePath(`/admin/providers/${providerId}`)
    return { ok: true, state: status.state, dueCount: status.dueCount }
  } catch (e) {
    return { error: adminPaymentsError(e) }
  }
}

/**
 * Génère le lien du formulaire Stripe pour accompagner un prestataire pendant un appel. Ce lien est à usage
 * unique et donne accès à la saisie de son identité et de son IBAN : il doit être ouvert par le prestataire
 * lui-même (partage d'écran), jamais envoyé par message.
 */
export async function adminOnboardingLinkAction(providerId: string): Promise<ActionState & { url?: string }> {
  const a = await admin()
  if ('error' in a) return { error: a.error }
  if (!isUuid(providerId)) return { error: 'Prestataire invalide.' }
  try {
    const url = await providerOnboardingUrl(providerId, `/admin/providers/${providerId}`)
    await log(a.ctx, 'payments.onboarding_link', 'provider_profile', providerId)
    return { ok: true, url }
  } catch (e) {
    return { error: adminPaymentsError(e) }
  }
}

// ─── Paramètres ──────────────────────────────────────────────────────────────

/**
 * Taux de commission d'Ohaana, en % du prix payé par le voyageur (prélevé sur la part du prestataire).
 * Il s'applique aux NOUVELLES réservations : chaque paiement conserve la répartition calculée à sa création.
 */
export async function setCommissionPctAction(pct: number): Promise<ActionState> {
  const a = await admin()
  if ('error' in a) return { error: a.error }
  if (typeof pct !== 'number' || !Number.isFinite(pct) || pct < 0 || pct > 50) return { error: 'Le taux doit être compris entre 0 et 50 %.' }
  const value = Math.round(pct * 10) / 10

  const { data: before } = await a.ctx.supabase.from('platform_settings').select('value').eq('key', 'commission_pct').maybeSingle()
  const { error } = await a.ctx.supabase
    .from('platform_settings')
    .upsert({ key: 'commission_pct', value, updated_by: a.ctx.userId, updated_at: new Date().toISOString() })
  if (error) return { error: error.code === '23514' ? 'Le taux doit être compris entre 0 et 50 %.' : error.message }

  await log(a.ctx, 'settings.commission_pct', 'setting', a.ctx.userId, { from: before?.value ?? null, to: value })
  revalidateTag(SETTINGS_TAG, 'max')
  revalidatePath('/admin/parametres')
  return { ok: true, message: `Commission réglée à ${value} % pour les nouvelles réservations.` }
}
