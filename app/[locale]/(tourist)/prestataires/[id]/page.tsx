'use client'

import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Link } from '@/lib/i18n/navigation'
import { Star, Clock, Users, MapPin, Heart, Globe, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ServiceCard } from '@/components/service/ServiceCard'
import { getServiceById, SERVICES } from '@/lib/data/seed'
import { formatPrice, formatDuration, formatRating, cn } from '@/lib/utils'

const LANG_FLAGS: Record<string, string> = { fr: '🇫🇷', en: '🇬🇧', es: '🇪🇸', de: '🇩🇪', kr: '🏝️' }

const MOCK_REVIEWS = [
  { id: '1', tourist: 'Sophie M.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop', rating: 5, content: 'Une expérience absolument magique. Chef Marcus a transformé notre soirée en quelque chose d\'inoubliable. Chaque plat était un voyage dans la cuisine créole.', date: 'Mars 2025' },
  { id: '2', tourist: 'James K.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop', rating: 5, content: 'Incredible evening! The chef was professional, creative and so passionate. The rum pairing was a revelation. Already booked again for next week.', date: 'Février 2025' },
  { id: '3', tourist: 'Amélie D.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop', rating: 5, content: 'Un dîner de rêve dans notre villa de Deshaies. Les produits du marché, les saveurs intenses, la présentation soignée... vraiment 5 étoiles.', date: 'Janvier 2025' },
]

export default function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const service = getServiceById(id)
  if (!service) notFound()

  const [imgIndex, setImgIndex] = useState(0)
  const [isFav, setIsFav] = useState(false)

  const relatedServices = SERVICES
    .filter((s) => s.provider_id === service.provider_id && s.id !== service.id)
    .slice(0, 3)

  const { provider, images } = service

  return (
    <div className="bg-coconut pb-32 md:pb-8">
      {/* Image gallery hero — tall, provider identity overlaid */}
      <div className="relative h-[420px] md:h-[540px] bg-charcoal">
        {images.map((img, i) => (
          <motion.div
            key={img.id}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: i === imgIndex ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          >
            <Image src={img.url} alt={img.alt_fr ?? ''} fill className="object-cover object-center" priority={i === 0} sizes="100vw" />
          </motion.div>
        ))}

        {/* Gradient: dark top bar + strong bottom for text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />

        {/* Back */}
        <Link href="/search" className="absolute top-4 left-4 p-2 rounded-full bg-black/35 backdrop-blur-sm text-white hover:bg-black/55 transition-colors z-10">
          <ChevronLeft size={20} />
        </Link>

        {/* Favorite */}
        <button
          type="button"
          onClick={() => setIsFav((v) => !v)}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/35 backdrop-blur-sm hover:bg-black/55 transition-colors z-10"
        >
          <Heart size={20} className={cn(isFav ? 'fill-coral text-coral' : 'text-white fill-transparent')} />
        </button>

        {/* Gallery side nav */}
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => setImgIndex((i) => Math.max(0, i - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white disabled:opacity-0 transition-opacity"
              disabled={imgIndex === 0}>
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={() => setImgIndex((i) => Math.min(images.length - 1, i + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white disabled:opacity-0 transition-opacity"
              disabled={imgIndex === images.length - 1}>
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Provider identity — bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 flex items-end gap-4">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/80 shadow-lg flex-none">
            <Image src={provider.user.avatar_url} alt={provider.user.full_name} fill className="object-cover" sizes="64px" />
          </div>
          <div className="flex-1 min-w-0 pb-0.5">
            <h2 className="text-2xl font-display text-white leading-tight drop-shadow-sm">
              {provider.business_name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Star size={13} className="fill-[#F5A623] text-[#F5A623] flex-none" />
              <span className="text-sm font-semibold text-white">{formatRating(provider.avg_rating)}</span>
              <span className="text-sm text-white/70">({provider.review_count} avis)</span>
              <span className="text-white/40">·</span>
              {provider.languages.map((l) => (
                <span key={l} className="text-sm">{LANG_FLAGS[l] ?? l}</span>
              ))}
            </div>
          </div>
          {/* Gallery dots — top-right of provider strip */}
          {images.length > 1 && (
            <div className="flex gap-1.5 pb-1 shrink-0">
              {images.map((_, i) => (
                <button key={i} type="button" onClick={() => setImgIndex(i)}
                  className={cn('h-1.5 rounded-full transition-all', i === imgIndex ? 'bg-white w-4' : 'bg-white/40 w-1.5')}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-0">
        {/* Title + price */}
        <div className="space-y-3 mb-5 pt-5">
          <h1 className="text-3xl font-display text-charcoal leading-tight">{service.title_fr}</h1>

          <div className="flex flex-wrap gap-2">
            {service.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="green">{tag}</Badge>
            ))}
          </div>

          <div className="flex items-center gap-5 text-sm text-stone">
            {service.duration_min && (
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-deep-green" />
                {formatDuration(service.duration_min)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-deep-green" />
              {service.capacity_min === service.capacity_max
                ? `${service.capacity_max} pers.`
                : `${service.capacity_min}–${service.capacity_max} pers.`}
            </span>
            {service.address && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-deep-green" />
                {service.address.split(',')[0]}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider mb-2">À propos</h3>
          <p className="text-sm text-charcoal-soft leading-relaxed">{service.description_fr}</p>
        </section>

        {/* Provider bio */}
        <section className="mb-6 bg-sand rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-none">
              <Image src={provider.user.avatar_url} alt={provider.user.full_name} fill className="object-cover" sizes="40px" />
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal">{provider.user.full_name}</p>
              <p className="text-xs text-stone">{provider.business_name}</p>
            </div>
          </div>
          <p className="text-sm text-charcoal-soft leading-relaxed">{provider.bio}</p>

          {provider.certifications.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {provider.certifications.map((cert) => (
                <Badge key={cert} variant="turquoise">{cert}</Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <span className="flex items-center gap-1 text-xs text-stone">
              <Globe size={12} />
              {provider.languages.map((l) => LANG_FLAGS[l] ?? l).join(' ')}
            </span>
            {provider.whatsapp && (
              <a
                href={`https://wa.me/${provider.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-deep-green font-medium"
              >
                <MessageCircle size={12} />
                WhatsApp
              </a>
            )}
          </div>
        </section>

        {/* Reviews */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider">
              Avis ({service.review_count})
            </h3>
            <div className="flex items-center gap-1">
              <Star size={13} className="fill-[#F5A623] text-[#F5A623]" />
              <span className="text-sm font-semibold text-charcoal">{formatRating(service.avg_rating)}</span>
            </div>
          </div>

          <div className="space-y-4">
            {MOCK_REVIEWS.map((review) => (
              <div key={review.id} className="bg-surface rounded-2xl p-4 space-y-2 shadow-card">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden flex-none">
                    <Image src={review.avatar} alt={review.tourist} fill className="object-cover" sizes="32px" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-charcoal">{review.tourist}</p>
                    <p className="text-xs text-stone">{review.date}</p>
                  </div>
                  <div className="flex">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} size={11} className="fill-[#F5A623] text-[#F5A623]" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-charcoal-soft leading-relaxed">{review.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Other services by same provider */}
        {relatedServices.length > 0 && (
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider mb-3">
              Autres services de {provider.business_name}
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {relatedServices.map((s) => (
                <ServiceCard key={s.id} service={s} size="sm" />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 inset-x-0 md:relative md:bottom-auto md:mt-4 bg-coconut/95 backdrop-blur-md border-t border-mist p-4 pb-safe z-40">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div>
            <p className="text-xs text-stone">À partir de</p>
            <p className="text-xl font-semibold text-charcoal">{formatPrice(service.price_cents)}</p>
          </div>
          <Link href={`/reserver/${service.id}`} className="flex-1">
            <Button variant="coral" fullWidth size="lg">
              Réserver
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
