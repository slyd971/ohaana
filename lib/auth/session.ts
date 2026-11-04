import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from '@/lib/i18n/navigation'
import { DEMO_MODE, SUPABASE_CONFIGURED } from '@/lib/demo-mode'
import type { UserRole } from '@/types/database'
import type { AuthUser } from './types'

/**
 * Current user, verified server-side with Supabase (getUser() validates the JWT; never trust
 * getSession() alone on the server). Cached per request.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  if (!SUPABASE_CONFIGURED) return null

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
      .from('users')
      .select('role, full_name, avatar_url, is_active')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.is_active) return null

    return {
      id: user.id,
      email: user.email ?? '',
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      role: profile.role as UserRole,
    }
  } catch {
    return null
  }
})

/**
 * Server-side guard for layouts and pages (defence in depth on top of proxy.ts).
 * Redirects to /login when signed out, and to the home page when the role is not allowed.
 * In demo mode the guard is skipped (the whole app is open by design).
 */
export async function requireRole(allowed: UserRole[], locale: string): Promise<AuthUser | null> {
  if (DEMO_MODE) return null

  const user = await getCurrentUser()
  if (!user) redirect({ href: '/login', locale })
  else if (!allowed.includes(user.role)) redirect({ href: '/', locale })
  return user
}

/** Guard for pages that only need a signed-in user, whatever the role. */
export async function requireUser(locale: string): Promise<AuthUser | null> {
  if (DEMO_MODE) return null
  const user = await getCurrentUser()
  if (!user) redirect({ href: '/login', locale })
  return user
}
