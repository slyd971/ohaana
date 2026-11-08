'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Link } from '@/lib/i18n/navigation'
import { ChevronLeft, ChevronRight, Globe, Lock, Trash2, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { updatePasswordSchema } from '@/lib/auth/schemas'
import { authErrorKey } from '@/lib/auth/errors'
import { cn } from '@/lib/utils'

const LANGS = [
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'en', label: 'English',  flag: '🇬🇧' },
  { id: 'es', label: 'Español',  flag: '🇪🇸' },
]

export default function SettingsPage() {
  const { signOut } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [lang, setLang] = useState('fr')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    const parsed = updatePasswordSchema.safeParse({ password: newPassword, confirm: confirmPassword })
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message
      const text: Record<string, string> = {
        passwordTooShort: '8 caractères minimum.', passwordTooLong: '72 caractères maximum.',
        passwordWeak: 'Ajoutez au moins une lettre et un chiffre.', passwordMismatch: 'Les mots de passe ne correspondent pas.',
      }
      setPasswordMsg({ ok: false, text: text[first ?? ''] ?? 'Mot de passe invalide.' })
      return
    }
    setPasswordBusy(true)
    const { error } = await createClient().auth.updateUser({ password: parsed.data.password })
    setPasswordBusy(false)
    if (error) {
      setPasswordMsg({ ok: false, text: authErrorKey(error) === 'weakPassword' ? 'Ce mot de passe est trop faible ou trop courant.' : 'Modification impossible. Reconnectez-vous puis réessayez.' })
      return
    }
    setNewPassword(''); setConfirmPassword('')
    setPasswordMsg({ ok: true, text: 'Mot de passe modifié.' })
  }

  function handleLogout() {
    void signOut()
  }

  return (
    <div className="min-h-screen bg-coconut pt-16">
      <div className="max-w-xl mx-auto px-5 py-8 pb-24 space-y-8">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="p-2 rounded-full hover:bg-sand transition-colors text-stone">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-display text-charcoal">Paramètres</h1>
        </div>

        {/* Language */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-charcoal">
            <Globe size={16} className="text-deep-green" /> Langue de l&apos;interface
          </div>
          <div className="flex gap-2">
            {LANGS.map(({ id, label, flag }) => (
              <button
                key={id}
                onClick={() => setLang(id)}
                className={cn(
                  'flex-1 py-3 rounded-control text-sm font-medium border transition-all',
                  lang === id
                    ? 'bg-deep-green/10 border-deep-green/40 text-deep-green'
                    : 'bg-surface border-mist text-stone hover:border-deep-green/20'
                )}
              >
                {flag} {label}
              </button>
            ))}
          </div>
        </section>

        {/* Password */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-charcoal">
            <Lock size={16} className="text-deep-green" /> Sécurité
          </div>
          {showPasswordForm ? (
            <form onSubmit={handlePasswordChange} className="p-4 rounded-card bg-surface border border-mist space-y-3" noValidate>
              <input name="password" aria-label="Nouveau mot de passe" placeholder="Nouveau mot de passe" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2.5 rounded-control border border-mist bg-coconut text-sm placeholder-stone focus:outline-none focus:border-deep-green/40" />
              <input name="confirm" aria-label="Confirmer le nouveau mot de passe" placeholder="Confirmer le nouveau mot de passe" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2.5 rounded-control border border-mist bg-coconut text-sm placeholder-stone focus:outline-none focus:border-deep-green/40" />
              <p className="text-xs text-stone">8 caractères minimum, avec une lettre et un chiffre.</p>
              {passwordMsg && <p role={passwordMsg.ok ? 'status' : 'alert'} className={passwordMsg.ok ? 'text-sm text-deep-green' : 'text-sm text-coral-text'}>{passwordMsg.text}</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setShowPasswordForm(false); setPasswordMsg(null) }} className="flex-1 py-2.5 rounded-control text-sm text-stone border border-mist hover:bg-sand transition-colors">Annuler</button>
                <Button size="sm" type="submit" disabled={passwordBusy} className="flex-1">Modifier</Button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="w-full flex items-center justify-between px-5 py-4 rounded-card bg-surface border border-mist hover:border-deep-green/20 transition-colors"
            >
              <span className="text-sm text-charcoal">Modifier le mot de passe</span>
              <ChevronRight size={16} className="text-stone" />
            </button>
          )}
        </section>

        {/* Danger zone */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-stone uppercase tracking-wider">Zone critique</h2>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4 rounded-card bg-surface border border-mist hover:border-stone/30 transition-colors text-left"
          >
            <LogOut size={16} className="text-stone" />
            <span className="text-sm text-charcoal">Se déconnecter</span>
          </button>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-3 px-5 py-4 rounded-card bg-coral/5 border border-coral/20 hover:border-coral/40 transition-colors text-left"
            >
              <Trash2 size={16} className="text-coral-text" />
              <span className="text-sm text-coral-text">Supprimer mon compte</span>
            </button>
          ) : (
            <div className="p-5 rounded-card bg-coral/5 border border-coral/30 space-y-3">
              <p className="text-sm font-medium text-coral-text">Supprimer définitivement votre compte ?</p>
              <p className="text-xs text-stone">
                Pour exercer votre droit à l&apos;effacement, écrivez-nous à{' '}
                <a href="mailto:privacy@ohaana.fr" className="text-deep-green underline underline-offset-2">privacy@ohaana.fr</a>
                {' '}depuis l&apos;adresse de votre compte : nous traiterons votre demande rapidement.
              </p>
              <button onClick={() => setShowDeleteConfirm(false)} className="w-full py-2.5 rounded-control text-sm text-stone border border-mist bg-surface hover:bg-sand transition-colors">Fermer</button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
