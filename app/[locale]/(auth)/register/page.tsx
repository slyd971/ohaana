'use client'

import { use, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { Mail, Lock, User } from 'lucide-react'
import { registerSchema, fieldErrors } from '@/lib/auth/schemas'
import { authErrorKey } from '@/lib/auth/errors'
import { buildCallbackUrl } from '@/lib/auth/client-utils'

type Role = 'tourist' | 'provider'
const PUBLIC_ROLES: Role[] = ['tourist', 'provider']

interface RegisterPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  const t = useTranslations('auth')
  const locale = useLocale()
  const params = use(searchParams)
  const roleParam = Array.isArray(params.role) ? params.role[0] : params.role
  const requestedRole = PUBLIC_ROLES.find((r) => r === roleParam)

  const [step, setStep] = useState<'role' | 'form' | 'done'>(requestedRole ? 'form' : 'role')
  const [role, setRole] = useState<Role>(requestedRole ?? 'tourist')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const nextPath = role === 'provider' ? '/provider/onboarding' : '/'

  function fieldError(name: string) {
    return errors[name] ? t(`validation.${errors[name]}` as 'validation.required') : undefined
  }

  async function handleGoogleSignup() {
    if (!acceptTerms) {
      setErrors({ acceptTerms: 'termsRequired' })
      return
    }
    setLoading(true)
    setFormError(null)
    try {
      const { error } = await createClient().auth.signInWithOAuth({
        provider: 'google',
        options: {
          // OAuth cannot carry metadata: the callback upgrades the account via become_provider().
          redirectTo: buildCallbackUrl({ next: nextPath, locale, role: role === 'provider' ? 'provider' : undefined }),
        },
      })
      if (error) throw error
    } catch (error) {
      setFormError(authErrorKey(error))
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)

    const parsed = registerSchema.safeParse({ fullName, email, password, role, acceptTerms })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setLoading(true)

    try {
      const { error } = await createClient().auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          // role is limited to tourist|provider server-side (handle_new_user); admin is impossible here.
          data: {
            full_name: parsed.data.fullName,
            role: parsed.data.role,
            locale,
            business_name: parsed.data.role === 'provider' ? parsed.data.fullName : undefined,
            accepted_terms_at: new Date().toISOString(),
          },
          emailRedirectTo: buildCallbackUrl({ next: nextPath, locale }),
        },
      })
      // An already-registered email returns no error (anti-enumeration): same screen either way.
      if (error && authErrorKey(error) !== 'userExists') throw error
      setStep('done')
    } catch (error) {
      setFormError(authErrorKey(error))
    }
    setLoading(false)
  }

  if (step === 'done') {
    return (
      <div className="text-center space-y-4 py-8" role="status">
        <div className="w-16 h-16 rounded-full bg-deep-green/10 flex items-center justify-center mx-auto">
          <Mail className="text-deep-green" size={28} />
        </div>
        <h1 className="text-2xl font-display text-charcoal">{t('confirmEmailTitle')}</h1>
        <p className="text-stone text-sm max-w-xs mx-auto">{t('confirmEmailBody', { email })}</p>
        <p className="text-xs text-stone">{t('checkSpam')}</p>
        <Link href="/login">
          <Button variant="outline" className="mt-4">{t('login')}</Button>
        </Link>
      </div>
    )
  }

  if (step === 'role') {
    const roles: { value: Role; label: string; desc: string }[] = [
      { value: 'tourist', label: t('roleTourist'), desc: t('roleTouristDesc') },
      { value: 'provider', label: t('roleProvider'), desc: t('roleProviderDesc') },
    ]
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display text-charcoal">{t('registerTitle')}</h1>
          <p className="text-stone text-sm">{t('registerSubtitle')}</p>
        </div>

        <div className="space-y-3" role="radiogroup">
          {roles.map((r) => (
            <button
              key={r.value}
              type="button"
              role="radio"
              aria-checked={role === r.value}
              onClick={() => setRole(r.value)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                role === r.value ? 'border-deep-green bg-deep-green/5' : 'border-mist bg-surface hover:border-stone'
              }`}
            >
              <div className="font-medium text-charcoal">{r.label}</div>
              <div className="text-sm text-stone mt-0.5">{r.desc}</div>
            </button>
          ))}
        </div>

        <Button fullWidth size="lg" onClick={() => setStep('form')}>{t('continue')}</Button>

        <p className="text-center text-sm text-stone">
          {t('alreadyAccount')}{' '}
          <Link href="/login" className="text-deep-green font-medium hover:underline">{t('login')}</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <button type="button" onClick={() => setStep('role')} className="text-sm text-stone hover:text-charcoal transition-colors">
          ← {t('back')}
        </button>
        <h1 className="text-3xl font-display text-charcoal">{t('registerTitle')}</h1>
      </div>

      <GoogleButton label={t('continueWithGoogle')} onClick={handleGoogleSignup} disabled={loading} />

      <div className="flex items-center gap-3 text-stone text-sm">
        <div className="flex-1 h-px bg-mist" />
        {t('or')}
        <div className="flex-1 h-px bg-mist" />
      </div>

      <form onSubmit={handleRegister} className="space-y-4" noValidate>
        <Input
          label={t('fullName')}
          name="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoComplete="name"
          leftIcon={<User size={16} />}
          error={fieldError('fullName')}
        />
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
        <Input
          label={t('password')}
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          leftIcon={<Lock size={16} />}
          error={fieldError('password')}
          hint={t('passwordHint')}
        />

        <div>
          <label className="flex items-start gap-2.5 text-xs text-stone leading-relaxed cursor-pointer">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-mist accent-[var(--deep-green)]"
            />
            <span>
              {t.rich('acceptTerms', {
                terms: (c) => <Link href="/terms" className="text-deep-green underline underline-offset-2">{c}</Link>,
                privacy: (c) => <Link href="/privacy" className="text-deep-green underline underline-offset-2">{c}</Link>,
              })}
            </span>
          </label>
          {fieldError('acceptTerms') && <p role="alert" className="mt-1 text-xs text-coral">{fieldError('acceptTerms')}</p>}
        </div>

        {formError && <p role="alert" className="text-sm text-coral">{t(`errors.${formError}` as 'errors.generic')}</p>}

        <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">{t('register')}</Button>
      </form>
    </div>
  )
}
