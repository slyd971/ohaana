'use client'

import { useState } from 'react'
import { useRouter as useNextRouter, useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Link, useRouter } from '@/lib/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { Mail, Lock, User, Briefcase, Handshake, CheckCircle2 } from 'lucide-react'
import { setDemoRole } from '@/lib/demo-auth'
import { DEMO_MODE } from '@/lib/demo-mode'
import { loginSchema, magicLinkSchema, fieldErrors } from '@/lib/auth/schemas'
import { authErrorKey } from '@/lib/auth/errors'
import { ROLE_HOME, safeRedirectPath } from '@/lib/auth/types'
import { buildCallbackUrl } from '@/lib/auth/client-utils'
import { useCooldown } from '@/hooks/useCooldown'

const MAX_FAILURES = 5
const COOLDOWN_SECONDS = 30

export default function LoginPage() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const i18nRouter = useRouter()
  const router = useNextRouter()
  const params = useSearchParams()

  const redirectTo = safeRedirectPath(params.get('redirectTo'), '')
  const callbackFailed = params.get('error') === 'callback'

  const [mode, setMode] = useState<'password' | 'link'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(callbackFailed ? 'callbackError' : null)
  const [linkSent, setLinkSent] = useState(false)
  const [failures, setFailures] = useState(0)
  const { remaining, start } = useCooldown()

  const locked = remaining > 0

  function fieldError(name: string) {
    return errors[name] ? t(`validation.${errors[name]}` as 'validation.required') : undefined
  }

  async function handlePasswordLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (locked) return
    setFormError(null)

    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
      if (error) throw error

      const { data: profile } = await supabase.from('users').select('role').eq('id', data.user.id).single()
      router.refresh()
      if (redirectTo) router.push(redirectTo)     // already carries the locale prefix (set by proxy.ts)
      else i18nRouter.push(ROLE_HOME[profile?.role ?? 'tourist'])
    } catch (error) {
      const key = authErrorKey(error)
      const next = failures + 1
      setFailures(next)
      if (key === 'invalidCredentials' && next >= MAX_FAILURES) {
        start(COOLDOWN_SECONDS)
        setFailures(0)
      }
      setFormError(key)
      setLoading(false)
    }
  }

  async function handleMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)

    const parsed = magicLinkSchema.safeParse({ email })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setLoading(true)

    try {
      const { error } = await createClient().auth.signInWithOtp({
        email: parsed.data.email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: buildCallbackUrl({ next: redirectTo || undefined, locale }),
        },
      })
      // "user not found" is deliberately indistinguishable from success (no account enumeration).
      if (error && authErrorKey(error) !== 'generic') throw error
      setLinkSent(true)
    } catch (error) {
      setFormError(authErrorKey(error))
    }
    setLoading(false)
  }

  async function handleGoogleLogin() {
    setLoading(true)
    setFormError(null)
    try {
      const { error } = await createClient().auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: buildCallbackUrl({ next: redirectTo || undefined, locale }) },
      })
      if (error) throw error
    } catch (error) {
      setFormError(authErrorKey(error))
      setLoading(false)
    }
  }

  if (linkSent) {
    return (
      <div className="text-center space-y-4 py-8" role="status">
        <div className="w-16 h-16 rounded-full bg-deep-green/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="text-deep-green" size={28} />
        </div>
        <h1 className="text-2xl font-display text-charcoal">{t('magicLinkSentTitle')}</h1>
        <p className="text-stone text-sm max-w-xs mx-auto">{t('magicLinkSentBody', { email })}</p>
        <p className="text-xs text-stone">{t('checkSpam')}</p>
        <Button variant="ghost" onClick={() => { setLinkSent(false); setMode('password') }}>{t('backToLogin')}</Button>
      </div>
    )
  }

  const errorMessage = locked
    ? t('tooManyAttempts', { seconds: remaining })
    : formError
      ? t(formError === 'callbackError' ? 'callbackError' : (`errors.${formError}` as 'errors.generic'))
      : null

  return (
    <div className="w-full min-w-0 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-display text-charcoal">{t('loginTitle')}</h1>
        <p className="text-stone text-sm text-balance">{t('loginSubtitle')}</p>
      </div>

      <GoogleButton label={t('continueWithGoogle')} onClick={handleGoogleLogin} disabled={loading} />

      <div className="flex items-center gap-3 text-stone text-sm">
        <div className="flex-1 h-px bg-mist" />
        {t('or')}
        <div className="flex-1 h-px bg-mist" />
      </div>

      <form
        onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink}
        className="w-full min-w-0 space-y-4"
        noValidate
      >
        <Input
          label={t('email')}
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          leftIcon={<Mail size={16} />}
          error={fieldError('email')}
        />
        {mode === 'password' && (
          <>
            <Input
              label={t('password')}
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              leftIcon={<Lock size={16} />}
              error={fieldError('password')}
            />
            <div className="flex justify-end">
              <Link href="/reset-password" className="text-xs text-stone hover:text-deep-green transition-colors">
                {t('forgotPassword')}
              </Link>
            </div>
          </>
        )}

        {errorMessage && (
          <p role="alert" className="text-sm text-coral">{errorMessage}</p>
        )}

        <Button type="submit" loading={loading} disabled={locked} fullWidth size="lg" className="mt-2">
          {mode === 'password' ? t('login') : t('sendMagicLink')}
        </Button>

        <button
          type="button"
          onClick={() => { setMode(mode === 'password' ? 'link' : 'password'); setErrors({}); setFormError(null) }}
          className="w-full text-center text-sm text-stone hover:text-deep-green transition-colors"
        >
          {mode === 'password' ? t('loginWithLink') : t('loginWithPassword')}
        </button>
      </form>

      <p className="text-center text-sm text-stone text-balance">
        {t('noAccount')}{' '}
        <Link href="/register" className="text-deep-green font-medium hover:underline">
          {t('register')}
        </Link>
      </p>

      {DEMO_MODE && (
        <div className="border-t border-mist pt-6 space-y-3">
          <p className="text-center text-[11px] text-stone uppercase tracking-widest">Accès démo</p>
          {[
            { role: 'client' as const, href: '/voyages', title: 'Parcours Client', sub: 'Réservations · Carnet · Favoris', Icon: User, tone: 'bg-deep-green/10 text-deep-green' },
            { role: 'provider' as const, href: '/provider/dashboard', title: 'Parcours Prestataire', sub: 'Dashboard · Services · Paiements', Icon: Briefcase, tone: 'bg-coral/10 text-coral' },
            { role: 'partner' as const, href: '/partner/dashboard', title: 'Parcours Partenaire', sub: 'Commissions · Apports · Lien affilié', Icon: Handshake, tone: 'bg-turquoise/10 text-turquoise' },
          ].map(({ role, href, title, sub, Icon, tone }) => (
            <button
              key={role}
              type="button"
              onClick={() => { setDemoRole(role); i18nRouter.push(href) }}
              className="w-full flex items-center gap-3 h-12 rounded-xl border border-mist bg-sand hover:bg-mist px-4 text-sm font-medium text-charcoal transition-colors"
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-none ${tone}`}>
                <Icon size={15} />
              </span>
              <span className="flex-1 text-left">
                {title}
                <span className="block text-[11px] text-stone font-normal">{sub}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
