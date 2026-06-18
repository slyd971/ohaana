'use client'

import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import { LayoutGrid, Leaf, Waves, UtensilsCrossed, Landmark, Heart, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Lang = 'fr' | 'en' | 'es'

export const CATEGORIES: { key: string; label: Record<Lang, string>; Icon: LucideIcon }[] = [
  { key: 'all',      label: { fr: 'Tout', en: 'All', es: 'Todo' }, Icon: LayoutGrid },
  { key: 'wellness', label: { fr: 'Bien-être', en: 'Wellness', es: 'Bienestar' }, Icon: Leaf },
  { key: 'soiree',   label: { fr: 'Soirée', en: 'Evening', es: 'Velada' }, Icon: Waves },
  { key: 'food',     label: { fr: 'Gastronomie', en: 'Food', es: 'Gastronomía' }, Icon: UtensilsCrossed },
  { key: 'couples',  label: { fr: 'Couples', en: 'Couples', es: 'Parejas' }, Icon: Heart },
  { key: 'culture',  label: { fr: 'Culture', en: 'Culture', es: 'Cultura' }, Icon: Landmark },
]

interface MoodSelectorProps {
  value: string
  onChange: (mood: string) => void
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  const locale = useLocale()
  const lang: Lang = (['fr', 'en', 'es'] as Lang[]).includes(locale as Lang) ? (locale as Lang) : 'fr'

  return (
    <div
      className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide px-5 md:px-0"
      style={{ scrollbarWidth: 'none' }}
    >
      {CATEGORIES.map(({ key, label, Icon }) => {
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
            <span>{label[lang]}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
