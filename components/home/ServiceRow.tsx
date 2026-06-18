'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import { ChevronRight } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { ServiceCard } from '@/components/service/ServiceCard'
import { cn } from '@/lib/utils'
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
  const rowRef  = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const locale  = useLocale()
  const seeAll  = locale === 'en' ? 'See all' : locale === 'es' ? 'Ver todo' : 'Voir tout'

  const [activeIdx, setActiveIdx] = useState(0)

  // Track which card is most visible in the scroll container
  useEffect(() => {
    const row = rowRef.current
    if (!row) return

    const observer = new IntersectionObserver(
      (entries) => {
        let maxRatio = 0
        let maxIdx   = activeIdx
        entries.forEach((entry) => {
          const idx = cardRefs.current.indexOf(entry.target as HTMLDivElement)
          if (idx !== -1 && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio
            maxIdx   = idx
          }
        })
        if (maxRatio > 0) setActiveIdx(maxIdx)
      },
      { root: row, threshold: [0.4, 0.6, 0.8] }
    )

    cardRefs.current.forEach((el) => { if (el) observer.observe(el) })
    return () => observer.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services.length])

  const scrollTo = useCallback((idx: number) => {
    const card = cardRefs.current[idx]
    const row  = rowRef.current
    if (!card || !row) return
    const offset = card.offsetLeft - row.offsetLeft - 20
    row.scrollTo({ left: offset, behavior: 'smooth' })
    setActiveIdx(idx)
  }, [])

  if (!services.length) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between px-5 md:px-0">
        <h2 className="text-lg font-display text-charcoal">{title}</h2>
        <Link
          href={seeAllHref}
          className="flex items-center gap-0.5 text-sm text-deep-green font-medium"
        >
          {seeAll} <ChevronRight size={15} />
        </Link>
      </div>

      <div className="space-y-3 md:space-y-0">
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto pb-1 scroll-snap-x px-5 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              ref={(el) => { cardRefs.current[i] = el }}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="flex-none md:min-w-0"
            >
              <ServiceCard
                service={service}
                isFavorite={favorites.has(service.id)}
                onToggleFavorite={onToggleFavorite}
                className="md:w-full"
              />
            </motion.div>
          ))}
          <div className="w-1 flex-none md:hidden" />
        </div>

        {/* Dots — mobile only, cliquables */}
        <div className="flex justify-center gap-2 md:hidden" role="tablist" aria-label="Navigation">
          {services.map((service, i) => (
            <button
              key={service.id}
              role="tab"
              aria-selected={i === activeIdx}
              aria-label={`Service ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={cn(
                'rounded-full transition-all duration-300',
                i === activeIdx
                  ? 'w-5 h-2 bg-deep-green'
                  : 'w-2 h-2 bg-charcoal/20 hover:bg-charcoal/40'
              )}
            />
          ))}
        </div>
      </div>
    </motion.section>
  )
}
