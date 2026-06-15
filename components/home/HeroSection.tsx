'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from '@/lib/i18n/navigation'
import { Search, MessageCircle, ChefHat, Sparkles, Phone } from 'lucide-react'

const HERO_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=900&fit=crop&q=90'

const VALUE_PROOFS = [
  {
    icon: ChefHat,
    title: 'Prestataires locaux',
    sub: 'Sélectionnés sur le terrain',
  },
  {
    icon: Sparkles,
    title: 'Sur mesure',
    sub: 'Chaque expérience est unique',
  },
  {
    icon: Phone,
    title: 'Concierge en option',
    sub: 'Pour les demandes sur mesure',
  },
]

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 140])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <>
      <div ref={ref} className="relative h-[92dvh] min-h-[580px] overflow-hidden md:h-[82dvh] md:min-h-[620px]">
        {/* Parallax background */}
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

        {/* Content */}
        <motion.div
          style={{ opacity }}
          className="relative h-full flex flex-col justify-end pb-10 px-5 md:px-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="max-w-sm"
          >
            {/* Frosted glass card */}
            <div className="bg-coconut/88 backdrop-blur-lg rounded-3xl p-6 space-y-4 shadow-elevated border border-white/60">
              {/* Prototype chip */}
              <div className="inline-flex items-center gap-1.5 bg-sand rounded-full px-3 py-1 border border-mist">
                <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
                <span className="text-xs font-medium text-charcoal">Prototype · données de démo</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-display text-deep-green leading-tight">
                La Caraïbe authentique,<br />
                <em>chez vous.</em>
              </h1>
              <p className="text-charcoal/75 text-sm md:text-base leading-relaxed">
                Réservez des expériences à domicile — chefs créoles, DJ, massages en villa, décorations sur mesure. Et si vous le souhaitez, un concierge peut vous aider à tout coordonner.
              </p>

              {/* Search bar */}
              <Link
                href="/search"
                className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-mist hover:border-deep-green/40 hover:shadow-sm transition-all group"
              >
                <Search size={16} className="text-deep-green flex-none" />
                <span className="text-stone text-sm flex-1">Chef, DJ, massage, décoration villa…</span>
                <span className="text-xs bg-deep-green text-coconut px-2.5 py-1 rounded-full font-medium group-hover:bg-coral transition-colors">
                  Explorer
                </span>
              </Link>

              {/* CTA concierge */}
              <Link
                href="/concierge"
                className="inline-flex items-center gap-2 text-deep-green text-sm font-medium hover:text-coral transition-colors"
              >
                <MessageCircle size={14} />
                Ajouter l&apos;option concierge
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
