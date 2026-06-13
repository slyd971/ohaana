'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { Search, MessageCircle, Star } from 'lucide-react'

// Dîner en plein air, convivial, lumière chaude — on voit de l'humain
const HERO_IMG = 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600&h=900&fit=crop&q=90&bri=5&sat=10'

export function HeroSection() {
  const t = useTranslations('home')
  const ref = useRef<HTMLDivElement>(null)

  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 140])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <div ref={ref} className="relative h-[92dvh] min-h-[580px] overflow-hidden">
      {/* Parallax background */}
      <motion.div className="absolute inset-0 scale-110" style={{ y }}>
        <Image
          src={HERO_IMG}
          alt="Expériences caribéennes — convivialité et joie de vivre"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Vignette subtile pour la profondeur */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
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
          {/* Card frosted glass */}
          <div className="bg-coconut/88 backdrop-blur-lg rounded-3xl p-6 space-y-4 shadow-elevated border border-white/60">
            {/* Social proof chip */}
            <div className="inline-flex items-center gap-1.5 bg-sand rounded-full px-3 py-1 border border-mist">
              <Star size={11} className="fill-[#F5A623] text-[#F5A623]" />
              <span className="text-xs font-medium text-charcoal">4.9 · 200+ expériences</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-display text-deep-green leading-tight">
              {t('heroTitle')}
            </h1>
            <p className="text-charcoal/80 text-sm md:text-base leading-relaxed">
              {t('heroSub')}
            </p>

            {/* Search bar */}
            <Link
              href="/search"
              className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-mist hover:border-deep-green/40 hover:shadow-sm transition-all group"
            >
              <Search size={16} className="text-deep-green flex-none" />
              <span className="text-stone text-sm flex-1">Chef, massage, bateau…</span>
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
              {t('askConcierge')}
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
