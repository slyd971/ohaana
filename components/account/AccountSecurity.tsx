'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthProvider'
import { authErrorKey } from '@/lib/auth/errors'
import { fieldErrors, updatePasswordSchema } from '@/lib/auth/schemas'
import { buildCallbackUrl } from '@/lib/auth/client-utils'
import { z } from 'zod'
import { Field, inputClass } from '@/components/provider/ui'

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: 'required' })
    .max(254, { error: 'emailInvalid' })
    .pipe(z.email({ error: 'emailInvalid' })),
})

type Msg = { kind: 'ok' | 'error'; text: string } | null

const submitClass =
  'bg-deep-green text-coconut px-5 py-2.5 rounded-full text-sm font-medium hover:bg-deep-green/90 disabled:opacity-60 transition-colors'

/**
 * Sign-in details of the current account: change the password (or set one for a Google account) and
 * change the e-mail (Supabase sends a confirmation link). Used by the provider and admin spaces.
 */
export function AccountSecurity({ returnTo }: { returnTo: string }) {
  const t = useTranslations('auth')
  const locale = useLocale()
  const { user, isDemo } = useAuth()

  const [provider, setProvider] = useState<string | null>(null)
  const userId = user?.id
  useEffect(() => {
    if (isDemo || !userId) return
    let active = true
    createClient()
      .auth.getUser()
      .then(({ data }) => { if (active) setProvider((data.user?.app_metadata?.provider as string | undefined) ?? 'email') })
      .catch(() => { if (active) setProvider('email') })
    return () => { active = false }
  }, [isDemo, userId])

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({})
  const [pwMsg, setPwMsg] = useState<Msg>(null)
  const [pwBusy, setPwBusy] = useState(false)

  const [newEmail, setNewEmail] = useState('')
  const [emailErrors, setEmailErrors] = useState<Record<string, string>>({})
  const [emailMsg, setEmailMsg] = useState<Msg>(null)
  const [emailBusy, setEmailBusy] = useState(false)

  const tv = (key?: string) => (key ? t(`validation.${key}` as 'validation.required') : undefined)

  function failure(error: unknown): string {
    const code = (error as { code?: string } | null)?.code
    if (code === 'reauthentication_needed' || code === 'same_password') {
      return code === 'same_password'
        ? 'Le nouveau mot de passe doit être différent de l’actuel.'
        : 'Pour des raisons de sécurité, reconnectez-vous puis réessayez.'
    }
    return t(`errors.${authErrorKey(error)}` as 'errors.generic')
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPwMsg(null)
    const parsed = updatePasswordSchema.safeParse({ password, confirm })
    if (!parsed.success) {
      setPwErrors(fieldErrors(parsed.error))
      return
    }
    setPwErrors({})
    setPwBusy(true)
    const { error } = await createClient().auth.updateUser({ password: parsed.data.password })
    setPwBusy(false)
    if (error) {
      setPwMsg({ kind: 'error', text: failure(error) })
      return
    }
    setPassword('')
    setConfirm('')
    setPwMsg({ kind: 'ok', text: 'Mot de passe mis à jour.' })
  }

  async function changeEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEmailMsg(null)
    const parsed = emailSchema.safeParse({ email: newEmail })
    if (!parsed.success) {
      setEmailErrors(fieldErrors(parsed.error))
      return
    }
    setEmailErrors({})
    setEmailBusy(true)
    const { error } = await createClient().auth.updateUser(
      { email: parsed.data.email },
      { emailRedirectTo: buildCallbackUrl({ next: returnTo, locale }) },
    )
    setEmailBusy(false)
    if (error) {
      setEmailMsg({ kind: 'error', text: failure(error) })
      return
    }
    setNewEmail('')
    setEmailMsg({
      kind: 'ok',
      text: 'Un e-mail de confirmation vous a été envoyé. L’adresse ne change qu’après avoir cliqué sur le lien (vérifiez aussi vos courriers indésirables).',
    })
  }

  if (isDemo) {
    return (
      <div className="bg-coconut rounded-2xl border border-mist p-5 text-sm text-stone">
        Mode démo : aucun compte connecté, la sécurité du compte est désactivée.
      </div>
    )
  }
  if (!user) return null

  const viaGoogle = provider === 'google'

  return (
    <div className="space-y-6">
      <section className="bg-coconut rounded-2xl border border-mist p-5 space-y-1">
        <h2 className="text-sm font-semibold text-deep-green">Connexion</h2>
        <p className="text-sm text-charcoal">{user.email}</p>
        <p className="text-[11px] text-stone">
          {provider === null ? '…' : viaGoogle ? 'Vous vous connectez avec Google.' : 'Vous vous connectez avec votre e-mail et votre mot de passe.'}
        </p>
      </section>

      <section className="bg-coconut rounded-2xl border border-mist p-5">
        <h2 className="text-sm font-semibold text-deep-green mb-1">Mot de passe</h2>
        <p className="text-[11px] text-stone mb-4">
          {viaGoogle
            ? 'Votre compte est lié à Google. Vous pouvez en plus définir un mot de passe pour vous connecter par e-mail.'
            : '8 caractères minimum, avec une lettre et un chiffre.'}
        </p>
        <form onSubmit={changePassword} className="space-y-4" noValidate>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nouveau mot de passe" htmlFor="acc-password" error={tv(pwErrors.password)}>
              <input id="acc-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Confirmer" htmlFor="acc-confirm" error={tv(pwErrors.confirm)}>
              <input id="acc-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
            </Field>
          </div>
          {pwMsg && <p role={pwMsg.kind === 'error' ? 'alert' : 'status'} className={`text-sm ${pwMsg.kind === 'error' ? 'text-[#C0392B]' : 'text-turquoise'}`}>{pwMsg.text}</p>}
          <button type="submit" disabled={pwBusy} className={submitClass}>
            {pwBusy ? 'Enregistrement…' : viaGoogle ? 'Définir un mot de passe' : 'Changer le mot de passe'}
          </button>
        </form>
      </section>

      <section className="bg-coconut rounded-2xl border border-mist p-5">
        <h2 className="text-sm font-semibold text-deep-green mb-1">Adresse e-mail</h2>
        {viaGoogle ? (
          <p className="text-[11px] text-stone">
            L’adresse est celle de votre compte Google : elle se change côté Google, pas ici.
          </p>
        ) : (
          <>
            <p className="text-[11px] text-stone mb-4">Un lien de confirmation est envoyé pour valider la nouvelle adresse.</p>
            <form onSubmit={changeEmail} className="space-y-4" noValidate>
              <Field label="Nouvelle adresse e-mail" htmlFor="acc-email" error={tv(emailErrors.email)}>
                <input id="acc-email" type="email" autoComplete="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={inputClass} />
              </Field>
              {emailMsg && <p role={emailMsg.kind === 'error' ? 'alert' : 'status'} className={`text-sm ${emailMsg.kind === 'error' ? 'text-[#C0392B]' : 'text-turquoise'}`}>{emailMsg.text}</p>}
              <button type="submit" disabled={emailBusy} className={submitClass}>
                {emailBusy ? 'Envoi…' : 'Changer l’adresse e-mail'}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
