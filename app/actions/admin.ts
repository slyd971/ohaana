'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { getAdminContext } from '@/lib/admin/context'
import { CACHE_TAGS } from '@/lib/data/services'
import type { ActionState } from '@/lib/provider/schemas'

// Mutations de l'espace admin. Chaque action : (1) relit le rôle admin côté serveur, (2) s'exécute avec la
// session de l'admin (RLS is_admin() + triggers), (3) écrit une ligne dans admin_logs, (4) invalide le cache public.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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
  if (!UUID_RE.test(serviceId)) return { error: 'Service invalide.' }

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
  if (!UUID_RE.test(serviceId)) return { error: 'Service invalide.' }
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
  if (!UUID_RE.test(providerId)) return { error: 'Prestataire invalide.' }

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
  if (!UUID_RE.test(serviceId)) return { error: 'Service invalide.' }

  const { error } = await a.ctx.supabase.from('services').update({ is_featured: featured }).eq('id', serviceId)
  if (error) return { error: error.message }

  await log(a.ctx, featured ? 'service.feature' : 'service.unfeature', 'service', serviceId)
  invalidate()
  return { ok: true }
}
