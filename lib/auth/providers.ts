import { SUPABASE_URL, SUPABASE_KEY } from '@/lib/supabase/config'

export interface EnabledProviders {
  google: boolean
}

/**
 * Which social providers are switched on in the Supabase project (public /auth/v1/settings endpoint).
 * Fails closed: if the lookup fails, no social button is shown rather than one that leads to a raw
 * "provider is not enabled" JSON page.
 */
export async function getEnabledProviders(): Promise<EnabledProviders> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return { google: false }
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_KEY },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return { google: false }
    const data = (await res.json()) as { external?: Record<string, boolean> }
    return { google: Boolean(data.external?.google) }
  } catch {
    return { google: false }
  }
}
