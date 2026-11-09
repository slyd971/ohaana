import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { DEMO_MODE, SUPABASE_CONFIGURED } from '@/lib/demo-mode'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface ProviderRow {
  id: string
  user_id: string | null
  business_name: string
  bio: string | null
  languages: string[]
  island: string
  phone: string | null
  whatsapp: string | null
  is_approved: boolean
  stripe_onboarded: boolean
  avg_rating: number
  review_count: number
  legal_status: string | null
  siret: string | null
  vat_number: string | null
  insurance_confirmed: boolean
  insurance_expires_on: string | null
  compliance_verified_at: string | null
}

export type ProviderContext =
  | { kind: 'demo' }
  | { kind: 'anonymous' }
  | { kind: 'no_profile'; userId: string }
  | { kind: 'provider'; userId: string; provider: ProviderRow; supabase: SupabaseClient }

const COLUMNS =
  'id, user_id, business_name, bio, languages, island, phone, whatsapp, is_approved, stripe_onboarded, avg_rating, review_count, legal_status, siret, vat_number, insurance_confirmed, insurance_expires_on, compliance_verified_at'

/**
 * Identity + provider profile of the current request, always re-read from Supabase (getUser() validates
 * the JWT). Every query made through `supabase` runs under the user's RLS, so a provider only ever sees
 * and edits their own rows. In demo mode the back-office shows static example data instead.
 */
export const getProviderContext = cache(async (): Promise<ProviderContext> => {
  if (DEMO_MODE) return { kind: 'demo' }
  if (!SUPABASE_CONFIGURED) return { kind: 'anonymous' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { kind: 'anonymous' }

  const { data: provider } = await supabase
    .from('provider_profiles')
    .select(COLUMNS)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!provider) return { kind: 'no_profile', userId: user.id }
  return { kind: 'provider', userId: user.id, provider: provider as ProviderRow, supabase }
})
