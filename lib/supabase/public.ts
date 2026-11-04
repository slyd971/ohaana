import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_KEY } from './config'

/**
 * Cookie-less, session-less client for PUBLIC reads (catalogue, availability, reviews).
 * Because it never touches request cookies, pages using it can stay statically rendered / ISR.
 * Only anon-visible data is reachable (RLS + public views): never use it for user data.
 */
export function createPublicClient() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}
