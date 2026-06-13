'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { MapPin } from 'lucide-react'
import type { Island } from '@/types/database'

const ISLANDS: Island[] = [
  'guadeloupe', 'martinique', 'saint_martin', 'saint_barth',
]

interface IslandSelectorProps {
  value: Island
  onChange: (island: Island) => void
}

export function IslandSelector({ value, onChange }: IslandSelectorProps) {
  const t = useTranslations('islands')
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3.5 py-2 bg-coconut rounded-full border border-mist shadow-sm text-sm font-medium text-charcoal hover:border-deep-green transition-colors"
      >
        <MapPin size={14} className="text-deep-green" />
        {t(value)}
        <span className="text-stone text-xs">▾</span>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-full mt-2 left-0 bg-coconut rounded-2xl border border-mist shadow-elevated overflow-hidden z-30 min-w-[160px]"
        >
          {ISLANDS.map((island) => (
            <button
              key={island}
              type="button"
              onClick={() => { onChange(island); setOpen(false) }}
              className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-sand ${
                island === value ? 'text-deep-green font-medium bg-sand' : 'text-charcoal'
              }`}
            >
              {t(island)}
              {island !== 'guadeloupe' && (
                <span className="ml-2 text-xs text-stone">(bientôt)</span>
              )}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}
