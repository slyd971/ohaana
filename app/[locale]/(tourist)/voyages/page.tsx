'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Link } from '@/lib/i18n/navigation'
import { CalendarDays, Clock, Plus, Users } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ServiceCard } from '@/components/service/ServiceCard'
import { loadServicesByIds } from '@/app/actions/catalogue'
import { useFavorites } from '@/hooks/useFavorites'
import { useMyBookings, type BookingItem } from '@/hooks/useMyBookings'
import type { ServiceView } from '@/lib/data/types'
import { cn } from '@/lib/utils'
import { ConfirmButton } from '@/components/ui/ConfirmButton'
import { useFormat } from '@/hooks/useFormat'
import { toLang } from '@/lib/i18n/format'

type Tab = 'programme' | 'past' | 'favorites'

const STATUS_VARIANT = {
  confirmed: 'green' as const,
  pending: 'stone' as const,
  completed: 'default' as const,
  cancelled: 'stone' as const,
}
const STATUS_KEY = { confirmed: 'statusConfirmed', pending: 'statusPending', completed: 'statusCompleted', cancelled: 'statusCancelled' } as const

const ISLAND_LABELS: Record<string, string> = {
  guadeloupe: 'Guadeloupe', martinique: 'Martinique', saint_martin: 'Saint-Martin', saint_barth: 'Saint-Barth',
}

function parseLocalDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// ── Carnet de voyage ──────────────────────────────────────────────────────────

function CarnetView({ bookings, onCancel }: { bookings: BookingItem[]; onCancel: (id: string) => void }) {
  const t = useTranslations('trips')
  const fmt = useFormat()
  const lang = toLang(useLocale())
  // The trip is derived from the bookings themselves (first → last experience).
  const dates = bookings.map((b) => b.date).filter(Boolean).sort()
  const start = dates.length ? parseLocalDate(dates[0]) : new Date()
  const end = dates.length ? parseLocalDate(dates[dates.length - 1]) : new Date()
  const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000))
  const total = bookings.reduce((sum, b) => sum + b.totalCents, 0)
  const destination = ISLAND_LABELS[bookings[0]?.island ?? ''] ?? t('destinationFallback')

  return (
    <div className="space-y-5">
      <div className="rounded-card p-5 space-y-4" style={{ background: 'linear-gradient(135deg, var(--deep-green) 0%, #0F2B1D 100%)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-coconut/50 text-xs uppercase tracking-widest">{t('myStay')}</p>
            <h2 className="text-coconut font-display text-xl mt-0.5">{destination}</h2>
            <p className="text-coconut/70 text-sm mt-1.5 flex items-center gap-1.5">
              <CalendarDays size={13} />
              {fmt.date(start, { day: 'numeric', month: 'long' })} – {fmt.date(end, { day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-coconut/50 text-xs">{t('experiences', { count: bookings.length })}</p>
            <p className="text-coconut font-semibold text-sm mt-0.5">{fmt.price(total)}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex gap-1">
            {Array.from({ length: nights + 1 }).map((_, i) => {
              const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
              const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
              return <div key={i} className={cn('h-1.5 flex-1 rounded-full', bookings.some((b) => b.date === iso) ? 'bg-turquoise' : 'bg-coconut/20')} />
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => {
          const statusInfo = { label: t(STATUS_KEY[booking.status]), variant: STATUS_VARIANT[booking.status] }
          return (
            <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-[11px] font-semibold text-stone uppercase tracking-wider mb-2 px-1">{booking.date ? fmt.date(parseLocalDate(booking.date), { weekday: 'short', day: 'numeric', month: 'long' }) : ''}</p>
              <div className="bg-surface rounded-card overflow-hidden border border-mist shadow-card">
                <div className="flex gap-3 p-3">
                  <div className="relative w-20 h-20 rounded-control overflow-hidden flex-none bg-sand">
                    {booking.coverUrl && <Image src={booking.coverUrl} alt={booking.title[lang]} fill className="object-cover" sizes="80px" />}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-charcoal leading-snug line-clamp-2">{booking.title[lang]}</h3>
                      <Badge variant={statusInfo.variant} className="flex-none text-xs">{statusInfo.label}</Badge>
                    </div>
                    {booking.providerName && <p className="text-xs text-stone">{booking.providerName}</p>}
                    <div className="flex items-center gap-3 text-xs text-stone">
                      <span className="flex items-center gap-1"><Clock size={11} />{booking.time}</span>
                      <span className="flex items-center gap-1"><Users size={11} />{t('guestsShort', { count: booking.guests })}</span>
                      <span className="font-medium text-charcoal">{fmt.price(booking.totalCents)}</span>
                    </div>
                  </div>
                </div>
                <div className="px-3 pb-3 flex gap-2">
                  <Link href={`/prestataires/${booking.serviceId}`} className="flex-1">
                    <Button size="sm" variant="ghost" fullWidth>{t('view')}</Button>
                  </Link>
                  <ConfirmButton
                    label={t('cancel')}
                    message={t('cancelAsk')}
                    confirmLabel={t('cancelConfirm')}
                    onConfirm={() => onCancel(booking.id)}
                    className="rounded-control border border-coral/30 px-3 py-1.5 text-sm text-coral-text hover:bg-coral/5"
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <Link href="/search">
        <button type="button" className="w-full flex items-center justify-center gap-2 rounded-card border-2 border-dashed border-mist py-5 text-sm font-medium text-stone hover:border-deep-green/40 hover:text-deep-green transition-colors">
          <Plus size={16} />
          {t('addExperience')}
        </button>
      </Link>
    </div>
  )
}

// ── Past booking card ─────────────────────────────────────────────────────────

function PastCard({ booking }: { booking: BookingItem }) {
  const t = useTranslations('trips')
  const fmt = useFormat()
  const lang = toLang(useLocale())
  const statusInfo = { label: t(STATUS_KEY[booking.status]), variant: STATUS_VARIANT[booking.status] }
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-surface rounded-card overflow-hidden shadow-card border border-mist">
      <div className="flex gap-3 p-3">
        <div className="relative w-20 h-20 rounded-control overflow-hidden flex-none bg-sand">
          {booking.coverUrl && <Image src={booking.coverUrl} alt={booking.title[lang]} fill className="object-cover" sizes="80px" />}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-charcoal leading-snug line-clamp-2">{booking.title[lang]}</h3>
            <Badge variant={statusInfo.variant} className="flex-none text-xs">{statusInfo.label}</Badge>
          </div>
          {booking.providerName && <p className="text-xs text-stone">{booking.providerName}</p>}
          <div className="flex items-center gap-3 text-xs text-stone">
            <span className="flex items-center gap-1">
              <CalendarDays size={11} />
              {booking.date ? fmt.date(parseLocalDate(booking.date), { day: 'numeric', month: 'short' }) : ''} · {booking.time}
            </span>
            <span>{t('guestsShort', { count: booking.guests })} · {fmt.price(booking.totalCents)}</span>
          </div>
        </div>
      </div>
      <div className="px-3 pb-3 flex justify-end">
        <Link href={`/prestataires/${booking.serviceId}`}>
          <Button size="sm" variant="ghost">{t('bookAgain')}</Button>
        </Link>
      </div>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function VoyagesPage() {
  const t = useTranslations('trips')
  const fmt = useFormat()
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)
  const [tab, setTab] = useState<Tab>('programme')
  const { isGuest } = useAuth()
  const { favorites, toggleFavorite } = useFavorites()
  const { items, loading, error, cancel } = useMyBookings()
  const [favServices, setFavServices] = useState<ServiceView[]>([])

  const favKey = [...favorites].sort().join(',')
  useEffect(() => {
    let active = true
    loadServicesByIds(favKey ? favKey.split(',') : []).then((list) => { if (active) setFavServices(list) })
    return () => { active = false }
  }, [favKey])

  const upcoming = items.filter((b) => b.upcoming)
  const past = items.filter((b) => !b.upcoming).reverse()

  async function handleCancel(id: string) {
    setNotice(null)
    const result = await cancel(id)
    if (!result.ok) setNotice({ ok: false, text: result.error ?? t('cancelError') })
    else if (result.refund?.kind === 'refunded') setNotice({ ok: true, text: t('cancelledRefunded', { amount: fmt.price(result.refund.cents) }) })
    else if (result.refund?.kind === 'pending') setNotice({ ok: true, text: t('cancelledPending') })
    else setNotice({ ok: true, text: t('cancelledNoRefund') })
  }

  if (isGuest) {
    return (
      <div className="min-h-screen bg-coconut pt-16 pb-24 flex flex-col items-center px-4">
        <div className="w-full max-w-sm mx-auto flex flex-col items-center text-center space-y-6 pt-20">
          <div className="w-16 h-16 rounded-full bg-mist flex items-center justify-center">
            <CalendarDays size={28} className="text-stone" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-xl text-charcoal">{t('guestTitle')}</h1>
            <p className="text-sm text-stone leading-relaxed">
              {t('guestBody')}
            </p>
          </div>
          <div className="w-full space-y-2.5">
            <Link href="/register" className="block"><Button fullWidth>{t('createAccount')}</Button></Link>
            <Link href="/login" className="block"><Button fullWidth variant="outline">{t('signIn')}</Button></Link>
          </div>
        </div>
      </div>
    )
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'programme', label: t('tabProgram') },
    { key: 'past',      label: t('tabPast') },
    { key: 'favorites', label: t('tabFavorites', { count: favorites.size }) },
  ]

  return (
    <div className="min-h-screen bg-coconut pt-16 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-2xl font-display text-charcoal">{t('title')}</h1>
        </div>

        <div className="flex px-4 border-b border-mist">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn('flex-1 py-3 text-sm font-medium transition-colors relative', tab === key ? 'text-deep-green' : 'text-stone hover:text-charcoal')}
            >
              {label}
              {tab === key && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-deep-green" />}
            </button>
          ))}
        </div>

        <div className="px-4 py-5">
          {error && <p role="alert" className="mb-4 text-sm text-coral-text">{t('loadError')}</p>}
          {notice && <p role={notice.ok ? 'status' : 'alert'} className={cn('mb-4 rounded-control px-3.5 py-2.5 text-sm', notice.ok ? 'bg-deep-green/10 text-deep-green' : 'bg-coral/10 text-coral-text')}>{notice.text}</p>}
          {loading && tab !== 'favorites' && <p className="py-10 text-center text-sm text-stone" role="status">{t('loading')}</p>}

          {!loading && tab === 'programme' && (
            upcoming.length > 0
              ? <CarnetView bookings={upcoming} onCancel={handleCancel} />
              : <EmptyState emoji="🗓️" title={t('emptyUpcomingTitle')} sub={t('emptyUpcomingSub')} href="/search" cta={t('explore')} />
          )}

          {!loading && tab === 'past' && (
            <div className="space-y-3">
              {past.length > 0
                ? past.map((b) => <PastCard key={b.id} booking={b} />)
                : <EmptyState emoji="📸" title={t('emptyPastTitle')} sub={t('emptyPastSub')} href="/search" cta={t('discover')} />}
            </div>
          )}

          {tab === 'favorites' && (
            favServices.length > 0
              ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favServices.map((s) => (
                    <ServiceCard key={s.id} service={s} isFavorite={favorites.has(s.id)} onToggleFavorite={toggleFavorite} size="lg" className="w-full" />
                  ))}
                </div>
              )
              : <EmptyState emoji="❤️" title={t('emptyFavTitle')} sub={t('emptyFavSub')} href="/search" cta={t('explore')} />
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
