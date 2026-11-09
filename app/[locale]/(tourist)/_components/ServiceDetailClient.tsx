'use client'

import { useState, useEffect, useRef, useMemo, useSyncExternalStore } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Link } from '@/lib/i18n/navigation'
import {
  Clock,
  Users,
  MapPin,
  Heart,
  Globe,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2, Star,
  CalendarDays,
  Circle,
  Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { ServiceCard } from '@/components/service/ServiceCard'
import type { ReviewView, ServiceView, SlotView } from '@/lib/data/types'
import { cn } from '@/lib/utils'
import { useFormat } from '@/hooks/useFormat'
import type { Lang } from '@/lib/i18n/format'

const LANG_FLAGS: Record<string, string> = { fr: '🇫🇷', en: '🇬🇧', es: '🇪🇸', de: '🇩🇪', kr: '🏝️' }

const INCLUDED_KEYS = ['incTravel', 'incSupport', 'incSecure'] as const


type DayStatus = 'available' | 'full'

interface AvailabilityDay {
  isoDate: string
  day: string
  date: string
  slots: { id: string; time: string; status: 'available' }[]
}

function dayStatus(slots: { status: string }[]): DayStatus {
  return slots.length > 0 ? 'available' : 'full'
}

const isoOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** Real availability: only slots the database reports as free (public_slot_availability). */
function buildAvailability(slots: SlotView[], start: Date | null, end: Date | null, dayLabel: (dow: number) => string): AvailabilityDay[] {
  const byDate = new Map<string, SlotView[]>()
  for (const slot of slots) byDate.set(slot.date, [...(byDate.get(slot.date) ?? []), slot])

  const today = new Date()
  const from = start ?? new Date(today.getTime() + 86400000)
  const to = end ?? new Date(from.getTime() + 13 * 86400000)
  const days: AvailabilityDay[] = []
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  while (cursor <= to && days.length < 60) {
    const iso = isoOf(cursor)
    days.push({
      isoDate: iso,
      day: dayLabel(cursor.getDay()),
      date: String(cursor.getDate()),
      slots: (byDate.get(iso) ?? []).map((sl) => ({ id: sl.id, time: sl.start_time.slice(0, 5), status: 'available' as const })),
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

const fmtSlot = (t: string) => t.slice(0, 2).replace(/^0/, '') + 'h' + (t.slice(3) !== '00' ? t.slice(3) : '')

const STATUS_ICON = {
  available: CheckCircle2,
  full: Circle,
}

// One offering = the service itself, at its real price (no invented variants).
function getOfferings(service: ServiceView, lang: Lang, duration: string, t: (key: 'incTravel' | 'incCoordination') => string) {
  return [
    {
      id: 'classic',
      title: lang === 'en' ? service.title_en : lang === 'es' ? service.title_es : service.title_fr,
      duration,
      price: service.price_cents,
      description: lang === 'en' ? service.description_en : lang === 'es' ? service.description_es : service.description_fr,
      includes: [t('incTravel'), t('incCoordination')],
    },
  ]
}

function islandLabel(island: string) {
  const labels: Record<string, string> = {
    guadeloupe: 'Guadeloupe',
    martinique: 'Martinique',
    saint_martin: 'Saint-Martin',
    saint_barth: 'Saint-Barth',
  }
  return labels[island] ?? island
}

// ── Location autocomplete ─────────────────────────────────────────────────────

const LOCATION_OPTIONS = [
  { value: 'guadeloupe',   label: 'Guadeloupe' },
  { value: 'martinique',   label: 'Martinique' },
  { value: 'saint_martin', label: 'Saint-Martin' },
  { value: 'saint_barth',  label: 'Saint-Barth' },
]

function LocationAutocomplete({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = value.trim()
    ? LOCATION_OPTIONS.filter((o) => o.label.toLowerCase().startsWith(value.toLowerCase()))
    : LOCATION_OPTIONS

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-deep-green pointer-events-none" />
        <input
          type="text"
          value={value}
          placeholder={useTranslations('serviceDetail')('stayPlace')}
          onChange={(e) => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          className={cn(
            'w-full h-11 rounded-control border bg-coconut pl-8 pr-3 text-sm text-charcoal placeholder:text-stone focus:outline-none transition-colors',
            open ? 'border-deep-green ring-2 ring-deep-green/15' : 'border-mist',
          )}
        />
      </div>

      {open && filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-1.5 bg-surface rounded-control border border-mist shadow-elevated overflow-hidden z-50"
        >
          {filtered.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(opt.label); setOpen(false) }}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors hover:bg-sand',
                value === opt.label ? 'text-deep-green font-medium bg-sand' : 'text-charcoal',
              )}
            >
              <MapPin size={12} className="text-stone flex-none" />
              {opt.label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}

const subscribeNoop = () => () => {}

const ISLAND_LABELS: Record<string, string> = {
  guadeloupe: 'Guadeloupe',
  martinique: 'Martinique',
  saint_martin: 'Saint-Martin',
  saint_barth: 'Saint-Barth',
}

function readStaySession(): string {
  try {
    return JSON.stringify({
      island: sessionStorage.getItem('ohaana_island'),
      start: sessionStorage.getItem('ohaana_stay_start'),
      end: sessionStorage.getItem('ohaana_stay_end'),
    })
  } catch {
    return '{}'
  }
}

function parseStaySession(raw: string): { location: string; start: Date | null; end: Date | null } {
  const o = JSON.parse(raw) as { island?: string | null; start?: string | null; end?: string | null }
  const toDate = (v?: string | null) => {
    if (!v) return null
    const d = new Date(v)
    return isNaN(d.getTime()) ? null : d
  }
  return {
    location: o.island && o.island !== 'all' ? (ISLAND_LABELS[o.island] ?? '') : '',
    start: toDate(o.start),
    end: toDate(o.end),
  }
}

interface ServiceDetailClientProps {
  service: ServiceView
  slots: SlotView[]
  reviews: ReviewView[]
  related: ServiceView[]
  complements: ServiceView[]
}

export function ServiceDetailClient({ service, slots, reviews, related, complements }: ServiceDetailClientProps) {
  const locale = useLocale()
  const t = useTranslations('serviceDetail')
  const ts = useTranslations('service')
  const fmt = useFormat()
  const lang = fmt.lang
  const altOf = (img: { alt_fr: string | null; alt_en: string | null; alt_es: string | null }) =>
    (lang === 'en' ? img.alt_en : lang === 'es' ? img.alt_es : img.alt_fr) ?? img.alt_fr ?? ''

  const svcTitle = locale === 'es'
    ? service.title_es
    : locale === 'en' ? service.title_en : service.title_fr
  const svcDesc = locale === 'es'
    ? service.description_es
    : locale === 'en' ? service.description_en : service.description_fr

  const [imgIndex, setImgIndex] = useState(0)
  const [isFav, setIsFav] = useState(false)
  const [stickyVisible, setStickyVisible] = useState(false)
  // Stay dates + island pre-filled from sessionStorage (external store → no setState in effect).
  const sessionRaw = useSyncExternalStore(subscribeNoop, readStaySession, () => '{}')
  const saved = useMemo(() => parseStaySession(sessionRaw), [sessionRaw])
  const [stayStartOverride, setStayStart] = useState<Date | null | undefined>(undefined)
  const [stayEndOverride, setStayEnd] = useState<Date | null | undefined>(undefined)
  const [locationOverride, setLocation] = useState<string | undefined>(undefined)
  const stayStart = stayStartOverride === undefined ? saved.start : stayStartOverride
  const stayEnd = stayEndOverride === undefined ? saved.end : stayEndOverride
  const location = locationOverride ?? saved.location
  const [selectedSlot, setSelectedSlot] = useState<{ id: string; isoDate: string; day: string; date: string; time: string } | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const availability = useMemo(() => buildAvailability(slots, stayStart, stayEnd, (dow) => fmt.weekdayShort(dow)), [slots, stayStart, stayEnd, fmt])

  const offerings = getOfferings(service, lang, service.duration_min ? fmt.duration(service.duration_min) : t('customDuration'), t)
  const [selectedOffering, setSelectedOffering] = useState(offerings[0]?.id)
  const selected = offerings.find((offering) => offering.id === selectedOffering) ?? offerings[0]

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 380)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const relatedServices = related

  const { provider, images } = service

  return (
    <div className="bg-coconut pb-36 md:pb-8 md:pt-16">

      {/* Sticky header — apparaît après le hero */}
      <motion.div
        initial={false}
        animate={{ y: stickyVisible ? 0 : -72, opacity: stickyVisible ? 1 : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed top-0 inset-x-0 z-50 bg-coconut/95 backdrop-blur-md border-b border-mist md:hidden"
      >
        <div className="max-w-2xl mx-auto px-4 min-h-16 py-2 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-charcoal line-clamp-2 leading-tight">{svcTitle}</p>
            <p className="text-xs text-stone mt-0.5">{t('perPersonPrice', { price: fmt.price(selected?.price ?? service.price_cents) })}</p>
          </div>
          <Link href={`/reserver/${service.id}?offer=${selected?.id ?? 'classic'}`}>
            <Button variant="primary" size="sm">
              {t('chooseSlot')}
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* ── Mobile hero ─────────────────────────────────────────────────────── */}
      <div className="relative h-[300px] md:hidden bg-charcoal">
        {images.map((img, i) => (
          <motion.div key={img.id} className="absolute inset-0" initial={false}
            animate={{ opacity: i === imgIndex ? 1 : 0 }} transition={{ duration: 0.4 }}>
            <Image src={img.url} alt={altOf(img)} fill className="object-cover object-center" priority={i === 0} sizes="100vw" />
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
        <Link href="/search" aria-label={t('backToResults')} className="absolute top-4 left-4 p-2 rounded-full bg-black/35 backdrop-blur-sm text-white hover:bg-black/55 transition-colors z-10">
          <ChevronLeft size={20} />
        </Link>
        <button type="button" onClick={() => setIsFav((v) => !v)} aria-pressed={isFav} aria-label={isFav ? ts('removeFavorite') : ts('addFavorite')}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/35 backdrop-blur-sm hover:bg-black/55 transition-colors z-10">
          <Heart size={20} className={cn(isFav ? 'fill-coral text-coral-text' : 'text-white fill-transparent')} />
        </button>
        {images.length > 1 && (
          <>
            <button type="button" aria-label={t('prevPhoto')} onClick={() => setImgIndex((i) => Math.max(0, i - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white disabled:opacity-0 transition-opacity"
              disabled={imgIndex === 0}><ChevronLeft size={18} /></button>
            <button type="button" aria-label={t('nextPhoto')} onClick={() => setImgIndex((i) => Math.min(images.length - 1, i + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white disabled:opacity-0 transition-opacity"
              disabled={imgIndex === images.length - 1}><ChevronRight size={18} /></button>
          </>
        )}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 flex items-end gap-4">
          <div className="relative w-16 h-16 rounded-card overflow-hidden border-2 border-white/80 shadow-lg flex-none">
            {provider.user.avatar_url ? (
              <Image src={provider.user.avatar_url} alt={provider.user.full_name ?? provider.business_name} fill className="object-cover" sizes="64px" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-deep-green text-coconut font-semibold">{provider.business_name.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0 pb-0.5">
            <h1 className="text-2xl font-display text-white leading-tight drop-shadow-sm line-clamp-3">{svcTitle}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium text-white/90 truncate">{provider.business_name}</span>
              <span className="text-white/40">·</span>
              {provider.languages.map((l) => <span key={l} className="text-sm">{LANG_FLAGS[l] ?? l}</span>)}
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-1.5 pb-1 shrink-0">
              {images.map((_, i) => (
                <button key={i} type="button" onClick={() => setImgIndex(i)} aria-label={t('goToPhoto', { n: i + 1 })} aria-current={i === imgIndex}
                  className="flex h-6 min-w-6 items-center justify-center"><span className={cn('block h-1.5 rounded-full transition-all', i === imgIndex ? 'bg-white w-4' : 'bg-white/50 w-1.5')} /></button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8">

        {/* ── Desktop title row — au-dessus des photos ──────── */}
        <div className="hidden md:block pt-7 pb-5">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            {provider.is_approved && (
              <Badge variant="green" className="gap-1">
                <ShieldCheck size={12} />
                {t('validated')}
              </Badge>
            )}
            <span className="text-sm text-stone">
              {t('organisedBy', { name: provider.business_name })}
              {' · '}
              {provider.languages.map((l) => LANG_FLAGS[l] ?? l).join(' ')}
            </span>
            <button
              type="button"
              onClick={() => setIsFav((v) => !v)}
              className="ml-auto flex items-center gap-1.5 text-sm text-stone hover:text-charcoal transition-colors"
            >
              <Heart size={15} className={cn(isFav ? 'fill-coral text-coral-text' : '')} />
              {isFav ? ts('removeFavorite') : ts('addFavorite')}
            </button>
          </div>
          <h1 className="text-3xl font-display text-charcoal leading-tight mb-3">{svcTitle}</h1>
          <div className="flex items-center gap-5 text-sm text-stone">
            {service.duration_min && (
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-deep-green" />
                {fmt.duration(service.duration_min)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users size={13} className="text-deep-green" />
              {service.capacity_min === service.capacity_max
                ? `${service.capacity_max} pers.`
                : `${service.capacity_min}–${service.capacity_max} pers.`}
            </span>
            {service.address && (
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-deep-green" />
                {islandLabel(service.island)}
              </span>
            )}
          </div>
        </div>

        <div className="md:flex md:gap-10 md:items-start">
        {/* ── Colonne gauche ─────────────────────────────── */}
        <div className="md:flex-1 md:min-w-0">

        {/* Desktop photo grid — style GYG (1 grande + 2×2) */}
        <div
          className="hidden md:grid grid-rows-2 grid-flow-col gap-1.5 h-[400px] rounded-card overflow-hidden mb-8"
          style={{ gridTemplateColumns: '1.8fr 1fr 1fr' }}
        >
          <div className="row-span-2 relative overflow-hidden">
            <Image src={images[0].url} alt={altOf(images[0])} fill className="object-cover" sizes="55vw" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            <Link href="/search" aria-label={t('backToResults')} className="absolute top-4 left-4 p-2 rounded-full bg-black/35 backdrop-blur-sm text-white hover:bg-black/55 transition-colors z-10">
              <ChevronLeft size={20} />
            </Link>
          </div>
          {([1, 2, 3, 4] as const).map((idx) => {
            const img = images[idx] ?? images[idx % images.length]
            const isLast = idx === 4
            return (
              <div key={idx} className="relative overflow-hidden">
                {img && <Image src={img.url} alt={altOf(img)} fill className="object-cover" sizes="20vw" />}
                {!img && <div className="absolute inset-0 bg-stone/20" />}
                {isLast && <div className="absolute inset-0 bg-black/25" />}
                {isLast && (
                  <button type="button" className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-charcoal text-xs font-medium px-3 py-1.5 rounded-full shadow-sm hover:bg-coconut transition-colors">
                    {t('seeAll')}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Badges/stats — mobile uniquement (desktop : voir titre au-dessus) */}
        <div className="space-y-3 mb-5 pt-5 md:hidden">
          <div className="flex flex-wrap gap-2">
            {provider.is_approved && (
              <Badge variant="green" className="gap-1">
                <ShieldCheck size={12} />
                {t('validated')}
              </Badge>
            )}
            {service.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="green">{tag}</Badge>
            ))}
          </div>

          <div className="flex items-center gap-5 text-sm text-stone">
            {service.duration_min && (
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-deep-green" />
                {fmt.duration(service.duration_min)}
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
                {islandLabel(service.island)}
              </span>
            )}
          </div>
        </div>

        {/* Service menu */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-charcoal uppercase tracking-wider mb-3">Prestations disponibles</h2>
          <div className="space-y-3">
            {offerings.map((offering, idx) => {
              const isSelected = selectedOffering === offering.id
              const isRecommended = idx === 1
              return (
                <button
                  key={offering.id}
                  type="button"
                  onClick={() => setSelectedOffering(offering.id)}
                  className={cn(
                    'w-full text-left rounded-card border p-4 transition-all',
                    isSelected
                      ? 'border-deep-green bg-deep-green/4 shadow-sm'
                      : 'border-mist bg-surface hover:border-deep-green/40 hover:bg-sand/40'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-charcoal">{offering.title}</h3>
                        {isRecommended && (
                          <span className="inline-flex items-center text-xs font-semibold text-deep-green bg-turquoise/15 border border-turquoise/25 px-1.5 py-0.5 rounded-full">
                            {t('popular')}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-stone">{offering.duration}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-none">
                      <p className="text-sm font-semibold text-deep-green">{fmt.price(offering.price)}</p>
                      {isSelected && <CheckCircle2 size={16} className="text-deep-green flex-none" />}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-charcoal-soft leading-relaxed">{offering.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {offering.includes.map((item) => (
                      <Badge key={item} variant="stone" className="gap-1">
                        <CheckCircle2 size={11} />
                        {item}
                      </Badge>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Smart availability */}
        <section className="mb-6 bg-deep-green/6 rounded-card border border-deep-green/20 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-deep-green/8 border-b border-deep-green/15">
            <CalendarDays size={16} className="text-deep-green flex-none" />
            <h2 className="text-sm font-semibold text-deep-green uppercase tracking-wider">{t('availability')}</h2>
          </div>
          <div className="p-4 space-y-4">
          <p className="text-sm text-charcoal-soft">{t('availabilityHint')}</p>

          <div className="grid grid-cols-2 gap-2">
            <DateRangePicker
              startDate={stayStart}
              endDate={stayEnd}
              onChange={(s, e) => {
                setStayStart(s)
                setStayEnd(e)
                setSelectedSlot(null)
                setSelectedDay(null)
                try {
                  if (s) sessionStorage.setItem('ohaana_stay_start', s.toISOString())
                  else sessionStorage.removeItem('ohaana_stay_start')
                  if (e) sessionStorage.setItem('ohaana_stay_end', e.toISOString())
                  else sessionStorage.removeItem('ohaana_stay_end')
                } catch {}
              }}
            />
            <LocationAutocomplete value={location} onChange={setLocation} />
          </div>

          {/* Day chips — compact, click to expand slots */}
          <div className="grid grid-cols-4 gap-2">
            {availability.map((day) => {
              const status = dayStatus(day.slots)
              const isActive = selectedDay === day.isoDate
              const hasSelected = selectedSlot?.isoDate === day.isoDate
              return (
                <button
                  key={day.isoDate}
                  type="button"
                  onClick={() => setSelectedDay(isActive ? null : day.isoDate)}
                  className={cn(
                    'rounded-control border p-2.5 text-center transition-all',
                    isActive
                      ? 'border-deep-green bg-deep-green/5 ring-2 ring-deep-green/15'
                      : hasSelected
                      ? 'border-turquoise bg-turquoise/5'
                      : 'border-mist bg-coconut hover:border-deep-green/30'
                  )}
                >
                  <p className="text-xs uppercase text-stone">{day.day}</p>
                  <p className="text-lg font-display text-charcoal leading-tight">{day.date}</p>
                  <div className="flex justify-center mt-1.5">
                    <div className={cn('w-2 h-2 rounded-full', {
                      'bg-turquoise': status === 'available',
                      'bg-stone/40': status === 'full',
                    })} />
                  </div>
                </button>
              )
            })}
          </div>

          {/* Expanded slots for selected day */}
          {selectedDay && (() => {
            const day = availability.find(d => d.isoDate === selectedDay)
            if (!day) return null
            return (
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="rounded-card bg-sand border border-mist p-4 space-y-3"
              >
                <p className="text-xs font-semibold text-charcoal uppercase tracking-wider">
                  {t('pickSlotFor', { day: day.day, date: day.date })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {day.slots.map((slot) => {
                    const Icon = STATUS_ICON[slot.status]
                    const isSelected = selectedSlot?.isoDate === day.isoDate && selectedSlot?.time === slot.time
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(
                          isSelected ? null : { id: slot.id, isoDate: day.isoDate, day: day.day, date: day.date, time: slot.time }
                        )}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-control border px-4 py-2.5 text-sm font-medium transition-all',
                          isSelected
                            ? 'border-deep-green bg-deep-green text-white shadow-sm'
                            : 'border-turquoise/50 bg-turquoise/10 text-deep-green hover:bg-turquoise/20'
                        )}
                      >
                        <Icon size={13} />
                        {fmtSlot(slot.time)}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )
          })()}

          <div className="flex flex-wrap gap-3 text-[11px] text-stone">
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-turquoise inline-block" /> {t('legendAvailable')}</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-stone/40 inline-block" /> {t('legendFull')}</span>
          </div>
          </div>{/* fin p-4 */}
        </section>

        {/* Included */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-charcoal uppercase tracking-wider mb-3">{t('included')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INCLUDED_KEYS.map((key) => t(key)).map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-charcoal-soft">
                <CheckCircle2 size={15} className="text-turquoise-text flex-none" />
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Description */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider mb-2">{t('about')}</h3>
          <p className="text-sm text-charcoal-soft leading-relaxed">{svcDesc}</p>
        </section>

        {/* Galerie — mobile uniquement (desktop : grille au-dessus) */}
        {images.length > 1 && (
          <section className="mb-6 md:hidden">
            <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider mb-3">Galerie</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {images.slice(0, 6).map((img, i) => (
                <div
                  key={img.id}
                  className={cn(
                    'relative overflow-hidden rounded-control aspect-[4/3]',
                    i === 0 ? 'col-span-2 md:col-span-1' : ''
                  )}
                >
                  <Image
                    src={img.url}
                    alt={img.alt_fr ?? ''}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Provider bio */}
        <section className="mb-6 bg-sand rounded-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-none">
              {provider.user.avatar_url ? (
              <Image src={provider.user.avatar_url} alt={provider.user.full_name ?? provider.business_name} fill className="object-cover" sizes="40px" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-deep-green text-coconut font-semibold">{provider.business_name.charAt(0)}</span>
            )}
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
            {provider.phone && (
              <a
                href={`tel:${provider.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-1 text-xs text-deep-green font-medium"
              >
                <Phone size={12} />
                {t('contact')}
              </a>
            )}
          </div>
        </section>

        {/* Verified reviews (completed bookings only) */}
        {reviews.length > 0 && (
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider mb-3">
              {t('reviewsTitle', { count: service.review_count })}
            </h3>
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-card border border-mist bg-surface p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-charcoal">{r.author_first_name || 'Voyageur'}</span>
                    <span className="flex items-center gap-1 text-xs text-stone">
                      <Star size={12} className="fill-amber-400 text-amber-400" /> {r.rating}/5
                      <span aria-hidden>·</span>
                      {fmt.date(new Date(r.created_at), { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  {r.content && <p className="mt-2 text-sm text-charcoal-soft leading-relaxed">{r.content}</p>}
                  {r.provider_reply && (
                    <p className="mt-2 border-l-2 border-mist pl-3 text-xs text-stone">{t('providerReply', { reply: r.provider_reply })}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Often booked with */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider mb-3">
            {t('completeExperience')}
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {complements.map((s) => (
              <ServiceCard key={s.id} service={s} size="sm" />
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
        {/* Bloc concierge */}
        <section className="mb-6 rounded-card bg-deep-green text-coconut p-5 flex gap-4 items-start">
          <div className="flex-none w-10 h-10 rounded-full bg-coconut/15 flex items-center justify-center">
            <MessageCircle size={18} className="text-coconut" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold mb-0.5">{t('helpTitle')}</p>
            <p className="text-xs text-coconut/80 leading-relaxed">{t('helpBody')}</p>
          </div>
          <Link
            href="/concierge"
            className="flex-none self-center text-xs font-semibold bg-coconut text-deep-green px-4 py-2 rounded-full hover:bg-sand transition-colors whitespace-nowrap"
          >
            {t('helpCta')}
          </Link>
        </section>

        </div>{/* fin colonne gauche */}

        {/* ── Colonne droite sticky (desktop uniquement) ── */}
        <div className="hidden md:block md:w-72 md:flex-none md:self-start md:sticky md:top-24">
          <div className="rounded-3xl border border-mist bg-surface shadow-elevated p-6 space-y-5">
            {/* Prix */}
            <div>
              <p className="text-xs text-stone mb-1">{t('from')}</p>
              <p className="text-3xl font-semibold text-charcoal">{fmt.price(selected?.price ?? service.price_cents)}</p>
              <p className="text-xs text-stone">{t('perPersonTravel')}</p>
            </div>

            {/* Prestation sélectionnée */}
            {selected && (
              <div className="rounded-control border border-deep-green/20 bg-deep-green/5 px-4 py-3">
                <p className="text-xs text-stone mb-0.5">{t('selectedOffering')}</p>
                <p className="text-sm font-semibold text-charcoal">{selected.title}</p>
                <p className="text-xs text-stone mt-0.5">{selected.duration}</p>
              </div>
            )}

            {/* Créneau sélectionné */}
            {selectedSlot && (
              <div className="rounded-control border border-deep-green/20 bg-deep-green/5 px-4 py-2.5 text-xs text-deep-green font-medium">
                {selectedSlot.day} {selectedSlot.date} · {fmtSlot(selectedSlot.time)}
              </div>
            )}

            {/* CTA */}
            <Link
              href={`/reserver/${service.id}?offer=${selected?.id ?? 'classic'}${selectedSlot ? `&slot=${selectedSlot.id}&date=${selectedSlot.isoDate}&time=${selectedSlot.time}` : ''}`}
              className="block"
            >
              <Button variant="primary" fullWidth size="lg">
                {selectedSlot ? t('bookSlot') : t('chooseSlot')}
              </Button>
            </Link>

            {/* Trust signals */}
            <div className="space-y-2 pt-1 border-t border-mist">
              {[
                { icon: ShieldCheck, text: t('trustValidated') },
                ...(service.free_cancellation_hours ? [{ icon: CheckCircle2, text: t('freeCancellationUntil', { hours: service.free_cancellation_hours }) }] : []),
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-stone">
                  <Icon size={13} className="text-deep-green flex-none" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>{/* fin md:flex */}
      </div>{/* fin container */}

      {/* Fixed CTA — mobile uniquement, positionné au-dessus du BottomNav (h-16 + safe-area) */}
      <div
        className="fixed inset-x-0 md:hidden bg-coconut/95 backdrop-blur-md border-t border-mist p-4 z-40"
        style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="min-w-0">
            {selectedSlot
              ? <p className="text-xs text-deep-green font-medium">{selectedSlot.day} {selectedSlot.date} · {fmtSlot(selectedSlot.time)}</p>
              : <p className="text-xs text-stone">{t('from')}</p>
            }
            <p className="text-xl font-semibold text-charcoal">{fmt.price(selected?.price ?? service.price_cents)}</p>
          </div>
          <Link
            href={`/reserver/${service.id}?offer=${selected?.id ?? 'classic'}${selectedSlot ? `&slot=${selectedSlot.id}&date=${selectedSlot.isoDate}&time=${selectedSlot.time}` : ''}`}
            className="flex-1"
          >
            <Button variant="primary" fullWidth size="lg">
              {selectedSlot ? t('bookSlot') : t('chooseSlot')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
