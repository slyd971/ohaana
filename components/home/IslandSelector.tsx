'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Island } from '@/types/database'

export type IslandFilter = Island | 'all'

const ISLAND_OPTIONS: { value: IslandFilter; label: string; soon?: boolean }[] = [
  { value: 'all',          label: 'Toutes les îles' },
  { value: 'guadeloupe',   label: 'Guadeloupe' },
  { value: 'martinique',   label: 'Martinique', soon: true },
  { value: 'saint_martin', label: 'Saint-Martin', soon: true },
  { value: 'saint_barth',  label: 'Saint-Barth', soon: true },
]

interface IslandSelectorProps {
  value: IslandFilter
  onChange: (island: IslandFilter) => void
}

export function IslandSelector({ value, onChange }: IslandSelectorProps) {
  const [open, setOpen] = useState(false)

  const currentLabel = ISLAND_OPTIONS.find((o) => o.value === value)?.label ?? 'Toutes les îles'

  return (
    <div className="relative w-full md:w-auto">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3.5 py-2 bg-coconut rounded-full border border-mist shadow-sm text-sm font-medium text-charcoal hover:border-deep-green transition-colors md:hidden"
      >
        <MapPin size={14} className="text-deep-green" />
        {currentLabel}
        <span className="text-stone text-xs">▾</span>
      </button>

      <div className="hidden md:flex items-center gap-1.5 rounded-full border border-mist bg-surface p-1 shadow-sm">
        <div className="flex items-center gap-1.5 pl-2 pr-1 text-xs font-medium text-stone">
          <MapPin size={13} className="text-deep-green" />
          Île
        </div>
        {ISLAND_OPTIONS.map(({ value: v, label, soon }) => {
          const active = v === value
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={cn(
                'h-8 rounded-full px-3 text-xs font-medium transition-colors',
                active
                  ? 'bg-deep-green text-coconut shadow-sm'
                  : 'text-charcoal-soft hover:bg-sand hover:text-deep-green'
              )}
            >
              <span>{label}</span>
              {soon && <span className="ml-1 text-[10px] opacity-70">bientôt</span>}
            </button>
          )
        })}
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-full mt-2 left-0 bg-coconut rounded-2xl border border-mist shadow-elevated overflow-hidden z-30 min-w-[180px] md:hidden"
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
              {label}
              {soon && (
                <span className="text-xs text-stone ml-2">bientôt</span>
              )}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}
