'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import { Heart, Clock, MapPin } from 'lucide-react'
import { cn, formatPrice, formatDuration } from '@/lib/utils'
import { Link } from '@/lib/i18n/navigation'
import type { ServiceView } from '@/lib/data/types'

type ServiceData = ServiceView

interface ServiceCardProps {
  service: ServiceData
  isFavorite?: boolean
  onToggleFavorite?: (id: string) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const ISLAND_LABELS: Record<string, string> = {
  guadeloupe:   'Guadeloupe',
  martinique:   'Martinique',
  saint_martin: 'Saint-Martin',
  saint_barth:  'Saint-Barth',
}

const TAG_BADGES: Record<string, { fr: string; en: string; es: string }> = {
  'couple':            { fr: 'Couple', en: 'Couple', es: 'Pareja' },
  'famille':           { fr: 'Famille', en: 'Family', es: 'Familia' },
  'aventure':          { fr: 'Aventure', en: 'Adventure', es: 'Aventura' },
  'bien-être':         { fr: 'Bien-être', en: 'Wellness', es: 'Bienestar' },
  'coucher de soleil': { fr: 'Sunset', en: 'Sunset', es: 'Atardecer' },
  'gastronomie':       { fr: 'Gastro', en: 'Food', es: 'Gastronomía' },
  'culture':           { fr: 'Culture', en: 'Culture', es: 'Cultura' },
  'nature':            { fr: 'Nature', en: 'Nature', es: 'Naturaleza' },
  'beauté':            { fr: 'Beauté', en: 'Beauty', es: 'Belleza' },
}

const TAG_PRIORITY = [
  'coucher de soleil', 'bien-être', 'culture', 'aventure', 'gastronomie', 'nature', 'beauté',
]

export function ServiceCard({
  service,
  isFavorite = false,
  onToggleFavorite,
  size = 'md',
  className,
}: ServiceCardProps) {
  const locale = useLocale()
  const lang = locale === 'en' ? 'en' : locale === 'es' ? 'es' : 'fr'
  const isEn = locale === 'en'
  const cover = service.images.find((img) => img.is_cover) ?? service.images[0]
  const price = formatPrice(service.price_cents)
  const title = locale === 'es'
    ? ((service as { title_es?: string }).title_es ?? service.title_en)
    : isEn ? service.title_en : service.title_fr
  const coverAlt = isEn || locale === 'es' ? cover?.alt_en : cover?.alt_fr

  const widths = { sm: 'w-52', md: 'w-64', lg: 'w-72' }

  const primaryTag = TAG_PRIORITY.find((t) => service.tags.includes(t))
  const islandLabel = ISLAND_LABELS[service.island] ?? service.island

  const perPerson = locale === 'en' ? '/ person' : locale === 'es' ? '/ pers.' : '/ pers.'
  const addFav = locale === 'en' ? 'Add to favorites' : locale === 'es' ? 'Añadir a favoritos' : 'Ajouter aux favoris'
  const removeFav = locale === 'en' ? 'Remove from favorites' : locale === 'es' ? 'Quitar de favoritos' : 'Retirer des favoris'
  const popular = locale === 'en' ? 'Popular' : locale === 'es' ? 'Popular' : 'Populaire'

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={cn('relative flex-none cursor-pointer group', widths[size], className)}
    >
      <Link href={`/prestataires/${service.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-sand">
          <Image
            src={cover?.url ?? ''}
            alt={coverAlt ?? title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 288px, 360px"
          />

          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onToggleFavorite(service.id) }}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-transform hover:scale-110 before:absolute before:-inset-1.5 before:content-['']"
              aria-label={isFavorite ? removeFav : addFav}
            >
              <Heart
                size={15}
                className={cn(isFavorite ? 'fill-coral text-coral-text' : 'fill-transparent text-charcoal')}
              />
            </button>
          )}

          {service.is_featured && (
            <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-deep-green shadow-sm">
              {popular}
            </span>
          )}
        </div>

        <div className="pt-3 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[15px] font-semibold text-charcoal leading-snug line-clamp-1">
              {title}
            </h3>
            {primaryTag && (
              <span className="flex-none rounded-full bg-sand px-2 py-0.5 text-xs font-medium text-charcoal-soft">
                {TAG_BADGES[primaryTag][lang as 'fr' | 'en' | 'es']}
              </span>
            )}
          </div>

          <p className="flex items-center gap-1 text-xs text-stone">
            <MapPin size={11} className="flex-none" />
            <span className="truncate">{islandLabel}</span>
            {service.duration_min ? (
              <>
                <span aria-hidden="true">·</span>
                <Clock size={11} className="flex-none" />
                <span className="flex-none">{formatDuration(service.duration_min)}</span>
              </>
            ) : null}
          </p>

          <p className="text-sm text-charcoal">
            <span className="font-semibold">{price}</span>
            <span className="text-stone"> {perPerson}</span>
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
