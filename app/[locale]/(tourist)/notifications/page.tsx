'use client'

import { useState } from 'react'
import { Link } from '@/lib/i18n/navigation'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToggleItem = { id: string; label: string; sub: string; on: boolean }

const INITIAL: ToggleItem[] = [
  { id: 'confirm',    label: 'Confirmations de réservation', sub: 'Reçu dès qu\'une réservation est validée',          on: true  },
  { id: 'reminder',  label: 'Rappels de prestation',         sub: '24h avant chaque expérience',                       on: true  },
  { id: 'promo',     label: 'Offres et nouveautés',          sub: 'Les nouvelles expériences disponibles sur votre île', on: false },
  { id: 'review',    label: 'Demandes d\'avis',              sub: 'Après chaque prestation terminée',                   on: true  },
  { id: 'concierge', label: 'Messages concierge',            sub: 'Réponses et suggestions personnalisées',             on: true  },
  { id: 'news',      label: 'Newsletter Ohaana',             sub: 'Actualités et guides locaux, max 1x/semaine',        on: false },
]

function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0',
        on ? 'bg-deep-green' : 'bg-mist'
      )}
    >
      <span className={cn(
        'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-coconut shadow-sm transition-transform duration-200',
        on ? 'translate-x-5' : 'translate-x-0'
      )} />
    </button>
  )
}

export default function NotificationsPage() {
  const [items, setItems] = useState<ToggleItem[]>(INITIAL)
  const [saved, setSaved] = useState(false)

  function toggle(id: string) {
    setItems(prev => prev.map(item => item.id === id ? { ...item, on: !item.on } : item))
    setSaved(false)
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-coconut pt-16">
      <div className="max-w-xl mx-auto px-5 py-8 pb-24 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="p-2 rounded-full hover:bg-sand transition-colors text-stone">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-display text-charcoal">Notifications</h1>
        </div>

        <ul className="divide-y divide-mist rounded-2xl bg-surface border border-mist overflow-hidden">
          {items.map(({ id, label, sub, on }) => (
            <li key={id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-charcoal">{label}</p>
                <p className="text-xs text-stone mt-0.5">{sub}</p>
              </div>
              <Switch on={on} onToggle={() => toggle(id)} />
            </li>
          ))}
        </ul>

        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-2xl bg-deep-green text-coconut text-sm font-medium hover:bg-deep-green/90 transition-colors"
        >
          {saved ? '✓ Préférences enregistrées' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}
