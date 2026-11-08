import { statusFromAccount, type ConnectStatus } from './connect-status'

// Comptes de versement des prestataires (Stripe Connect). Votre plateforme est en « gestion du risque par
// Stripe » : chaque prestataire est le vendeur sur son propre compte (paiements directs), Ohaana prélève
// sa commission. Cette combinaison (dashboard Express + pertes gérées par Stripe) est en bêta publique et
// demande la version d'API « preview » ci-dessous, sur l'API Accounts v2.
export const STRIPE_V2_VERSION = '2026-10-28.preview'

export class StripeApiError extends Error {
  constructor(
    message: string,
    readonly code: string | null,
  ) {
    super(message)
  }
}

function secretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new StripeApiError('STRIPE_SECRET_KEY manquante', 'not_configured')
  return key
}

async function parse<T>(res: Response): Promise<T> {
  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string; code?: string } }
  if (!res.ok || body.error) {
    throw new StripeApiError(body.error?.message ?? `Stripe a répondu ${res.status}`, body.error?.code ?? null)
  }
  return body as T
}

/**
 * Crée le compte du prestataire. En France, Stripe refuse que la plateforme envoie l'identité (e-mail, nom…) :
 * le prestataire la saisit lui-même dans le formulaire hébergé par Stripe. On ne fournit donc que le pays et
 * un identifiant de rattachement. La clé d'idempotence évite deux comptes en cas de double clic.
 */
export async function createProviderAccount(providerId: string): Promise<string> {
  const res = await fetch('https://api.stripe.com/v2/core/accounts', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${secretKey()}:`).toString('base64')}`,
      'Stripe-Version': STRIPE_V2_VERSION,
      'Content-Type': 'application/json',
      'Idempotency-Key': `ohaana-provider-account-${providerId}`,
    },
    body: JSON.stringify({
      dashboard: 'express',
      identity: { country: 'fr' },
      defaults: { responsibilities: { fees_collector: 'stripe', losses_collector: 'stripe' } },
      configuration: { merchant: { capabilities: { card_payments: { requested: true } } } },
      metadata: { ohaana_provider_id: providerId },
    }),
  })
  const account = await parse<{ id: string }>(res)
  return account.id
}

export async function fetchConnectStatus(accountId: string): Promise<ConnectStatus> {
  const url = `https://api.stripe.com/v2/core/accounts/${encodeURIComponent(accountId)}?include%5B0%5D=configuration.merchant&include%5B1%5D=requirements`
  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${secretKey()}:`).toString('base64')}`,
      'Stripe-Version': STRIPE_V2_VERSION,
    },
    cache: 'no-store',
  })
  return statusFromAccount(await parse(res))
}

/** Lien à usage unique vers le formulaire hébergé par Stripe (identité, adresse, IBAN). Ne jamais le stocker ni l'envoyer par e-mail. */
export async function createOnboardingLink(accountId: string, origin: string, path: string): Promise<string> {
  const res = await fetch('https://api.stripe.com/v1/account_links', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${secretKey()}:`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      account: accountId,
      type: 'account_onboarding',
      refresh_url: `${origin}${path}?stripe=refresh`,
      return_url: `${origin}${path}?stripe=return`,
      'collection_options[fields]': 'eventually_due',
    }),
  })
  const link = await parse<{ url: string }>(res)
  return link.url
}
