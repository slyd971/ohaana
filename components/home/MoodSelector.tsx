'use client'

import { motion } from 'framer-motion'
import { LayoutGrid, Leaf, Waves, UtensilsCrossed, Landmark, Sun, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const MOODS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: 'all',       label: 'Tout',        Icon: LayoutGrid },
  { key: 'wellness',  label: 'Bien-être',   Icon: Leaf },
  { key: 'soiree',   label: 'Soirée',      Icon: Waves },
  { key: 'food',      label: 'Gastronomie', Icon: UtensilsCrossed },
  { key: 'culture',   label: 'Culture',     Icon: Landmark },
  { key: 'relax',     label: 'Détente',     Icon: Sun },
]

interface MoodSelectorProps {
  value: string
  onChange: (mood: string) => void
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div
      className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide px-5 md:px-0"
      style={{ scrollbarWidth: 'none' }}
    >
      {MOODS.map(({ key, label, Icon }) => {
        const active = key === value
        return (
          <motion.button
            key={key}
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => onChange(key)}
            className={cn(
              'flex-none flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer',
              active
                ? 'bg-deep-green text-coconut shadow-sm'
                : 'bg-coconut border border-mist text-charcoal-soft hover:border-deep-green'
            )}
          >
            <Icon size={14} />
            <span>{label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
