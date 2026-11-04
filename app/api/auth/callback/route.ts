import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { ROLE_HOME, safeRedirectPath } from '@/lib/auth/types'
import { localePrefix } from '@/lib/auth/locale'

const LOCALE_RE = /^\/(fr|en|es)(?=\/|$)/
const OTP_TYPES: EmailOtpType[] = ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email']

/**
 * Single landing point for every Supabase email / OAuth link:
 *  - ?code=...                  PKCE flow (OAuth, magic link, signup confirmation, recovery)
 *  - ?token_hash=...&type=...   token-hash flow (works across devices; see README email templates)
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as EmailOtpType | null
  const next = safeRedirectPath(url.searchParams.get('next'), '')
  const localeParam = url.searchParams.get('locale')
  const prefix = next.match(LOCALE_RE)?.[0] ?? localePrefix(localeParam ?? 'fr')

  const supabase = await createClient()
  let ok = false

  if (tokenHash && type && OTP_TYPES.includes(type)) {
    ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error
  } else if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error
  }

  if (!ok) {
    return NextResponse.redirect(new URL(`${prefix}/login?error=callback`, url.origin))
  }

  // Provider sign-up through OAuth: upgrade tourist -> provider (the RPC refuses any other role change).
  if (url.searchParams.get('role') === 'provider') {
    await supabase.rpc('become_provider')
  }

  // Destinations written without a locale ("/provider/onboarding") inherit the user's locale.
  const localizedNext = next && !LOCALE_RE.test(next) ? `${prefix}${next}` : next

  if (type === 'recovery') {
    return NextResponse.redirect(new URL(localizedNext || `${prefix}/update-password`, url.origin))
  }

  if (localizedNext && next !== '/') {
    return NextResponse.redirect(new URL(localizedNext, url.origin))
  }

  // No explicit destination: send each role to its own space.
  const { data: { user } } = await supabase.auth.getUser()
  let home = '/'
  if (user) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (profile?.role) home = ROLE_HOME[profile.role]
  }
  return NextResponse.redirect(new URL(`${prefix}${home}`, url.origin))
}
