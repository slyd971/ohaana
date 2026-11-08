// État d'un compte de versement d'un prestataire, lu depuis l'API Stripe Accounts v2.
// Fonction pure (sans appel réseau) : testable avec des réponses réelles.

export type ConnectState =
  | 'none' // aucun compte Stripe créé pour ce prestataire
  | 'incomplete' // le prestataire doit encore fournir des informations à Stripe
  | 'pending' // tout est fourni, Stripe vérifie
  | 'active' // peut encaisser des paiements
  | 'closed'

export interface ConnectStatus {
  state: ConnectState
  ready: boolean
  /** Nombre d'informations que le prestataire doit encore fournir. */
  dueCount: number
}

interface V2Account {
  closed?: boolean | null
  configuration?: {
    merchant?: { capabilities?: { card_payments?: { status?: string } } }
  } | null
  requirements?: { entries?: { awaiting_action_from?: string }[] } | null
}

export function statusFromAccount(account: V2Account | null | undefined): ConnectStatus {
  if (!account) return { state: 'none', ready: false, dueCount: 0 }
  if (account.closed) return { state: 'closed', ready: false, dueCount: 0 }

  const entries = account.requirements?.entries ?? []
  const dueCount = entries.filter((e) => e.awaiting_action_from === 'user').length

  // Seul le statut « active » de card_payments autorise à encaisser : ne jamais déduire « prêt » de l'absence d'exigences.
  if (account.configuration?.merchant?.capabilities?.card_payments?.status === 'active') {
    return { state: 'active', ready: true, dueCount }
  }
  return { state: dueCount > 0 ? 'incomplete' : 'pending', ready: false, dueCount }
}
