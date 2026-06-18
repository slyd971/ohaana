'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import { MapPin } from 'lucide-react'
import type { Island } from '@/types/database'

export type IslandFilter = Island | 'all'

const ISLAND_OPTIONS: { value: IslandFilter; label: { fr: string; en: string }; soon?: boolean }[] = [
  { value: 'all',          label: { fr: 'Toutes les îles', en: 'All islands' } },
  { value: 'guadeloupe',   label: { fr: 'Guadeloupe', en: 'Guadeloupe' } },
  { value: 'martinique',   label: { fr: 'Martinique', en: 'Martinique' }, soon: true },
  { value: 'saint_martin', label: { fr: 'Saint-Martin', en: 'Saint-Martin' }, soon: true },
  { value: 'saint_barth',  label: { fr: 'Saint-Barth', en: 'Saint-Barth' }, soon: true },
]

interface IslandSelectorProps {
  value: IslandFilter
  onChange: (island: IslandFilter) => void
}

export function IslandSelector({ value, onChange }: IslandSelectorProps) {
  const [open, setOpen] = useState(false)
  const locale = useLocale()
  const lang = locale === 'en' ? 'en' : 'fr'

  const currentLabel = ISLAND_OPTIONS.find((o) => o.value === value)?.label[lang] ?? ISLAND_OPTIONS[0].label[lang]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3.5 py-2 bg-coconut rounded-full border border-mist shadow-sm text-sm font-medium text-charcoal hover:border-deep-green transition-colors"
      >
        <MapPin size={14} className="text-deep-green" />
        {currentLabel}
        <span className="text-stone text-xs">▾</span>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-full mt-2 left-0 bg-coconut rounded-2xl border border-mist shadow-elevated overflow-hidden z-[80] min-w-[180px]"
        >
          {ISLAND_OPTIONS.map(({ value: v, label, soon }) => (
            <button
              key={v}
              type="button"
              onClick={() => { onChange(v); setOpen(false) }}
              className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-sand flex items-center justify-between ${
                v === value ? 'text-deep-green font-medium bg-sand' : 'text-charcoal'
              }`}
            >
              {label[lang]}
              {soon && (
                <span className="text-xs text-stone ml-2">{lang === 'en' ? 'soon' : 'bientôt'}</span>
              )}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}
