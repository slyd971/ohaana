'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Mail, Lock, User, Briefcase, Handshake } from 'lucide-react'
import { setDemoRole } from '@/lib/demo-auth'

export default function LoginPage() {
  const t = useTranslations('auth')
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function canUseSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

    return Boolean(url && key && !url.includes('placeholder') && !key.includes('placeholder'))
  }

  function createAuthClient() {
    if (!canUseSupabase()) {
      throw new Error('Mode démo actif : authentification désactivée.')
    }

    return createClient()
  }

  function getRedirectTo() {
    if (typeof window === 'undefined') return '/'

    const redirectTo = new URLSearchParams(window.location.search).get('redirectTo')
    if (!redirectTo?.startsWith('/') || redirectTo.startsWith('//')) return '/'

    return redirectTo
  }

  async function handleEmailLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    let authError: Error | null = null

    try {
      const supabase = createAuthClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      authError = error
    } catch (error) {
      authError = error instanceof Error ? error : new Error('Connexion indisponible.')
    }

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push(getRedirectTo())
    router.refresh()
  }

  async function handleGoogleLogin() {
    setLoading(true)
    setError(null)

    const next = getRedirectTo()
    const callbackUrl = new URL('/api/auth/callback', location.origin)
    callbackUrl.searchParams.set('next', next)

    try {
      const supabase = createAuthClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: callbackUrl.toString() },
      })

      if (error) throw error
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Connexion Google indisponible.')
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-w-0 space-y-8">
      {/* Heading */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-display text-charcoal">{t('loginTitle')}</h1>
        <p className="text-stone text-sm text-balance">{t('loginSubtitle')}</p>
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="flex h-12 w-full min-w-0 items-center justify-center gap-3 rounded-xl border border-mist bg-surface px-3 text-sm font-medium text-charcoal transition-colors hover:bg-sand disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
        </svg>
        {t('continueWithGoogle')}
      </button>

      <div className="flex items-center gap-3 text-stone text-sm">
        <div className="flex-1 h-px bg-mist" />
        ou
        <div className="flex-1 h-px bg-mist" />
      </div>

      {/* Email form */}
      <form onSubmit={handleEmailLogin} className="w-full min-w-0 space-y-4" noValidate>
        <Input
          label={t('email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          leftIcon={<Mail size={16} />}
        />
        <Input
          label={t('password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          leftIcon={<Lock size={16} />}
          error={error ?? undefined}
        />

        <div className="flex justify-end">
          <Link href="/reset-password" className="text-xs text-stone hover:text-deep-green transition-colors">
            {t('forgotPassword')}
          </Link>
        </div>

        <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
          {t('login')}
        </Button>
      </form>

      <p className="text-center text-sm text-stone text-balance">
        {t('noAccount')}{' '}
        <Link href="/register" className="text-deep-green font-medium hover:underline">
          {t('register')}
        </Link>
      </p>

      {/* ── Mode démo ── */}
      <div className="border-t border-mist pt-6 space-y-3">
        <p className="text-center text-[11px] text-stone uppercase tracking-widest">Accès démo</p>

        <button
          type="button"
          onClick={() => { setDemoRole('client'); router.push('/voyages') }}
          className="w-full flex items-center gap-3 h-12 rounded-xl border border-mist bg-sand hover:bg-mist px-4 text-sm font-medium text-charcoal transition-colors"
        >
          <span className="w-8 h-8 rounded-full bg-deep-green/10 flex items-center justify-center flex-none">
            <User size={15} className="text-deep-green" />
          </span>
          <span className="flex-1 text-left">
            Parcours Client
            <span className="block text-[11px] text-stone font-normal">Réservations · Carnet · Favoris</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setDemoRole('provider'); router.push('/provider/dashboard') }}
          className="w-full flex items-center gap-3 h-12 rounded-xl border border-mist bg-sand hover:bg-mist px-4 text-sm font-medium text-charcoal transition-colors"
        >
          <span className="w-8 h-8 rounded-full bg-coral/10 flex items-center justify-center flex-none">
            <Briefcase size={15} className="text-coral" />
          </span>
          <span className="flex-1 text-left">
            Parcours Prestataire
            <span className="block text-[11px] text-stone font-normal">Dashboard · Services · Paiements</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setDemoRole('partner'); router.push('/partner/dashboard') }}
          className="w-full flex items-center gap-3 h-12 rounded-xl border border-mist bg-sand hover:bg-mist px-4 text-sm font-medium text-charcoal transition-colors"
        >
          <span className="w-8 h-8 rounded-full bg-turquoise/10 flex items-center justify-center flex-none">
            <Handshake size={15} className="text-turquoise" />
          </span>
          <span className="flex-1 text-left">
            Parcours Partenaire
            <span className="block text-[11px] text-stone font-normal">Commissions · Apports · Lien affilié</span>
          </span>
        </button>
      </div>
    </div>
  )
}
