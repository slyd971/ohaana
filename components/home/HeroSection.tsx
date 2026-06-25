'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { Search, MessageCircle, ChevronRight } from 'lucide-react'
import { IslandSelector, type IslandFilter } from '@/components/home/IslandSelector'
import { DateRangePicker } from '@/components/ui/DateRangePicker'

const HERO_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=900&fit=crop&q=90'

const COPY = {
  fr: {
    alt: 'Villa caribéenne — lagon turquoise et nature tropicale',
    placeholder: 'Quand ?',
    title: 'Ce soir, le chef vient chez vous.',
    subtitle: 'Massage en bord de piscine, chef créole, photographe ou DJ : les meilleurs prestataires de Guadeloupe, Martinique et Saint-Martin, réservés en quelques clics.',
    mobileSubtitle: 'Massage, chef créole, DJ — les meilleurs prestataires des Antilles, à deux clics de chez vous.',
    search: 'Massage, chef privé, DJ, photographe...',
    explore: 'Réserver',
    concierge: "Besoin d'aide ?",
  },
  en: {
    alt: 'Caribbean villa with a turquoise lagoon and tropical nature',
    placeholder: 'When?',
    title: 'Tonight, the chef comes to you.',
    subtitle: 'Poolside massage, Creole chef, photographer or DJ: the best providers in Guadeloupe, Martinique and Saint-Martin, booked in a few clicks.',
    mobileSubtitle: 'Massage, Creole chef, DJ — the best Caribbean providers, two clicks from home.',
    search: 'Massage, private chef, DJ, photographer...',
    explore: 'Book',
    concierge: 'Need help?',
  },
  es: {
    alt: 'Villa caribeña con laguna turquesa y naturaleza tropical',
    placeholder: '¿Cuándo?',
    title: 'Esta noche, el chef viene a ti.',
    subtitle: 'Masaje junto a la piscina, chef criollo, fotógrafo o DJ: los mejores prestadores de Guadalupe, Martinica y Saint-Martin, reservados en pocos clics.',
    mobileSubtitle: 'Masaje, chef criollo, DJ — los mejores prestadores del Caribe, a dos clics de donde estás.',
    search: 'Masaje, chef privado, DJ, fotógrafo...',
    explore: 'Reservar',
    concierge: '¿Necesitas ayuda?',
  },
} as const

interface HeroSectionProps {
  island: IslandFilter
  onIslandChange: (v: IslandFilter) => void
  stayStart: Date | null
  stayEnd: Date | null
  onDatesChange: (start: Date | null, end: Date | null) => void
}

export function HeroSection({
  island,
  onIslandChange,
  stayStart,
  stayEnd,
  onDatesChange,
}: HeroSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const locale = useLocale()
  const copy = COPY[(locale in COPY ? locale : 'fr') as keyof typeof COPY]
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 140])

  return (
    <div ref={ref} className="relative h-[56dvh] min-h-[420px] md:h-[72dvh] md:min-h-[580px] overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div className="absolute inset-0 scale-110" style={{ y }}>
          <Image
            src={HERO_IMG}
            alt={copy.alt}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
        </motion.div>
      </div>

      <div className="relative h-full flex flex-col justify-end pb-4 md:pb-12 px-4 md:px-12 md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="w-full max-w-sm md:max-w-xl"
        >
          <div className="rounded-2xl md:rounded-3xl border border-white/60 bg-coconut/92 backdrop-blur-lg p-4 md:p-6 shadow-elevated space-y-3 md:space-y-4">

            <div>
              <h1 className="text-xl md:text-[2.05rem] font-display leading-tight text-deep-green">
                {copy.title}
              </h1>
              <p className="hidden md:block mt-2 text-sm leading-relaxed text-charcoal/75">
                {copy.subtitle}
              </p>
              <p className="md:hidden mt-1 text-xs leading-relaxed text-charcoal/70">
                {copy.mobileSubtitle}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <IslandSelector value={island} onChange={onIslandChange} />
              <div className="flex-1 min-w-0">
                <DateRangePicker
                  startDate={stayStart}
                  endDate={stayEnd}
                  onChange={onDatesChange}
                  placeholder={copy.placeholder}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/search"
                className="flex flex-1 items-center gap-2 rounded-xl border border-mist bg-white px-3 py-2.5 transition-colors hover:border-deep-green/40"
              >
                <Search size={15} className="flex-none text-deep-green" />
                <span className="min-w-0 flex-1 truncate text-sm text-stone">{copy.search}</span>
              </Link>
              <Link
                href="/search"
                className="flex-none rounded-xl bg-deep-green px-4 py-2.5 text-sm font-medium text-coconut transition-colors hover:bg-coral"
              >
                {copy.explore}
              </Link>
            </div>

            <Link
              href="/concierge"
              className="flex items-center gap-2.5 rounded-xl border border-deep-green/15 bg-deep-green/[0.07] px-4 py-2.5 text-sm font-medium text-deep-green transition-colors hover:bg-deep-green/[0.12]"
            >
              <span className="relative flex h-2 w-2 flex-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-turquoise opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-turquoise" />
              </span>
              <MessageCircle size={14} className="flex-none" />
              {copy.concierge}
              <ChevronRight size={13} className="ml-auto flex-none opacity-50" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
