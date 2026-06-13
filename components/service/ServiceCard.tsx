'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, Heart, Clock } from 'lucide-react'
import { cn, formatPrice, formatDuration, formatRating } from '@/lib/utils'
import { Link } from '@/lib/i18n/navigation'
import type { SERVICES } from '@/lib/data/seed'

type ServiceData = typeof SERVICES[0]

interface ServiceCardProps {
  service: ServiceData
  isFavorite?: boolean
  onToggleFavorite?: (id: string) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ServiceCard({
  service,
  isFavorite = false,
  onToggleFavorite,
  size = 'md',
  className,
}: ServiceCardProps) {
  const cover = service.images.find((img) => img.is_cover) ?? service.images[0]
  const price = formatPrice(service.price_cents)

  const widths  = { sm: 'w-52', md: 'w-64', lg: 'w-72' }
  const heights = { sm: 'h-36', md: 'h-44', lg: 'h-52' }

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className={cn(
        'relative flex-none rounded-2xl overflow-hidden bg-surface cursor-pointer group',
        'shadow-card hover:shadow-elevated transition-all duration-300',
        widths[size],
        className
      )}
    >
      <Link href={`/prestataires/${service.id}`} className="block">
        {/* Image */}
        <div className={cn('relative overflow-hidden', heights[size])}>
          <Image
            src={cover?.url ?? ''}
            alt={cover?.alt_fr ?? service.title_fr}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 256px, 288px"
          />
          {/* Vignette bas — ton chaud deep-green plutôt que noir froid */}
          <div className="absolute inset-0 bg-gradient-to-t from-deep-green/50 via-transparent to-transparent" />

          {/* Favorite */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onToggleFavorite(service.id) }}
              className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/25 backdrop-blur-sm hover:bg-white/50 transition-colors"
              aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Heart
                size={15}
                className={cn(isFavorite ? 'fill-coral text-coral' : 'fill-transparent text-white')}
              />
            </button>
          )}

          {/* Badge populaire */}
          {service.is_featured && (
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-coral text-coconut text-[10px] font-semibold tracking-wide">
              Populaire
            </span>
          )}

          {/* Prix en overlay sur l'image */}
          <div className="absolute bottom-2.5 left-3">
            <span className="text-coconut text-sm font-semibold drop-shadow-md">
              {price}
            </span>
            <span className="text-coconut/70 text-xs"> / pers.</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5 space-y-2">
          {/* Provider + rating inline */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative w-5 h-5 rounded-full overflow-hidden flex-none ring-1 ring-mist">
                <Image
                  src={service.provider.user.avatar_url}
                  alt={service.provider.user.full_name}
                  fill
                  className="object-cover"
                  sizes="20px"
                />
              </div>
              <span className="text-xs text-stone truncate">{service.provider.business_name}</span>
            </div>
            <div className="flex items-center gap-1 flex-none">
              <Star size={11} className="fill-[#F5A623] text-[#F5A623]" />
              <span className="text-xs font-medium text-charcoal">{formatRating(service.avg_rating)}</span>
              <span className="text-xs text-stone">({service.review_count})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-charcoal leading-snug line-clamp-2">
            {service.title_fr}
          </h3>

          {/* Duration */}
          {service.duration_min && (
            <div className="flex items-center gap-1 text-xs text-stone">
              <Clock size={11} />
              <span>{formatDuration(service.duration_min)}</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
