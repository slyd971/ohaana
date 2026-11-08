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
      className="flex gap-2 overflow-x-auto scrollbar-hide md:justify-center md:gap-4"
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
            className={cn(
              'relative flex-none flex min-w-[4.5rem] flex-col items-center gap-1.5 px-3 pt-2 pb-3 text-xs font-medium transition-colors duration-200 cursor-pointer',
              active ? 'text-deep-green' : 'text-stone hover:text-charcoal'
            )}
          >
            <Icon size={22} strokeWidth={active ? 1.9 : 1.5} />
            <span>{label[lang]}</span>
            <span
              className={cn(
                'absolute inset-x-3 bottom-0 h-0.5 rounded-full transition-colors',
                active ? 'bg-deep-green' : 'bg-transparent'
              )}
            />
          </motion.button>
        )
      })}
    </div>
  )
}
