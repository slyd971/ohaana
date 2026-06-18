'use client'

import { useState } from 'react'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const ISLANDS = [
  { id: 'guadeloupe', label: 'Guadeloupe', emoji: '🇬🇵' },
  { id: 'martinique', label: 'Martinique', emoji: '🇲🇶' },
  { id: 'saint-martin', label: 'Saint-Martin', emoji: '🌊' },
  { id: 'saint-barth', label: 'Saint-Barth', emoji: '⛵' },
]

const MOODS = [
  { id: 'relax', label: 'Détente & spa' },
  { id: 'gourmet', label: 'Gastronomie' },
  { id: 'sport', label: 'Sport & nature' },
  { id: 'photo', label: 'Photo & souvenirs' },
  { id: 'party', label: 'Fête & ambiance' },
  { id: 'culture', label: 'Culture locale' },
  { id: 'romance', label: 'Romantique' },
  { id: 'family', label: 'En famille' },
]

const TRAVELER_TYPES = [
  { id: 'couple', label: 'En couple' },
  { id: 'family', label: 'En famille' },
  { id: 'friends', label: 'Entre amis' },
  { id: 'solo', label: 'En solo' },
]

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center gap-2',
        active
          ? 'bg-deep-green/10 border-deep-green/40 text-deep-green'
          : 'bg-surface border-mist text-stone hover:border-deep-green/20 hover:text-charcoal'
      )}
    >
      {active && <Check size={13} />}
      {children}
    </button>
  )
}

export default function PreferencesPage() {
  const [islands, setIslands] = useState<Set<string>>(new Set(['guadeloupe']))
  const [moods, setMoods] = useState<Set<string>>(new Set(['relax', 'gourmet']))
  const [traveler, setTraveler] = useState('couple')
  const [saved, setSaved] = useState(false)

  function toggle(set: Set<string>, setter: (s: Set<string>) => void, id: string) {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setter(next)
    setSaved(false)
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="min-h-screen bg-coconut pt-16">
      <div className="max-w-xl mx-auto px-5 py-8 pb-24 space-y-8">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="p-2 rounded-full hover:bg-sand transition-colors text-stone">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-display text-charcoal">Mes préférences</h1>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-charcoal">Îles préférées</h2>
          <div className="flex flex-wrap gap-2">
            {ISLANDS.map(({ id, label, emoji }) => (
              <Toggle key={id} active={islands.has(id)} onClick={() => toggle(islands, setIslands, id)}>
                {emoji} {label}
              </Toggle>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-charcoal">Ambiances</h2>
          <div className="flex flex-wrap gap-2">
            {MOODS.map(({ id, label }) => (
              <Toggle key={id} active={moods.has(id)} onClick={() => toggle(moods, setMoods, id)}>
                {label}
              </Toggle>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-charcoal">Je voyage…</h2>
          <div className="flex flex-wrap gap-2">
            {TRAVELER_TYPES.map(({ id, label }) => (
              <Toggle key={id} active={traveler === id} onClick={() => { setTraveler(id); setSaved(false) }}>
                {label}
              </Toggle>
            ))}
          </div>
        </section>

        <div className="pt-2">
          <Button variant="primary" fullWidth onClick={handleSave}>
            {saved ? '✓ Préférences enregistrées' : 'Enregistrer'}
          </Button>
          {saved && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-deep-green text-center mt-3"
            >
              Vos recommandations ont été mises à jour.
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}
