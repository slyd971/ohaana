import { SITE_URL } from '@/lib/site'

/** Absolute callback URL registered in Supabase (Authentication → URL Configuration). */
export function buildCallbackUrl(params: { next?: string; locale: string; role?: 'provider'; terms?: string }) {
  // location.origin keeps preview deployments and localhost working; fall back to SITE_URL during SSR.
  const origin = typeof window !== 'undefined' ? window.location.origin : SITE_URL
  const url = new URL('/api/auth/callback', origin)
  if (params.next) url.searchParams.set('next', params.next)
  url.searchParams.set('locale', params.locale)
  if (params.role) url.searchParams.set('role', params.role)
  if (params.terms) url.searchParams.set('terms', params.terms)
  return url.toString()
}
