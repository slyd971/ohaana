'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Link } from '@/lib/i18n/navigation'
import { Calendar, Star, Clock, Heart } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ServiceCard } from '@/components/service/ServiceCard'
import { SERVICES } from '@/lib/data/seed'
import { formatPrice, formatRating, cn } from '@/lib/utils'

type Tab = 'upcoming' | 'past' | 'favorites'

type BookingBase = { id: string; serviceId: string; date: string; time: string; guests: number; total: number }
type ActiveBooking = BookingBase & { status: 'confirmed' | 'pending'; rating?: never }
type PastBooking   = BookingBase & { status: 'completed'; rating?: number }
type AnyBooking    = ActiveBooking | PastBooking

// Mock bookings data
const UPCOMING_BOOKINGS: ActiveBooking[] = [
  { id: 'b-1', serviceId: 's-3', date: '2025-07-15', time: '17:00', guests: 2, total: 50000, status: 'confirmed' },
  { id: 'b-2', serviceId: 's-1', date: '2025-07-18', time: '19:30', guests: 4, total: 72000, status: 'pending' },
]

const PAST_BOOKINGS: PastBooking[] = [
  { id: 'b-3', serviceId: 's-2', date: '2025-06-20', time: '10:00', guests: 1, total: 12000, status: 'completed', rating: 5 },
  { id: 'b-4', serviceId: 's-7', date: '2025-06-10', time: '15:00', guests: 2, total: 19000, status: 'completed', rating: 5 },
]

const STATUS_LABELS = {
  confirmed: { label: 'Confirmé', variant: 'green' as const },
  pending:   { label: 'En attente', variant: 'stone' as const },
  completed: { label: 'Terminé', variant: 'default' as const },
}

function BookingCard({ booking }: { booking: AnyBooking }) {
  const service = SERVICES.find((s) => s.id === booking.serviceId)
  if (!service) return null

  const cover = service.images.find((i) => i.is_cover) ?? service.images[0]
  const statusInfo = STATUS_LABELS[booking.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-2xl overflow-hidden shadow-card border border-mist"
    >
      <div className="flex gap-3 p-3">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-none">
          <Image src={cover?.url ?? ''} alt={service.title_fr} fill className="object-cover" sizes="80px" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-charcoal leading-snug line-clamp-2">{service.title_fr}</h3>
            <Badge variant={statusInfo.variant} className="flex-none text-[10px]">{statusInfo.label}</Badge>
          </div>
          <p className="text-xs text-stone">{service.provider.business_name}</p>
          <div className="flex items-center gap-3 text-xs text-stone">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {new Date(booking.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · {booking.time}
            </span>
            <span>{booking.guests} pers. · {formatPrice(booking.total)}</span>
          </div>
        </div>
      </div>

      {booking.status === 'completed' && (
        <div className="px-3 pb-3 flex items-center justify-between">
          {booking.rating ? (
            <div className="flex items-center gap-1">
              {Array.from({ length: booking.rating }).map((_, i) => (
                <Star key={i} size={12} className="fill-[#F5A623] text-[#F5A623]" />
              ))}
              <span className="text-xs text-stone ml-1">Votre avis</span>
            </div>
          ) : (
            <Button size="sm" variant="outline">Laisser un avis</Button>
          )}
          <Link href={`/prestataires/${service.id}`}>
            <Button size="sm" variant="ghost">Réserver à nouveau</Button>
          </Link>
        </div>
      )}

      {booking.status !== 'completed' && (
        <div className="px-3 pb-3 flex gap-2">
          <Link href={`/prestataires/${service.id}`} className="flex-1">
            <Button size="sm" variant="ghost" fullWidth>Voir</Button>
          </Link>
          {booking.status === 'confirmed' && (
            <Button size="sm" variant="outline" className="text-coral border-coral/30 hover:bg-coral/5">Annuler</Button>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default function VoyagesPage() {
  const [tab, setTab] = useState<Tab>('upcoming')
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['s-3', 's-2']))

  function toggleFav(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const favServices = SERVICES.filter((s) => favorites.has(s.id))

  const TABS: { key: Tab; label: string }[] = [
    { key: 'upcoming',  label: 'À venir' },
    { key: 'past',      label: 'Passées' },
    { key: 'favorites', label: `Favoris (${favorites.size})` },
  ]

  return (
    <div className="min-h-screen bg-coconut pt-16">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-2xl font-display text-charcoal">Mes voyages</h1>
        </div>

        {/* Tabs */}
        <div className="flex px-4 border-b border-mist">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'flex-1 py-3 text-sm font-medium transition-colors relative',
                tab === key ? 'text-deep-green' : 'text-stone hover:text-charcoal'
              )}
            >
              {label}
              {tab === key && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-deep-green" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-4 py-5 space-y-3">
          {tab === 'upcoming' && (
            UPCOMING_BOOKINGS.length > 0
              ? UPCOMING_BOOKINGS.map((b) => <BookingCard key={b.id} booking={b} />)
              : <EmptyState emoji="🗓️" title="Aucune réservation à venir" sub="Explorez les expériences disponibles" href="/search" cta="Explorer" />
          )}

          {tab === 'past' && (
            PAST_BOOKINGS.length > 0
              ? PAST_BOOKINGS.map((b) => <BookingCard key={b.id} booking={b} />)
              : <EmptyState emoji="📸" title="Aucune réservation passée" sub="Votre prochain souvenir vous attend" href="/search" cta="Découvrir" />
          )}

          {tab === 'favorites' && (
            favServices.length > 0
              ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favServices.map((s) => (
                    <ServiceCard
                      key={s.id}
                      service={s}
                      isFavorite={favorites.has(s.id)}
                      onToggleFavorite={toggleFav}
                      size="lg"
                      className="w-full"
                    />
                  ))}
                </div>
              )
              : <EmptyState emoji="❤️" title="Aucun favori pour l'instant" sub="Appuyez sur ♡ pour sauvegarder des expériences" href="/search" cta="Explorer" />
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ emoji, title, sub, href, cta }: {
  emoji: string; title: string; sub: string; href: string; cta: string
}) {
  return (
    <div className="text-center py-16 space-y-3">
      <p className="text-4xl">{emoji}</p>
      <p className="font-medium text-charcoal">{title}</p>
      <p className="text-sm text-stone">{sub}</p>
      <Link href={href}>
        <Button variant="outline" className="mt-2">{cta}</Button>
      </Link>
    </div>
  )
}
