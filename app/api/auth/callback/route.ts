import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const LOCALE_RE = /^\/(fr|en|es)(?=\/|$)/

// Only same-origin relative paths are allowed: "/x" yes, "//evil.com", "/\evil.com",
// "https://evil.com" and anything with control characters no.
function safeNextPath(raw: string | null): string {
  if (!raw) return '/'
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return '/'
  if (/[\u0000-\u001f]/.test(raw)) return '/'
  return raw
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = safeNextPath(url.searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin))
    }
  }

  const prefix = next.match(LOCALE_RE)?.[0] ?? ''
  return NextResponse.redirect(new URL(`${prefix}/login?error=auth_callback`, url.origin))
}
