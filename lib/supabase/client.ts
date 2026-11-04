import { createBrowserClient } from '@supabase/ssr'
import { SUPABASE_URL, SUPABASE_KEY } from './config'

// Untyped on purpose: types/database.ts is hand-written and does not cover views / RPCs.
// Replace with `createBrowserClient<Database>` once `supabase gen types typescript` output is committed.
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
}
