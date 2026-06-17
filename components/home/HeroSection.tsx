'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Link } from '@/lib/i18n/navigation'
import {
  Search,
  MessageCircle,
  ShieldCheck,
  CreditCard,
  Headphones,
  ChevronRight,
} from 'lucide-react'
import { IslandSelector, type IslandFilter } from '@/components/home/IslandSelector'
import { DateRangePicker } from '@/components/ui/DateRangePicker'

const HERO_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=900&fit=crop&q=90'

const ROTATING_PHRASES = [
  'chez vous.',
  'ce soir.',
  'sur mesure.',
  'en toute sérénité.',
]

const VALUE_PROOFS = [
  {
    icon: ShieldCheck,
    title: 'Prestataires vérifiés',
    sub: 'Sélection locale',
  },
  {
    icon: CreditCard,
    title: 'Paiement sécurisé',
    sub: 'Confirmation protégée',
  },
  {
    icon: Headphones,
    title: 'Support 7j/7',
    sub: 'Avant et pendant le séjour',
  },
]

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
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 140])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const [phraseIdx, setPhraseIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % ROTATING_PHRASES.length)
    }, 2800)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      {/* overflow-visible so the calendar dropdown can escape the hero boundary */}
      <div ref={ref} className="relative h-[70dvh] min-h-[520px] md:h-[82dvh] md:min-h-[620px]">
        {/* Parallax background — clipped separately */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div className="absolute inset-0 scale-110" style={{ y }}>
            <Image
              src={HERO_IMG}
              alt="Villa caribéenne — lagon turquoise et nature tropicale"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
          </motion.div>
        </div>

        {/* Content */}
        <motion.div
          style={{ opacity }}
          className="relative h-full flex flex-col justify-end pb-5 md:justify-center md:pb-0 md:items-center px-5 md:px-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="max-w-sm md:max-w-2xl md:w-full"
          >
            {/* Frosted glass card */}
            <div className="bg-coconut/88 backdrop-blur-lg rounded-3xl p-4 md:p-8 space-y-3 md:space-y-5 shadow-elevated border border-white/60">

              {/* Island + date selectors — above the title */}
              <div className="flex items-center gap-2">
                <IslandSelector value={island} onChange={onIslandChange} />
                <div className="flex-1 min-w-0">
                  <DateRangePicker
                    startDate={stayStart}
                    endDate={stayEnd}
                    onChange={onDatesChange}
                    placeholder="Quand ?"
                    upward
                  />
                </div>
              </div>

              <h1 className="text-2xl md:text-5xl lg:text-6xl font-display text-deep-green leading-tight">
                La Caraïbe authentique,{' '}
                <span className="inline-block relative">
                  <AnimatePresence mode="wait">
                    <motion.em
                      key={phraseIdx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      className="inline-block"
                    >
                      {ROTATING_PHRASES[phraseIdx]}
                    </motion.em>
                  </AnimatePresence>
                </span>
              </h1>
              <p className="text-charcoal/75 text-sm md:text-base leading-relaxed md:max-w-lg">
                Chef(fe) à domicile, massages, DJ, shootings photo — réservez les meilleures expériences des Caraïbes, sélectionnées par des locaux.
              </p>

              {/* Search bar */}
              <Link
                href="/search"
                className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-mist hover:border-deep-green/40 hover:shadow-sm transition-all group"
              >
                <Search size={16} className="text-deep-green flex-none" />
                <span className="text-stone text-sm flex-1">Que souhaitez-vous vivre pendant votre séjour ?</span>
                <span className="text-xs bg-deep-green text-coconut px-2.5 py-1 rounded-full font-medium group-hover:bg-coral transition-colors">
                  Réserver
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
                Demander conseil à notre concierge
                <ChevronRight size={13} className="ml-auto opacity-50 flex-none" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Value proofs strip */}
      <div className="bg-sand border-b border-mist">
        <div className="max-w-3xl mx-auto px-5 py-5 grid grid-cols-3 gap-4">
          {VALUE_PROOFS.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex flex-col items-center text-center gap-1.5">
              <div className="w-9 h-9 rounded-full bg-deep-green/8 flex items-center justify-center">
                <Icon size={16} className="text-deep-green" />
              </div>
              <p className="text-xs font-semibold text-charcoal leading-tight">{title}</p>
              <p className="text-[10px] text-stone leading-tight hidden sm:block">{sub}</p>
            </div>
          ))}
        </div>
      </div>

    </>
  )
}
