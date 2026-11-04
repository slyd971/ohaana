import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { routing } from '@/lib/i18n/routing'
import { SUPABASE_URL, SUPABASE_KEY } from '@/lib/supabase/config'

const intlMiddleware = createMiddleware(routing)

const LOCALE_RE = /^\/(fr|en|es)(?=\/|$)/

const protectedRoutes = ['/voyages', '/trips', '/profile', '/bookings', '/onboarding', '/paiement', '/notifications']
const authRoutes = ['/login', '/register']
const providerRoutes = ['/provider']
const adminRoutes = ['/admin']
const partnerRoutes = ['/partner']
const conciergeRoutes = ['/concierge/dashboard']

// Demo mode bypasses ALL authentication. It is opt-in only:
// it is active exclusively when NEXT_PUBLIC_DEMO_MODE === 'true'.
function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
}

function matches(path: string, routes: string[]) {
  return routes.some((r) => path === r || path.startsWith(`${r}/`))
}

function localeOf(pathname: string) {
  return pathname.match(LOCALE_RE)?.[0] ?? ''
}

function withDemoHeaders(response: NextResponse) {
  // A demo deployment must never be indexed.
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }
  return response
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const prefix = localeOf(pathname)
  const path = pathname.replace(LOCALE_RE, '') || '/'

  if (path === '/register') {
    const role = request.nextUrl.searchParams.get('role')
    if (role && !['tourist', 'provider'].includes(role)) {
      const url = request.nextUrl.clone()
      url.searchParams.delete('role')
      return NextResponse.redirect(url)
    }
  }

  const isProtected = matches(path, protectedRoutes)
  const isAuthRoute = matches(path, authRoutes)
  const isProvider = matches(path, providerRoutes)
  const isAdmin = matches(path, adminRoutes)
  const isPartner = matches(path, partnerRoutes)
  const isConcierge = matches(path, conciergeRoutes)

  let response = intlMiddleware(request)

  if (isDemoMode()) return withDemoHeaders(response)

  const needsAuth = isProtected || isProvider || isAdmin || isPartner || isConcierge

  if (!needsAuth && !isAuthRoute) return response

  const url = SUPABASE_URL
  const key = SUPABASE_KEY
  const redirectToLogin = () => {
    const loginUrl = new URL(`${prefix}/login`, request.url)
    loginUrl.searchParams.set('redirectTo', `${pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }

  if (!url || !key) {
    // Misconfigured environment: never expose private areas.
    if (needsAuth) return redirectToLogin()
    return response
  }

  const supabase = createServerClient(url, key, {
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
  })

  if (needsAuth) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return redirectToLogin()

      const needsRole = isAdmin || isProvider || isPartner || isConcierge
      if (needsRole) {
        const { data: profile } = await supabase
          .from('users').select('role').eq('id', user.id).single()
        const role = (profile?.role ?? '') as string

        const allowed =
          (isAdmin && role === 'admin') ||
          (isProvider && ['provider', 'admin'].includes(role)) ||
          (isPartner && ['partner', 'concierge', 'admin'].includes(role)) ||
          (isConcierge && ['concierge', 'admin'].includes(role))

        if (!allowed) return redirectToLogin()
      }
    } catch {
      // Fail CLOSED: if auth cannot be verified, private areas stay private.
      return redirectToLogin()
    }
    return response
  }

  // Auth pages: bounce signed-in users away.
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) return NextResponse.redirect(new URL(`${prefix}/`, request.url))
  } catch {
    // ignore — show the auth page anyway
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
