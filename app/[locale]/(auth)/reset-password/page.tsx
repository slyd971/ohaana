'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CheckCircle2, ChevronLeft, Mail } from 'lucide-react'
import { resetRequestSchema, fieldErrors } from '@/lib/auth/schemas'
import { authErrorKey } from '@/lib/auth/errors'
import { buildCallbackUrl } from '@/lib/auth/client-utils'
import { localePrefix } from '@/lib/auth/locale'

export default function ResetPasswordPage() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)

    const parsed = resetRequestSchema.safeParse({ email })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setLoading(true)

    try {
      const { error } = await createClient().auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo: buildCallbackUrl({ next: `${localePrefix(locale)}/update-password`, locale }),
      })
      // Same screen whether or not the account exists (no account enumeration).
      if (error && ['rateLimited', 'unavailable'].includes(authErrorKey(error))) throw error
      setSent(true)
    } catch (error) {
      setFormError(authErrorKey(error))
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center space-y-4" role="status">
        <div className="w-16 h-16 rounded-full bg-deep-green/10 flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} className="text-deep-green" />
        </div>
        <h1 className="text-xl font-display text-charcoal">{t('resetSentTitle')}</h1>
        <p className="text-sm text-stone leading-relaxed">{t('resetSentBody', { email })}</p>
        <p className="text-xs text-stone">{t('checkSpam')}</p>
        <Link href="/login"><Button variant="ghost" fullWidth className="mt-2">{t('backToLogin')}</Button></Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display text-charcoal">{t('resetTitle')}</h1>
        <p className="text-sm text-stone mt-1.5 leading-relaxed">{t('resetSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label={t('email')}
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail size={16} />}
          error={errors.email ? t(`validation.${errors.email}` as 'validation.required') : undefined}
        />
        {formError && <p role="alert" className="text-sm text-coral">{t(`errors.${formError}` as 'errors.generic')}</p>}
        <Button type="submit" fullWidth variant="primary" loading={loading}>{t('sendResetLink')}</Button>
      </form>

      <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-stone hover:text-charcoal transition-colors">
        <ChevronLeft size={15} /> {t('backToLogin')}
      </Link>
    </div>
  )
}
