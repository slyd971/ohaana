import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { DEFAULT_COMMISSION_PCT } from '@/lib/utils'

export const SETTINGS_TAG = 'settings'

/**
 * Taux de commission en vigueur (en %). Lu via la fonction get_commission_pct() (migration 009), bornée à
 * [0, 50]. Si la migration n'est pas encore appliquée ou si la base est injoignable, on retombe sur 20 %
 * plutôt que de bloquer une réservation. Mémorisé 60 s ; l'admin invalide le tag à chaque changement.
 */
export const getCommissionPct = unstable_cache(
  async (): Promise<number> => {
    try {
      const { data, error } = await createPublicClient().rpc('get_commission_pct')
      if (error || typeof data !== 'number' && typeof data !== 'string') return DEFAULT_COMMISSION_PCT
      const pct = Number(data)
      return Number.isFinite(pct) ? pct : DEFAULT_COMMISSION_PCT
    } catch {
      return DEFAULT_COMMISSION_PCT
    }
  },
  ['commission-pct'],
  { tags: [SETTINGS_TAG], revalidate: 60 },
)
