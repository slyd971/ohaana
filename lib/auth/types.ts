import type { UserRole } from '@/types/database'

export interface AuthUser {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  role: UserRole
}

/** Landing page of each role after sign-in. */
export const ROLE_HOME: Record<UserRole, string> = {
  tourist: '/voyages',
  provider: '/provider/dashboard',
  partner: '/partner/dashboard',
  concierge: '/concierge/dashboard',
  admin: '/admin/dashboard',
}

/** Only same-origin relative paths are accepted as post-login destinations. */
export function safeRedirectPath(raw: string | null | undefined, fallback = '/'): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return fallback
  if (/[\u0000-\u001f]/.test(raw)) return fallback
  return raw
}
