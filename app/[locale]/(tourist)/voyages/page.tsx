'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Link } from '@/lib/i18n/navigation'
import { CalendarDays, Clock, Heart, Plus, Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ServiceCard } from '@/components/service/ServiceCard'
import { SERVICES } from '@/lib/data/seed'
import { formatPrice, cn } from '@/lib/utils'

// Replace with real auth check when Supabase is wired
const isGuest = false

type Tab = 'programme' | 'past' | 'favorites'

type BookingBase = { id: string; serviceId: string; date: string; time: string; guests: number; total: number }
type ActiveBooking = BookingBase & { status: 'confirmed' | 'pending' }
type PastBooking   = BookingBase & { status: 'completed' }

// Local-time dates to avoid UTC offset issues
const TRIP = {
  destination: 'Guadeloupe',
  start: new Date(2026, 7, 8),   // Aug 8
  end:   new Date(2026, 7, 15),  // Aug 15
}

const UPCOMING_BOOKINGS: ActiveBooking[] = [
  { id: 'b-1', serviceId: 's-1', date: '2026-08-09', time: '17:00', guests: 2, total: 50000, status: 'confirmed' },
  { id: 'b-2', serviceId: 's-3', date: '2026-08-11', time: '10:00', guests: 4, total: 72000, status: 'pending'   },
  { id: 'b-3', serviceId: 's-2', date: '2026-08-13', time: '11:00', guests: 2, total: 19000, status: 'confirmed' },
]

const PAST_BOOKINGS: PastBooking[] = [
  { id: 'b-4', serviceId: 's-7', date: '2026-06-20', time: '10:00', guests: 1, total: 12000, status: 'completed' },
  { id: 'b-5', serviceId: 's-4', date: '2026-06-10', time: '15:00', guests: 2, total: 19000, status: 'completed' },
]

const STATUS_LABELS = {
  confirmed: { label: 'Confirmé',   variant: 'green'   as const },
  pending:   { label: 'En attente', variant: 'stone'   as const },
  completed: { label: 'Terminé',    variant: 'default' as const },
}

const MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
const DAYS_FR   = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']

function parseLocalDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function fmtDateLong(iso: string) {
  const d = parseLocalDate(iso)
  return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`
}

function fmtDateShort(d: Date) {
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]}`
}

// ── Carnet de voyage ──────────────────────────────────────────────────────────

function CarnetView({ bookings }: { bookings: ActiveBooking[] }) {
  const nights = Math.round((TRIP.end.getTime() - TRIP.start.getTime()) / 86400000)
  const total  = bookings.reduce((s, b) => s + b.total, 0)

  return (
    <div className="space-y-5">

      {/* Trip header */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: 'linear-gradient(135deg, var(--deep-green) 0%, #0F2B1D 100%)' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-coconut/50 text-[10px] uppercase tracking-widest">Mon séjour</p>
            <h2 className="text-coconut font-display text-xl mt-0.5">{TRIP.destination}</h2>
            <p className="text-coconut/70 text-sm mt-1.5 flex items-center gap-1.5">
              <CalendarDays size={13} />
              {fmtDateShort(TRIP.start)} – {fmtDateShort(TRIP.end)} · {nights} nuits
            </p>
          </div>
          <div className="text-right">
            <p className="text-coconut/50 text-[10px]">{bookings.length} expérience{bookings.length > 1 ? 's' : ''}</p>
            <p className="text-coconut font-semibold text-sm mt-0.5">{formatPrice(total)}</p>
          </div>
        </div>

        {/* Day progress — turquoise = booked */}
        <div className="space-y-1.5">
          <div className="flex gap-1">
            {Array.from({ length: nights }).map((_, i) => {
              const d = new Date(TRIP.start.getFullYear(), TRIP.start.getMonth(), TRIP.start.getDate() + i + 1)
              const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
              const booked = bookings.some(b => b.date === iso)
              return (
                <div
                  key={i}
                  className={cn('h-1.5 flex-1 rounded-full', booked ? 'bg-turquoise' : 'bg-coconut/20')}
                />
              )
            })}
          </div>
          <p className="text-coconut/40 text-[10px]">
            {nights - bookings.length} jour{nights - bookings.length > 1 ? 's' : ''} sans expérience planifiée
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {bookings.map((booking) => {
          const service = SERVICES.find(s => s.id === booking.serviceId)
          if (!service) return null
          const cover = service.images.find(i => i.is_cover) ?? service.images[0]
          const statusInfo = STATUS_LABELS[booking.status]

          return (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-[11px] font-semibold text-stone uppercase tracking-wider mb-2 px-1">
                {fmtDateLong(booking.date)}
              </p>
              <div className="bg-surface rounded-2xl overflow-hidden border border-mist shadow-card">
                <div className="flex gap-3 p-3">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-none">
                    <Image src={cover?.url ?? ''} alt={service.title_fr} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-charcoal leading-snug line-clamp-2">{service.title_fr}</h3>
                      <Badge variant={statusInfo.variant} className="flex-none text-[10px]">{statusInfo.label}</Badge>
                    </div>
                    <p className="text-xs text-stone">{service.provider.business_name}</p>
                    <div className="flex items-center gap-3 text-xs text-stone">
                      <span className="flex items-center gap-1"><Clock size={11} />{booking.time}</span>
                      <span className="flex items-center gap-1"><Users size={11} />{booking.guests} pers.</span>
                      <span className="font-medium text-charcoal">{formatPrice(booking.total)}</span>
                    </div>
                  </div>
                </div>
                <div className="px-3 pb-3 flex gap-2">
                  <Link href={`/prestataires/${service.id}`} className="flex-1">
                    <Button size="sm" variant="ghost" fullWidth>Voir</Button>
                  </Link>
                  {booking.status === 'confirmed' && (
                    <Button size="sm" variant="outline" className="text-coral border-coral/30 hover:bg-coral/5">Annuler</Button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Add CTA */}
      <Link href="/search">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-mist py-5 text-sm font-medium text-stone hover:border-deep-green/40 hover:text-deep-green transition-colors"
        >
          <Plus size={16} />
          Ajouter une expérience
        </button>
      </Link>
    </div>
  )
}

// ── Past booking card ─────────────────────────────────────────────────────────

function PastCard({ booking }: { booking: PastBooking }) {
  const service = SERVICES.find(s => s.id === booking.serviceId)
  if (!service) return null
  const cover = service.images.find(i => i.is_cover) ?? service.images[0]

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
          <h3 className="text-sm font-medium text-charcoal leading-snug line-clamp-2">{service.title_fr}</h3>
          <p className="text-xs text-stone">{service.provider.business_name}</p>
          <div className="flex items-center gap-3 text-xs text-stone">
            <span className="flex items-center gap-1">
              <CalendarDays size={11} />
              {parseLocalDate(booking.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · {booking.time}
            </span>
            <span>{booking.guests} pers. · {formatPrice(booking.total)}</span>
          </div>
        </div>
      </div>
      <div className="px-3 pb-3 flex justify-end">
        <Link href={`/prestataires/${service.id}`}>
          <Button size="sm" variant="ghost">Réserver à nouveau</Button>
        </Link>
      </div>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function VoyagesPage() {
  const [tab, setTab] = useState<Tab>('programme')
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['s-3', 's-2']))

  if (isGuest) {
    return (
      <div className="min-h-screen bg-coconut pt-16 pb-24 flex flex-col items-center px-4">
        <div className="w-full max-w-sm mx-auto flex flex-col items-center text-center space-y-6 pt-20">
          <div className="w-16 h-16 rounded-full bg-mist flex items-center justify-center">
            <CalendarDays size={28} className="text-stone" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-xl text-charcoal">Vos voyages vous attendent</h1>
            <p className="text-sm text-stone leading-relaxed">
              Connectez-vous pour retrouver vos réservations, consulter vos confirmations et gérer vos favoris.
            </p>
          </div>
          <div className="w-full space-y-2.5">
            <Link href="/register" className="block">
              <Button fullWidth>Créer un compte</Button>
            </Link>
            <Link href="/login" className="block">
              <Button fullWidth variant="outline">Se connecter</Button>
            </Link>
          </div>
          <p className="text-xs text-stone">
            Vous avez déjà une réservation ?{' '}
            <Link href="/login" className="text-deep-green underline underline-offset-2">
              Connectez-vous pour la retrouver.
            </Link>
          </p>
        </div>
      </div>
    )
  }

  function toggleFav(id: string) {
    setFavorites(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const favServices = SERVICES.filter(s => favorites.has(s.id))

  const TABS: { key: Tab; label: string }[] = [
    { key: 'programme', label: 'Programme'            },
    { key: 'past',      label: 'Passées'              },
    { key: 'favorites', label: `Favoris (${favorites.size})` },
  ]

  return (
    <div className="min-h-screen bg-coconut pt-16 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-2xl font-display text-charcoal">Mes voyages</h1>
        </div>

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

        <div className="px-4 py-5">
          {tab === 'programme' && (
            UPCOMING_BOOKINGS.length > 0
              ? <CarnetView bookings={UPCOMING_BOOKINGS} />
              : <EmptyState emoji="🗓️" title="Aucune expérience prévue" sub="Composez votre programme de séjour" href="/search" cta="Explorer" />
          )}

          {tab === 'past' && (
            <div className="space-y-3">
              {PAST_BOOKINGS.length > 0
                ? PAST_BOOKINGS.map(b => <PastCard key={b.id} booking={b} />)
                : <EmptyState emoji="📸" title="Aucune réservation passée" sub="Votre prochain souvenir vous attend" href="/search" cta="Découvrir" />
              }
            </div>
          )}

          {tab === 'favorites' && (
            favServices.length > 0
              ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favServices.map(s => (
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
