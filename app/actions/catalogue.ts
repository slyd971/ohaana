'use server'

import { getServicesByIds } from '@/lib/data/services'
import type { ServiceView } from '@/lib/data/types'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Public catalogue lookup for client components (favourites, trip planner). Public data only. */
export async function loadServicesByIds(ids: string[]): Promise<ServiceView[]> {
  const clean = [...new Set(ids)].filter((id) => typeof id === 'string' && UUID_RE.test(id)).slice(0, 50)
  if (clean.length === 0) return []
  try {
    return await getServicesByIds(clean)
  } catch (error) {
    console.error('[catalogue] loadServicesByIds failed:', error instanceof Error ? error.message : error)
    return []
  }
}
