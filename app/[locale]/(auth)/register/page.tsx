'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Mail, Lock, User } from 'lucide-react'
import type { UserRole } from '@/types/database'

const roles: { value: UserRole; label: string; desc: string }[] = [
  { value: 'tourist',  label: 'Voyageur',    desc: 'Réservez des expériences' },
  { value: 'provider', label: 'Prestataire', desc: 'Proposez vos services' },
  { value: 'hotel',    label: 'Hôtel/Villa', desc: 'Référez vos clients' },
]

export default function RegisterPage() {
  const t = useTranslations('auth')
  const supabase = createClient()

  const [step, setStep] = useState<'role' | 'form' | 'done'>('role')
  const [role, setRole] = useState<UserRole>('tourist')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogleSignup() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/api/auth/callback`,
        queryParams: { role },
      },
    })
  }

  async function handleRegister(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setStep('done')
  }

  if (step === 'done') {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="w-16 h-16 rounded-full bg-deep-green/10 flex items-center justify-center mx-auto">
          <Mail className="text-deep-green" size={28} />
        </div>
        <h2 className="text-2xl font-display text-charcoal">{t('emailSent')}</h2>
        <p className="text-stone text-sm max-w-xs mx-auto">
          Vérifiez votre boite mail pour activer votre compte.
        </p>
        <Link href="/login">
          <Button variant="outline" className="mt-4">{t('login')}</Button>
        </Link>
      </div>
    )
  }

  if (step === 'role') {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display text-charcoal">{t('registerTitle')}</h1>
          <p className="text-stone text-sm">{t('registerSubtitle')}</p>
        </div>

        <div className="space-y-3">
          {roles.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                role === r.value
                  ? 'border-deep-green bg-deep-green/5'
                  : 'border-mist bg-surface hover:border-stone'
              }`}
            >
              <div className="font-medium text-charcoal">{r.label}</div>
              <div className="text-sm text-stone mt-0.5">{r.desc}</div>
            </button>
          ))}
        </div>

        <Button fullWidth size="lg" onClick={() => setStep('form')}>
          Continuer
        </Button>

        <p className="text-center text-sm text-stone">
          {t('alreadyAccount')}{' '}
          <Link href="/login" className="text-deep-green font-medium hover:underline">
            {t('login')}
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <button
          type="button"
          onClick={() => setStep('role')}
          className="text-sm text-stone hover:text-charcoal transition-colors"
        >
          ← Retour
        </button>
        <h1 className="text-3xl font-display text-charcoal">{t('registerTitle')}</h1>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={loading}
        className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-mist bg-surface text-charcoal text-sm font-medium hover:bg-sand transition-colors disabled:opacity-50"
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

      <form onSubmit={handleRegister} className="space-y-4" noValidate>
        <Input
          label={t('fullName')}
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoComplete="name"
          leftIcon={<User size={16} />}
        />
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
          autoComplete="new-password"
          leftIcon={<Lock size={16} />}
          error={error ?? undefined}
          hint="Minimum 8 caractères"
        />

        <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
          {t('register')}
        </Button>
      </form>
    </div>
  )
}
