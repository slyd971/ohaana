'use server'

import { createAdminClient, createClient, hasServiceRole } from '@/lib/supabase/server'
import { DEMO_MODE } from '@/lib/demo-mode'
import { anonymisedEmail, isRemovalVerdict, REMOVAL_MESSAGES } from '@/lib/legal/account-removal'
import { LEGAL_VERSIONS, type LegalDocument } from '@/lib/legal/versions'

// Droits RGPD de l'utilisateur connecté : accès / portabilité (export JSON) et effacement.
// L'identité vient toujours de la session, jamais d'un paramètre fourni par le navigateur.

export type ExportResult = { ok: true; filename: string; json: string } | { ok: false; error: string }
export type DeleteResult = { ok: true; mode: 'deleted' | 'anonymised' } | { ok: false; error: string }

export async function exportMyDataAction(): Promise<ExportResult> {
  if (DEMO_MODE) return { ok: false, error: 'Mode démo : aucune donnée personnelle n’est enregistrée.' }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Connectez-vous pour exporter vos données.' }

  const { data, error } = await supabase.rpc('export_my_data')
  if (error || !data) return { ok: false, error: 'Export impossible pour le moment.' }
  const day = new Date().toISOString().slice(0, 10)
  return { ok: true, filename: `ohaana-mes-donnees-${day}.json`, json: JSON.stringify(data, null, 2) }
}

/**
 * Supprime le compte. Sans trace comptable : effacement complet. Avec des réservations passées : anonymisation
 * (la comptabilité impose de conserver les écritures, pas l'identité). Refusé tant qu'une prestation confirmée reste à venir.
 */
export async function deleteMyAccountAction(confirmEmail: string): Promise<DeleteResult> {
  if (DEMO_MODE) return { ok: false, error: 'Mode démo : la suppression est désactivée.' }
  if (!hasServiceRole()) return { ok: false, error: 'Suppression indisponible pour le moment. Écrivez-nous pour exercer votre droit à l’effacement.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Connectez-vous pour supprimer votre compte.' }
  // Garde-fou contre un clic involontaire : l'adresse du compte doit être retapée.
  if (!user.email || confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
    return { ok: false, error: 'L’adresse saisie ne correspond pas à celle du compte.' }
  }

  const admin = await createAdminClient()
  const { data: verdict, error } = await admin.rpc('prepare_account_removal', { p_user: user.id })
  if (error || !isRemovalVerdict(verdict)) {
    console.error('[account] prepare_account_removal failed:', error?.message)
    return { ok: false, error: 'Suppression impossible pour le moment. Réessayez ou écrivez-nous.' }
  }
  if (verdict === 'blocked_upcoming' || verdict === 'blocked_role') return { ok: false, error: REMOVAL_MESSAGES[verdict] }

  if (verdict === 'deletable') {
    const { error: delError } = await admin.auth.admin.deleteUser(user.id)
    if (delError) {
      console.error('[account] deleteUser failed:', delError.message)
      return { ok: false, error: 'Suppression impossible pour le moment. Réessayez ou écrivez-nous.' }
    }
  } else {
    // Anonymisé côté base : on libère l'adresse email et on interdit toute reconnexion.
    const { error: banError } = await admin.auth.admin.updateUserById(user.id, {
      email: anonymisedEmail(user.id),
      email_confirm: true,
      ban_duration: '876000h',
      user_metadata: {},
    })
    if (banError) {
      console.error('[account] anonymise auth user failed:', banError.message)
      return { ok: false, error: 'Suppression incomplète : écrivez-nous pour finaliser.' }
    }
  }

  await supabase.auth.signOut()
  return { ok: true, mode: verdict === 'deletable' ? 'deleted' : 'anonymised' }
}

/** Enregistre l'acceptation d'une version d'un document par l'utilisateur connecté (version courante uniquement). */
export async function acceptLegalDocumentAction(document: LegalDocument, source: 'settings' | 'provider_onboarding'): Promise<{ ok: boolean; error?: string }> {
  if (!(document in LEGAL_VERSIONS)) return { ok: false, error: 'Document inconnu.' }
  const supabase = await createClient()
  const { error } = await supabase.rpc('accept_legal', { p_document: document, p_version: LEGAL_VERSIONS[document], p_source: source })
  return error ? { ok: false, error: 'Enregistrement impossible.' } : { ok: true }
}
