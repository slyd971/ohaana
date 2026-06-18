'use client'

import { useState } from 'react'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, ChevronRight, Globe, Lock, Trash2, LogOut } from 'lucide-react'
import { setDemoRole } from '@/lib/demo-auth'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const LANGS = [
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'en', label: 'English',  flag: '🇬🇧' },
  { id: 'es', label: 'Español',  flag: '🇪🇸' },
]

export default function SettingsPage() {
  const router = useRouter()
  const [lang, setLang] = useState('fr')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  function handleLogout() {
    setDemoRole(null)
    router.push('/')
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
            <Globe size={16} className="text-deep-green" /> Langue de l'interface
          </div>
          <div className="flex gap-2">
            {LANGS.map(({ id, label, flag }) => (
              <button
                key={id}
                onClick={() => setLang(id)}
                className={cn(
                  'flex-1 py-3 rounded-xl text-sm font-medium border transition-all',
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
            <div className="p-4 rounded-2xl bg-surface border border-mist space-y-3">
              <input placeholder="Mot de passe actuel" type="password" className="w-full px-3 py-2.5 rounded-xl border border-mist bg-coconut text-sm placeholder-stone focus:outline-none focus:border-deep-green/40" />
              <input placeholder="Nouveau mot de passe" type="password" className="w-full px-3 py-2.5 rounded-xl border border-mist bg-coconut text-sm placeholder-stone focus:outline-none focus:border-deep-green/40" />
              <input placeholder="Confirmer le nouveau mot de passe" type="password" className="w-full px-3 py-2.5 rounded-xl border border-mist bg-coconut text-sm placeholder-stone focus:outline-none focus:border-deep-green/40" />
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowPasswordForm(false)} className="flex-1 py-2.5 rounded-xl text-sm text-stone border border-mist hover:bg-sand transition-colors">Annuler</button>
                <button onClick={() => setShowPasswordForm(false)} className="flex-1 py-2.5 rounded-xl text-sm text-coconut bg-deep-green hover:bg-deep-green/90 transition-colors">Modifier</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-surface border border-mist hover:border-deep-green/20 transition-colors"
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
            className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-surface border border-mist hover:border-stone/30 transition-colors text-left"
          >
            <LogOut size={16} className="text-stone" />
            <span className="text-sm text-charcoal">Se déconnecter</span>
          </button>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-coral/5 border border-coral/20 hover:border-coral/40 transition-colors text-left"
            >
              <Trash2 size={16} className="text-coral" />
              <span className="text-sm text-coral">Supprimer mon compte</span>
            </button>
          ) : (
            <div className="p-5 rounded-2xl bg-coral/5 border border-coral/30 space-y-3">
              <p className="text-sm font-medium text-coral">Supprimer définitivement votre compte ?</p>
              <p className="text-xs text-stone">Cette action est irréversible. Toutes vos réservations et données seront supprimées.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 rounded-xl text-sm text-stone border border-mist bg-surface hover:bg-sand transition-colors">Annuler</button>
                <button className="flex-1 py-2.5 rounded-xl text-sm text-coconut bg-coral hover:bg-coral/90 transition-colors">Confirmer</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
