import { createAdminClient, hasServiceRole } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/site'
import { createOnboardingLink, createProviderAccount, fetchConnectStatus } from './connect'
import type { ConnectStatus } from './connect-status'

// Orchestration serveur du compte de versement d'un prestataire (service_role requis : les colonnes
// stripe_* de provider_profiles sont protégées contre toute écriture depuis le navigateur).

export class PaymentsNotConfigured extends Error {
  constructor() {
    super('payments_not_configured')
  }
}

function assertConfigured() {
  if (!hasServiceRole() || !process.env.STRIPE_SECRET_KEY) throw new PaymentsNotConfigured()
}

async function readAccountId(providerId: string): Promise<string | null> {
  const admin = await createAdminClient()
  const { data } = await admin.from('provider_profiles').select('stripe_account_id').eq('id', providerId).maybeSingle()
  return (data as { stripe_account_id: string | null } | null)?.stripe_account_id ?? null
}

/** Compte Stripe du prestataire, créé au besoin. Deux clics simultanés donnent un seul compte (clé d'idempotence + écriture conditionnelle). */
export async function ensureProviderAccount(providerId: string): Promise<string> {
  assertConfigured()
  const existing = await readAccountId(providerId)
  if (existing) return existing

  const created = await createProviderAccount(providerId)
  const admin = await createAdminClient()
  await admin.from('provider_profiles').update({ stripe_account_id: created }).eq('id', providerId).is('stripe_account_id', null)
  // Si une autre requête a écrit en premier, c'est son compte qui fait foi (même identifiant grâce à l'idempotence).
  return (await readAccountId(providerId)) ?? created
}

/** État du compte, relu chez Stripe puis reporté en base (stripe_onboarded) par la fonction atomique de la migration 010. */
export async function syncProviderPaymentsStatus(providerId: string): Promise<ConnectStatus> {
  assertConfigured()
  const accountId = await readAccountId(providerId)
  if (!accountId) return { state: 'none', ready: false, dueCount: 0 }

  const status = await fetchConnectStatus(accountId)
  const admin = await createAdminClient()
  await admin.rpc('apply_account_updated', { p_account: accountId, p_ready: status.ready })
  return status
}

/** Lien à usage unique vers le formulaire de Stripe. `path` est la page où le prestataire revient (sans langue ni paramètres). */
export async function providerOnboardingUrl(providerId: string, path: string): Promise<string> {
  const accountId = await ensureProviderAccount(providerId)
  return createOnboardingLink(accountId, SITE_URL, path)
}
