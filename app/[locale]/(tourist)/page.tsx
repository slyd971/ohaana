'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from '@/lib/i18n/navigation'
import { HeroSection } from '@/components/home/HeroSection'
import { ServiceRow } from '@/components/home/ServiceRow'
import { IslandSelector } from '@/components/home/IslandSelector'
import { MoodSelector } from '@/components/home/MoodSelector'
import { SERVICES, HOME_ROWS, getServicesByIds } from '@/lib/data/seed'
import type { Island } from '@/types/database'

const MOOD_FILTER: Record<string, string[]> = {
  luxury:    ['luxe', 'villa', 'prestige'],
  wellness:  ['bien-être', 'spa', 'relaxation'],
  adventure: ['aventure', 'nature'],
  food:      ['gastronomie', 'cuisine'],
  culture:   ['culture', 'créole'],
  relax:     ['relaxation', 'détente', 'plage', 'coucher de soleil'],
}

export default function HomePage() {
  const [island, setIsland] = useState<Island>('guadeloupe')
  const [mood, setMood] = useState<string>('all')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function filterByMood(services: typeof SERVICES) {
    if (mood === 'all') return services
    const keywords = MOOD_FILTER[mood] ?? []
    return services.filter((s) =>
      keywords.some((kw) => s.tags.some((tag) => tag.includes(kw)))
    )
  }

  return (
    <div className="bg-coconut">
      {/* Hero */}
      <HeroSection />

      {/* Controls strip */}
      <div className="sticky top-16 z-20 bg-coconut/96 backdrop-blur-md border-b border-mist pt-3 pb-2 space-y-2.5">
        <div className="flex items-center justify-between px-5 md:px-8">
          <IslandSelector value={island} onChange={setIsland} />
        </div>
        <MoodSelector value={mood} onChange={setMood} />
      </div>

      {/* Netflix rows */}
      <div className="py-8 space-y-10 max-w-7xl mx-auto md:px-8">
        {HOME_ROWS.map(({ key, label_fr, ids }) => {
          const all = getServicesByIds(ids)
          const filtered = filterByMood(all)
          return (
            <ServiceRow
              key={key}
              title={label_fr}
              services={filtered}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              seeAllHref={`/search?mood=${key}`}
            />
          )
        })}
      </div>

      {/* Concierge CTA banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-5 md:mx-8 mb-10 rounded-3xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, var(--deep-green) 0%, #0F2B1D 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FDFAF4' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='37' cy='37' r='1'/%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        <div className="relative px-6 py-8 text-center space-y-4">
          <p className="text-xl font-display text-coconut">
            Vous avez une idée en tête&nbsp;?
          </p>
          <p className="text-coconut/70 text-sm max-w-xs mx-auto">
            Notre concierge trouve et organise l&apos;expérience parfaite pour vous, même les plus insolites.
          </p>
          <Link
            href="/concierge"
            className="inline-flex items-center gap-2 bg-coral text-coconut px-6 py-3 rounded-full font-medium text-sm hover:bg-coral-light transition-colors shadow-sm"
          >
            💬 Parler au concierge
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
