'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import {
  Search,
  MessageCircle,
  ChevronRight,
} from 'lucide-react'
import { IslandSelector, type IslandFilter } from '@/components/home/IslandSelector'
import { DateRangePicker } from '@/components/ui/DateRangePicker'

const HERO_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=900&fit=crop&q=90'

const COPY = {
  fr: {
    alt: 'Villa caribéenne — lagon turquoise et nature tropicale',
    placeholder: 'Quand ?',
    title: 'Le meilleur des Antilles,',
    phrases: ['dans votre villa.', 'sur votre île.', 'là où vous séjournez.'],
    subtitle: 'Massage en bord de piscine, chef créole, photographe, DJ ou baby-sitter : les meilleurs prestataires de Guadeloupe, Martinique et Saint-Martin, réservés en quelques clics.',
    mobileSubtitle: 'Les meilleurs prestataires des Antilles, réservés en quelques minutes depuis votre hébergement.',
    mobileTitle: 'Quel service aux Antilles ?',
    search: 'Massage, chef privé, DJ, photographe...',
    explore: 'Réserver',
    concierge: 'Besoin d\'aide ?',
    chips: [
      { label: 'Massage', href: '/search?cat=massage' },
      { label: 'Chef privé', href: '/search?cat=chef_prive' },
      { label: 'DJ', href: '/search?cat=musique' },
      { label: 'Baby-sitter', href: '/search?cat=babysitter' },
    ],
  },
  en: {
    alt: 'Caribbean villa with a turquoise lagoon and tropical nature',
    placeholder: 'When?',
    title: 'The best of the Caribbean,',
    phrases: ['at your villa.', 'on your island.', 'where you\'re staying.'],
    subtitle: 'Poolside massage, Creole chef, photographer, DJ or babysitter: the best providers in Guadeloupe, Martinique and Saint-Martin, booked in a few clicks.',
    mobileSubtitle: 'The best Caribbean providers, booked in minutes from your accommodation.',
    mobileTitle: 'Which service on the island?',
    search: 'Massage, private chef, DJ, photographer...',
    explore: 'Book',
    concierge: 'Need help?',
    chips: [
      { label: 'Massage', href: '/search?cat=massage' },
      { label: 'Private chef', href: '/search?cat=chef_prive' },
      { label: 'DJ', href: '/search?cat=musique' },
      { label: 'Babysitter', href: '/search?cat=babysitter' },
    ],
  },
  es: {
    alt: 'Villa caribeña con laguna turquesa y naturaleza tropical',
    placeholder: '¿Cuándo?',
    title: 'Lo mejor del Caribe,',
    phrases: ['en tu villa.', 'en tu isla.', 'donde te alojas.'],
    subtitle: 'Masaje junto a la piscina, chef criollo, fotógrafo, DJ o canguro: los mejores prestadores de Guadalupe, Martinica y Saint-Martin, reservados en pocos clics.',
    mobileSubtitle: 'Los mejores prestadores del Caribe, reservados en minutos desde tu alojamiento.',
    mobileTitle: '¿Qué servicio en la isla?',
    search: 'Masaje, chef privado, DJ, fotógrafo...',
    explore: 'Reservar',
    concierge: '¿Necesitas ayuda?',
    chips: [
      { label: 'Masaje', href: '/search?cat=massage' },
      { label: 'Chef privado', href: '/search?cat=chef_prive' },
      { label: 'DJ', href: '/search?cat=musique' },
      { label: 'Canguro', href: '/search?cat=babysitter' },
    ],
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
  const [phraseIdx, setPhraseIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % copy.phrases.length)
    }, 2800)
    return () => clearInterval(id)
  }, [copy.phrases.length])

  return (
    <>
      <div ref={ref} className="relative h-[54dvh] min-h-[390px] md:h-[70dvh] md:min-h-[560px] overflow-hidden">
        {/* Parallax background — clipped separately */}
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
          </motion.div>
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-end pb-4 md:pb-10 md:items-center px-4 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="max-w-sm md:max-w-xl md:w-full"
          >
            {/* Mobile search-first card */}
            <div className="space-y-3 rounded-2xl border border-white/60 bg-coconut/92 p-3.5 shadow-elevated backdrop-blur-lg md:hidden">
              <div className="space-y-1.5">
                <h1 className="text-2xl font-display leading-tight text-deep-green">
                  {copy.mobileTitle}
                </h1>
                <p className="text-sm leading-snug text-charcoal/75">
                  {copy.mobileSubtitle}
                </p>
              </div>

              {/* Island + date selectors — mobile */}
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

              <Link
                href="/search"
                className="flex h-12 items-center gap-3 rounded-2xl border border-mist bg-white px-4 transition-all hover:border-deep-green/40 hover:shadow-sm"
              >
                <Search size={16} className="flex-none text-deep-green" />
                <span className="min-w-0 flex-1 truncate text-sm text-stone">{copy.search}</span>
                <span className="rounded-full bg-deep-green px-2.5 py-1 text-xs font-medium text-coconut">
                  {copy.explore}
                </span>
              </Link>

              <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {copy.chips.map((chip) => (
                  <Link
                    key={chip.href}
                    href={chip.href}
                    className="flex-none rounded-full border border-deep-green/15 bg-deep-green/[0.07] px-3 py-1.5 text-xs font-medium text-deep-green"
                  >
                    {chip.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop frosted glass card */}
            <div className="hidden bg-coconut/90 backdrop-blur-lg rounded-2xl md:rounded-3xl p-3 md:p-6 space-y-2.5 md:space-y-4 shadow-elevated border border-white/60 md:block">

              {/* Island + date selectors — above the title */}
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

              <h1 className="text-[1.65rem] md:text-4xl font-display text-deep-green leading-tight">
                {copy.title}
                <span className="block relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.em
                      key={phraseIdx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      className="block whitespace-nowrap"
                    >
                      {copy.phrases[phraseIdx]}
                    </motion.em>
                  </AnimatePresence>
                </span>
              </h1>
              <p className="text-charcoal/75 text-sm leading-relaxed">
                {copy.subtitle}
              </p>

              {/* Search bar */}
              <Link
                href="/search"
                className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-mist hover:border-deep-green/40 hover:shadow-sm transition-all group"
              >
                <Search size={16} className="text-deep-green flex-none" />
                <span className="text-stone text-sm flex-1">{copy.search}</span>
                <span className="text-xs bg-deep-green text-coconut px-2.5 py-1 rounded-full font-medium group-hover:bg-coral transition-colors">
                  {copy.explore}
                </span>
              </Link>

              {/* CTA concierge */}
              <Link
                href="/concierge"
                className="flex items-center gap-2.5 bg-deep-green/8 hover:bg-deep-green/14 border border-deep-green/15 text-deep-green rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors"
              >
                {/* Live dot */}
                <span className="relative flex h-2 w-2 flex-none">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-turquoise opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-turquoise" />
                </span>
                <MessageCircle size={14} className="flex-none" />
                {copy.concierge}
                <ChevronRight size={13} className="ml-auto opacity-50 flex-none" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

    </>
  )
}
