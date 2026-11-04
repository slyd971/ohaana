import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import { DEMO_MODE } from '@/lib/demo-mode'
import type { SupabaseClient } from '@supabase/supabase-js'

export type AdminContext =
  | { kind: 'demo' }
  | { kind: 'forbidden' }
  | { kind: 'admin'; userId: string; supabase: SupabaseClient }

/**
 * Identity of the current admin, re-read from the database on every request (role + is_active come from
 * public.users through RLS). Queries made through `supabase` run as that admin: the `is_admin()` policies
 * and the 004 triggers still apply, so nothing here widens what the database allows.
 */
export const getAdminContext = cache(async (): Promise<AdminContext> => {
  if (DEMO_MODE) return { kind: 'demo' }
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') return { kind: 'forbidden' }
  return { kind: 'admin', userId: user.id, supabase: await createClient() }
})
