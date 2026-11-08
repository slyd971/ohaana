'use client'

import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import { LayoutGrid, Flower2, Waves, UtensilsCrossed, Landmark, Heart, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Lang = 'fr' | 'en' | 'es'

export const CATEGORIES: { key: string; label: Record<Lang, string>; Icon: LucideIcon }[] = [
  { key: 'all',      label: { fr: 'Tout', en: 'All', es: 'Todo' }, Icon: LayoutGrid },
  { key: 'wellness', label: { fr: 'Bien-être', en: 'Wellness', es: 'Bienestar' }, Icon: Flower2 },
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
      className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide md:gap-5"
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
            aria-pressed={active}
            className="group flex-none flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <span
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-200',
                active
                  ? 'border-deep-green bg-deep-green text-coconut shadow-sm'
                  : 'border-mist bg-white text-charcoal-soft group-hover:border-deep-green/50'
              )}
            >
              <Icon size={20} strokeWidth={1.7} />
            </span>
            <span
              className={cn(
                'text-xs font-medium transition-colors',
                active ? 'text-deep-green' : 'text-stone group-hover:text-charcoal'
              )}
            >
              {label[lang]}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
