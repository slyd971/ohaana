import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { routing } from '@/lib/i18n/routing'

const intlMiddleware = createMiddleware(routing)

const protectedRoutes = ['/voyages', '/trips', '/profile', '/bookings', '/onboarding']
const authRoutes = ['/login', '/register']
const providerRoutes = ['/provider']
const adminRoutes = ['/admin']
const conciergeRoutes = ['/concierge/dashboard']

// Demo mode: all routes accessible without auth.
// Active by default for investor/demo deployments. Set NEXT_PUBLIC_DEMO_MODE=false
// to enforce Supabase auth when production credentials are ready.
function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'false') return false
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return true

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  const hasUrl = url.length > 0 && !url.includes('placeholder')
  const hasKey = key.length > 0 && !key.includes('placeholder')
  return process.env.NODE_ENV === 'production' || !(hasUrl && hasKey)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const pathnameWithoutLocale = pathname.replace(/^\/(fr|en|es)/, '') || '/'

  if (pathnameWithoutLocale === '/register') {
    const role = request.nextUrl.searchParams.get('role')
    if (role && !['tourist', 'provider'].includes(role)) {
      const url = request.nextUrl.clone()
      url.searchParams.delete('role')
      return NextResponse.redirect(url)
    }
  }

  const isProtected = protectedRoutes.some((r) => pathnameWithoutLocale.startsWith(r))
  const isAuthRoute = authRoutes.some((r) => pathnameWithoutLocale.startsWith(r))
  const isProvider = providerRoutes.some((r) => pathnameWithoutLocale.startsWith(r))
  const isAdmin = adminRoutes.some((r) => pathnameWithoutLocale.startsWith(r))
  const isConcierge = conciergeRoutes.some((r) => pathnameWithoutLocale.startsWith(r))

  let response = intlMiddleware(request)

  if (isDemoMode()) return response

  if (isProtected || isProvider || isAdmin || isConcierge) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return request.cookies.getAll() },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              response = NextResponse.next({ request })
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              )
            },
          },
        }
      )

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        const localeMatch = pathname.match(/^\/(fr|en|es)(?=\/|$)/)
        const localePrefix = localeMatch?.[0] ?? ''
        const loginUrl = new URL(`${localePrefix}/login`, request.url)
        loginUrl.searchParams.set('redirectTo', `${pathname}${request.nextUrl.search}`)
        return NextResponse.redirect(loginUrl)
      }

      const { data: profile } = await supabase
        .from('users').select('role').eq('id', user.id).single()
      const role = profile?.role ?? ''

      if (isAdmin && role !== 'admin')
        return NextResponse.redirect(new URL('/', request.url))
      if (isProvider && !['provider', 'admin'].includes(role))
        return NextResponse.redirect(new URL('/', request.url))
      if (isConcierge && !['concierge', 'admin'].includes(role))
        return NextResponse.redirect(new URL('/', request.url))
    } catch {
      // Supabase unreachable → fail open for demo resilience
      return response
    }
  }

  if (isAuthRoute) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return request.cookies.getAll() },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              response = NextResponse.next({ request })
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              )
            },
          },
        }
      )
      const { data: { user } } = await supabase.auth.getUser()
      if (user) return NextResponse.redirect(new URL('/', request.url))
    } catch {
      // ignore — show the auth page anyway
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
