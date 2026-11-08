'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import { MapPin } from 'lucide-react'
import type { Island } from '@/types/database'

export type IslandFilter = Island | 'all'

type Lang = 'fr' | 'en' | 'es'

const ISLAND_OPTIONS: { value: IslandFilter; label: Record<Lang, string>; soon?: boolean }[] = [
  { value: 'all',          label: { fr: 'Toutes les îles', en: 'All islands', es: 'Todas las islas' } },
  { value: 'guadeloupe',   label: { fr: 'Guadeloupe', en: 'Guadeloupe', es: 'Guadalupe' } },
  { value: 'martinique',   label: { fr: 'Martinique', en: 'Martinique', es: 'Martinica' }, soon: true },
  { value: 'saint_martin', label: { fr: 'Saint-Martin', en: 'Saint-Martin', es: 'Saint-Martin' }, soon: true },
  { value: 'saint_barth',  label: { fr: 'Saint-Barth', en: 'Saint-Barth', es: 'Saint-Barth' }, soon: true },
]

const SOON: Record<Lang, string> = { fr: 'bientôt', en: 'soon', es: 'pronto' }

interface IslandSelectorProps {
  value: IslandFilter
  onChange: (island: IslandFilter) => void
  /** Borderless trigger for embedding in a composite search bar. */
  variant?: 'pill' | 'bare'
}

export function IslandSelector({ value, onChange, variant = 'pill' }: IslandSelectorProps) {
  const [open, setOpen] = useState(false)
  const locale = useLocale()
  const lang: Lang = (['fr', 'en', 'es'] as Lang[]).includes(locale as Lang) ? (locale as Lang) : 'fr'

  const currentLabel = ISLAND_OPTIONS.find((o) => o.value === value)?.label[lang] ?? ISLAND_OPTIONS[0].label[lang]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          variant === 'bare'
            ? 'flex h-6 w-full items-center justify-between gap-2 text-sm text-charcoal focus:outline-none'
            : 'flex items-center gap-2 px-3.5 py-2 bg-coconut rounded-full border border-mist shadow-sm text-sm font-medium text-charcoal hover:border-deep-green transition-colors'
        }
      >
        {variant === 'pill' && <MapPin size={14} className="text-deep-green" />}
        <span className="truncate">{currentLabel}</span>
        <span className="text-stone text-xs">▾</span>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-full mt-2 left-0 bg-coconut rounded-card border border-mist shadow-elevated overflow-hidden z-[80] min-w-[180px]"
        >
          {ISLAND_OPTIONS.map(({ value: v, label, soon }) => (
            <button
              key={v}
              type="button"
              disabled={soon}
              aria-disabled={soon}
              onClick={() => { if (soon) return; onChange(v); setOpen(false) }}
              className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                soon
                  ? 'cursor-not-allowed text-stone'
                  : v === value
                    ? 'text-deep-green font-medium bg-sand hover:bg-sand'
                    : 'text-charcoal hover:bg-sand'
              }`}
            >
              {label[lang]}
              {soon && (
                <span className="text-xs text-stone ml-2">{SOON[lang]}</span>
              )}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}
