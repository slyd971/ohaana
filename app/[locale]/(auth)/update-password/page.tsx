'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/lib/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Lock, CheckCircle2 } from 'lucide-react'
import { updatePasswordSchema, fieldErrors } from '@/lib/auth/schemas'
import { authErrorKey } from '@/lib/auth/errors'

export default function UpdatePasswordPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [ready, setReady] = useState<'checking' | 'ok' | 'expired'>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  // The recovery link (via /api/auth/callback) must have created a session.
  useEffect(() => {
    let active = true
    createClient().auth.getUser().then(({ data }) => {
      if (active) setReady(data.user ? 'ok' : 'expired')
    }).catch(() => { if (active) setReady('expired') })
    return () => { active = false }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)

    const parsed = updatePasswordSchema.safeParse({ password, confirm })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setLoading(true)

    try {
      const { error } = await createClient().auth.updateUser({ password: parsed.data.password })
      if (error) throw error
      setDone(true)
      setTimeout(() => { router.push('/'); router.refresh() }, 1500)
    } catch (error) {
      setFormError(authErrorKey(error))
      setLoading(false)
    }
  }

  const fe = (name: string) => (errors[name] ? t(`validation.${errors[name]}` as 'validation.required') : undefined)

  if (ready === 'checking') return <p className="text-center text-sm text-stone" role="status">…</p>

  if (ready === 'expired') {
    return (
      <div className="text-center space-y-4" role="alert">
        <p className="text-sm text-stone">{t('linkExpired')}</p>
        <Link href="/reset-password"><Button fullWidth>{t('sendResetLink')}</Button></Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center space-y-4" role="status">
        <div className="w-16 h-16 rounded-full bg-deep-green/10 flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} className="text-deep-green" />
        </div>
        <p className="text-sm text-charcoal">{t('passwordUpdated')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display text-charcoal">{t('updatePasswordTitle')}</h1>
        <p className="text-sm text-stone mt-1.5">{t('updatePasswordSubtitle')}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input label={t('newPassword')} name="password" type="password" autoComplete="new-password" required
          value={password} onChange={(e) => setPassword(e.target.value)} leftIcon={<Lock size={16} />}
          error={fe('password')} hint={t('passwordHint')} />
        <Input label={t('confirmPassword')} name="confirm" type="password" autoComplete="new-password" required
          value={confirm} onChange={(e) => setConfirm(e.target.value)} leftIcon={<Lock size={16} />}
          error={fe('confirm')} />
        {formError && <p role="alert" className="text-sm text-coral-text">{t(`errors.${formError}` as 'errors.generic')}</p>}
        <Button type="submit" fullWidth loading={loading}>{t('updatePassword')}</Button>
      </form>
    </div>
  )
}
