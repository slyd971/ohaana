'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/lib/i18n/navigation'
import { DEMO_MODE, SUPABASE_CONFIGURED } from '@/lib/demo-mode'
import { setDemoRole } from '@/lib/demo-auth'
import { useDemoRole } from '@/hooks/useDemoRole'
import type { UserRole } from '@/types/database'
import type { AuthUser } from './types'

interface AuthState {
  user: AuthUser | null
  role: UserRole | null
  loading: boolean
  isLoggedIn: boolean
  isGuest: boolean
  isClient: boolean
  isProvider: boolean
  isPartner: boolean
  isAdmin: boolean
  isDemo: boolean
  signOut: () => Promise<void>
}

const GUEST: AuthState = {
  user: null, role: null, loading: false, isLoggedIn: false, isGuest: true,
  isClient: false, isProvider: false, isPartner: false, isAdmin: false, isDemo: false,
  signOut: async () => {},
}

const AuthContext = createContext<AuthState>(GUEST)

export function useAuth() {
  return useContext(AuthContext)
}

function buildState(user: AuthUser | null, loading: boolean, isDemo: boolean, signOut: () => Promise<void>): AuthState {
  const role = user?.role ?? null
  return {
    user, role, loading,
    isLoggedIn: user !== null,
    isGuest: user === null && !loading,
    isClient: role === 'tourist',
    isProvider: role === 'provider',
    isPartner: role === 'partner',
    isAdmin: role === 'admin',
    isDemo,
    signOut,
  }
}

// ── Real auth (Supabase) ────────────────────────────────────────────────────
function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<{ user: AuthUser | null; loading: boolean }>({ user: null, loading: true })

  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function load(userId: string | null, email: string) {
      if (!userId) {
        if (active) setState({ user: null, loading: false })
        return
      }
      const { data: profile } = await supabase
        .from('users')
        .select('role, full_name, avatar_url')
        .eq('id', userId)
        .single()
      if (!active) return
      setState({
        loading: false,
        user: {
          id: userId,
          email,
          fullName: profile?.full_name ?? null,
          avatarUrl: profile?.avatar_url ?? null,
          role: profile?.role ?? 'tourist',
        },
      })
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Do not call Supabase synchronously inside this callback (auth-js deadlock) → defer.
      setTimeout(() => { void load(session?.user.id ?? null, session?.user.email ?? '') }, 0)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    await createClient().auth.signOut()
    setState({ user: null, loading: false })
    router.push('/')
    router.refresh()
  }, [router])

  const value = useMemo(() => buildState(state.user, state.loading, false, signOut), [state, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ── Demo mode (NEXT_PUBLIC_DEMO_MODE=true only) ─────────────────────────────
const DEMO_ROLE_MAP = { client: 'tourist', provider: 'provider', partner: 'partner' } as const

function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const demoRole = useDemoRole()

  const signOut = useCallback(async () => {
    setDemoRole(null)
    router.push('/')
  }, [router])

  const value = useMemo(() => {
    const user: AuthUser | null = demoRole
      ? { id: 'demo', email: 'demo@ohaana.test', fullName: 'Compte démo', avatarUrl: null, role: DEMO_ROLE_MAP[demoRole] }
      : null
    return buildState(user, false, true, signOut)
  }, [demoRole, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (DEMO_MODE) return <DemoAuthProvider>{children}</DemoAuthProvider>
  if (SUPABASE_CONFIGURED) return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
  return <AuthContext.Provider value={GUEST}>{children}</AuthContext.Provider>
}
