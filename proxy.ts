import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { routing } from '@/lib/i18n/routing'

const intlMiddleware = createMiddleware(routing)

const protectedRoutes = ['/trips', '/profile', '/bookings', '/onboarding']
const authRoutes = ['/login', '/register']
const providerRoutes = ['/provider']
const adminRoutes = ['/admin']
const conciergeRoutes = ['/concierge/dashboard']
const hotelRoutes = ['/hotel']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Strip locale prefix for route matching
  const pathnameWithoutLocale = pathname.replace(/^\/(fr|en)/, '') || '/'

  const isProtected = protectedRoutes.some((r) => pathnameWithoutLocale.startsWith(r))
  const isAuthRoute = authRoutes.some((r) => pathnameWithoutLocale.startsWith(r))
  const isProvider = providerRoutes.some((r) => pathnameWithoutLocale.startsWith(r))
  const isAdmin = adminRoutes.some((r) => pathnameWithoutLocale.startsWith(r))
  const isConcierge = conciergeRoutes.some((r) => pathnameWithoutLocale.startsWith(r))
  const isHotel = hotelRoutes.some((r) => pathnameWithoutLocale.startsWith(r))

  let response = intlMiddleware(request)

  // Demo mode: skip auth checks when Supabase is not configured
  const supabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder'))

  if (!supabaseConfigured) return response

  if (isProtected || isProvider || isAdmin || isConcierge || isHotel) {
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
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (isAdmin) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    if (isProvider) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!['provider', 'admin'].includes(profile?.role ?? '')) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    if (isConcierge) {
      const { data: profile } = await supabase
        .from('users').select('role').eq('id', user.id).single()
      if (!['concierge', 'admin'].includes(profile?.role ?? '')) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    if (isHotel) {
      const { data: profile } = await supabase
        .from('users').select('role').eq('id', user.id).single()
      if (!['hotel', 'villa', 'admin'].includes(profile?.role ?? '')) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  if (isAuthRoute) {
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
    if (user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
