'use client'

import { useState } from 'react'
import { Download, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { deleteMyAccountAction, exportMyDataAction } from '@/app/actions/account'
import { ConfirmButton } from '@/components/ui/ConfirmButton'
import { useAuth } from '@/lib/auth/AuthProvider'
import { COMPANY_CONTACT } from '@/lib/legal/public'

const inputClass = 'w-full rounded-control border border-mist bg-surface px-3.5 py-2.5 text-sm text-charcoal focus:border-deep-green focus:outline-none'

/** Vos données : export JSON (accès et portabilité) et suppression du compte (effacement), sans passer par un email. */
export function DataAndPrivacy() {
  const { isDemo, user } = useAuth()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  if (isDemo || !user) return null

  async function download() {
    setBusy(true)
    setMsg(null)
    const res = await exportMyDataAction()
    setBusy(false)
    if (!res.ok) {
      setMsg({ ok: false, text: res.error })
      return
    }
    const url = URL.createObjectURL(new Blob([res.json], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = res.filename
    a.click()
    URL.revokeObjectURL(url)
    setMsg({ ok: true, text: 'Vos données ont été téléchargées.' })
  }

  async function remove() {
    setBusy(true)
    setMsg(null)
    const res = await deleteMyAccountAction(email)
    setBusy(false)
    if (!res.ok) {
      setMsg({ ok: false, text: res.error })
      return
    }
    router.replace('/')
    router.refresh()
  }

  return (
    <section aria-labelledby="privacy-title" className="space-y-3">
      <h2 id="privacy-title" className="text-sm font-semibold text-stone uppercase tracking-wider">Mes données</h2>

      <div className="rounded-card border border-mist bg-surface p-5 space-y-3">
        <p className="text-sm text-charcoal">Téléchargez une copie de vos données (profil, réservations, avis, notifications, consentements) au format JSON.</p>
        <button type="button" onClick={() => void download()} disabled={busy} className="inline-flex items-center gap-2 rounded-full border border-mist px-4 py-2 text-sm text-charcoal hover:bg-sand disabled:opacity-60">
          <Download size={14} /> Exporter mes données
        </button>
      </div>

      <div className="rounded-card border border-coral/30 bg-coral/5 p-5 space-y-3">
        <p className="text-sm font-medium text-coral-text">Supprimer mon compte</p>
        <p className="text-xs leading-relaxed text-stone">
          Vos données personnelles sont effacées. Les réservations et paiements déjà réalisés sont conservés sans votre identité, car la loi impose de garder les écritures comptables. La suppression est impossible tant qu’une prestation confirmée reste à venir. Une question : {COMPANY_CONTACT.privacyEmail}.
        </p>
        <label className="block text-xs font-semibold text-charcoal" htmlFor="confirm-email">Pour confirmer, retapez l’adresse de votre compte</label>
        <input id="confirm-email" type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        <ConfirmButton
          label={<><Trash2 size={14} /> Supprimer définitivement</>}
          message="Cette action est irréversible. Supprimer votre compte ?"
          confirmLabel="Oui, supprimer"
          disabled={busy || email.trim().length < 3}
          onConfirm={() => void remove()}
          className="inline-flex items-center gap-2 rounded-full border border-coral/40 px-4 py-2 text-sm text-coral-text hover:bg-coral/10 disabled:opacity-50"
        />
      </div>

      {msg && <p role={msg.ok ? 'status' : 'alert'} className={`text-sm ${msg.ok ? 'text-turquoise' : 'text-coral-text'}`}>{msg.text}</p>}
    </section>
  )
}
