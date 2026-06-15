'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { ServiceCard } from '@/components/service/ServiceCard'
import type { SERVICES } from '@/lib/data/seed'

type ServiceData = typeof SERVICES[0]

interface ServiceRowProps {
  title: string
  services: ServiceData[]
  favorites?: Set<string>
  onToggleFavorite?: (id: string) => void
  seeAllHref?: string
}

export function ServiceRow({
  title,
  services,
  favorites = new Set(),
  onToggleFavorite,
  seeAllHref = '/search',
}: ServiceRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)

  if (!services.length) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 md:px-0">
        <h2 className="text-lg font-display text-charcoal">{title}</h2>
        <a
          href={seeAllHref}
          className="flex items-center gap-0.5 text-sm text-deep-green font-medium"
        >
          Voir tout <ChevronRight size={15} />
        </a>
      </div>

      {/* Horizontal scroll */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto pb-2 scroll-snap-x px-5 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {services.map((service, i) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className="min-w-0"
          >
            <ServiceCard
              service={service}
              isFavorite={favorites.has(service.id)}
              onToggleFavorite={onToggleFavorite}
              className="w-full"
            />
          </motion.div>
        ))}
        {/* Trailing spacer */}
        <div className="w-1 flex-none md:hidden" />
      </div>
    </motion.section>
  )
}
