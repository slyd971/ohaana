'use client'

import { use, useState, useEffect, useRef, useMemo } from 'react'
import { notFound } from 'next/navigation'
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
  CheckCircle2,
  CalendarDays,
  Circle,
  CircleDashed,
  Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { ServiceCard } from '@/components/service/ServiceCard'
import { getServiceById, SERVICES } from '@/lib/data/seed'
import { formatPrice, formatDuration, cn } from '@/lib/utils'

const LANG_FLAGS: Record<string, string> = { fr: '🇫🇷', en: '🇬🇧', es: '🇪🇸', de: '🇩🇪', kr: '🏝️' }

const INCLUDED_ITEMS = [
  'Déplacement à domicile',
  'Matériel fourni',
  'Produits locaux selon la prestation',
  'Support Ohaana',
  'Paiement sécurisé',
  'Annulation flexible',
]

const DAY_NAMES_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

// Deterministic slot patterns based on day-of-month — simulates real availability
const SLOT_PATTERNS = [
  [{ time: '09:00', status: 'available' }, { time: '11:00', status: 'available' }, { time: '14:00', status: 'request'  }, { time: '17:00', status: 'available' }],
  [{ time: '09:00', status: 'request'   }, { time: '10:00', status: 'available' }, { time: '14:00', status: 'full'     }, { time: '16:00', status: 'available' }, { time: '19:00', status: 'request' }],
  [{ time: '10:00', status: 'available' }, { time: '13:00', status: 'available' }, { time: '16:00', status: 'request'  }, { time: '18:00', status: 'available' }],
  [{ time: '09:00', status: 'full'      }, { time: '11:00', status: 'available' }, { time: '15:00', status: 'available'}, { time: '20:00', status: 'request'   }],
  [{ time: '10:00', status: 'available' }, { time: '14:00', status: 'available' }, { time: '18:00', status: 'available'}, { time: '20:00', status: 'available' }],
  [{ time: '09:00', status: 'available' }, { time: '11:00', status: 'request'   }, { time: '14:00', status: 'available'}, { time: '18:00', status: 'full'      }, { time: '20:00', status: 'available' }],
  [{ time: '09:00', status: 'available' }, { time: '10:00', status: 'available' }, { time: '15:00', status: 'request'  }, { time: '18:00', status: 'available' }],
]

function dayStatus(slots: { status: string }[]) {
  if (slots.some(s => s.status === 'available')) return 'available'
  if (slots.some(s => s.status === 'request'))   return 'request'
  return 'full'
}

function buildAvailability(start: Date | null, end: Date | null) {
  const today = new Date()
  const from = start ?? new Date(today.getTime() + 86400000)
  const to   = end   ?? new Date(today.getTime() + 4 * 86400000)
  const days: { isoDate: string; day: string; date: string; slots: { time: string; status: string }[] }[] = []
  const cursor = new Date(from)
  while (cursor <= to) {
    const d = new Date(cursor)
    days.push({
      isoDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      day:  DAY_NAMES_SHORT[d.getDay()],
      date: String(d.getDate()),
      slots: SLOT_PATTERNS[d.getDate() % SLOT_PATTERNS.length],
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

const fmtSlot = (t: string) => t.slice(0, 2).replace(/^0/, '') + 'h' + (t.slice(3) !== '00' ? t.slice(3) : '')

const STATUS_STYLES = {
  available: 'border-turquoise bg-turquoise/10 text-deep-green',
  request: 'border-[#F5A623]/40 bg-[#F5A623]/10 text-charcoal',
  full: 'border-mist bg-mist/50 text-stone line-through',
}

const STATUS_ICON = {
  available: CheckCircle2,
  request: CircleDashed,
  full: Circle,
}

function getOfferings(service: ReturnType<typeof getServiceById>) {
  if (!service) return []

  const basePrice = service.price_cents

  if (service.category_id === 'cat-2') {
    return [
      { id: 'relax', title: 'Massage Relaxation Caraïbe', duration: '60 min', price: basePrice, description: 'Rituel détente à domicile avec huiles locales.', includes: ['Table professionnelle', 'Huiles essentielles', 'Ambiance spa'] },
      { id: 'signature', title: 'Massage Signature', duration: '90 min', price: basePrice + 4000, description: 'Massage plus profond et personnalisé selon vos tensions.', includes: ['Diagnostic rapide', 'Table professionnelle', 'Huiles premium'] },
      { id: 'duo', title: 'Massage Duo Sunset', duration: '90 min', price: basePrice * 2 + 2000, description: 'Deux praticiens pour un moment à deux, idéal en fin de journée.', includes: ['Deux tables', 'Deux praticiens', 'Mise en ambiance'] },
      { id: 'pack', title: 'Pack Bien-être Villa', duration: '2h', price: basePrice * 2 + 8000, description: 'Massage, respiration guidée et rituel détente complet.', includes: ['Rituel complet', 'Produits locaux', 'Support Ohaana'] },
    ]
  }

  if (service.category_id === 'cat-1') {
    return [
      { id: 'essential', title: service.title_fr, duration: service.duration_min ? formatDuration(service.duration_min) : 'Sur mesure', price: basePrice, description: 'Prestation complète à domicile, pensée pour vous.', includes: ['Préparation sur place', 'Service inclus', 'Produits locaux'] },
      { id: 'signature', title: 'Menu Signature Caraïbe', duration: '3h30', price: basePrice + 4500, description: 'Une version plus gastronomique avec accords et dressage premium.', includes: ['Menu enrichi', 'Accords rhum', 'Service à table'] },
      { id: 'family', title: 'Table famille & enfants', duration: '2h30', price: Math.max(9000, basePrice - 3000), description: 'Une expérience plus souple pour les familles en séjour.', includes: ['Menu adapté', 'Option enfants', 'Rangement inclus'] },
    ]
  }

  return [
    { id: 'classic', title: service.title_fr, duration: service.duration_min ? formatDuration(service.duration_min) : 'Sur mesure', price: basePrice, description: service.description_fr, includes: ['Déplacement inclus', 'Matériel fourni', 'Coordination Ohaana'] },
    { id: 'signature', title: 'Version Signature', duration: service.duration_min ? formatDuration(service.duration_min + 30) : 'Sur mesure', price: basePrice + 3500, description: 'Une prestation renforcée avec préparation et finitions premium.', includes: ['Préparation étendue', 'Matériel fourni', 'Finitions premium'] },
    { id: 'groupe', title: 'Format groupe privé', duration: service.duration_min ? formatDuration(service.duration_min + 60) : 'Sur mesure', price: basePrice + 7000, description: 'Pensé pour les familles, amis ou petites célébrations à domicile.', includes: ['Format groupe', 'Coordination horaire', 'Support Ohaana'] },
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
          placeholder="Lieu de séjour"
          onChange={(e) => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          className={cn(
            'w-full h-11 rounded-xl border bg-coconut pl-8 pr-3 text-sm text-charcoal placeholder:text-stone focus:outline-none transition-colors',
            open ? 'border-deep-green ring-2 ring-deep-green/15' : 'border-mist',
          )}
        />
      </div>

      {open && filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-1.5 bg-surface rounded-xl border border-mist shadow-elevated overflow-hidden z-50"
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

export default function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const service = getServiceById(id)
  if (!service) notFound()

  const [imgIndex, setImgIndex] = useState(0)
  const [isFav, setIsFav] = useState(false)
  const [stickyVisible, setStickyVisible] = useState(false)
  const [stayStart, setStayStart] = useState<Date | null>(null)
  const [stayEnd, setStayEnd] = useState<Date | null>(null)
  const [location, setLocation] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<{ isoDate: string; day: string; date: string; time: string } | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  // Pre-fill location + stay dates from session
  useEffect(() => {
    try {
      const savedIsland = sessionStorage.getItem('ohaana_island')
      if (savedIsland && savedIsland !== 'all') {
        const labels: Record<string, string> = {
          guadeloupe: 'Guadeloupe',
          martinique: 'Martinique',
          saint_martin: 'Saint-Martin',
          saint_barth: 'Saint-Barth',
        }
        setLocation(labels[savedIsland] ?? '')
      }
      const s = sessionStorage.getItem('ohaana_stay_start')
      const e = sessionStorage.getItem('ohaana_stay_end')
      if (s) { const d = new Date(s); if (!isNaN(d.getTime())) setStayStart(d) }
      if (e) { const d = new Date(e); if (!isNaN(d.getTime())) setStayEnd(d) }
    } catch {}
  }, [])

  // Reset slot + selected day when dates change
  useEffect(() => { setSelectedSlot(null); setSelectedDay(null) }, [stayStart, stayEnd])

  const availability = useMemo(() => buildAvailability(stayStart, stayEnd), [stayStart, stayEnd])

  const offerings = getOfferings(service)
  const [selectedOffering, setSelectedOffering] = useState(offerings[0]?.id)
  const selected = offerings.find((offering) => offering.id === selectedOffering) ?? offerings[0]

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 380)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const relatedServices = SERVICES
    .filter((s) => s.provider_id === service.provider_id && s.id !== service.id)
    .slice(0, 3)

  const { provider, images } = service

  return (
    <div className="bg-coconut pb-36 md:pb-8">

      {/* Sticky header — apparaît après le hero */}
      <motion.div
        initial={false}
        animate={{ y: stickyVisible ? 0 : -72, opacity: stickyVisible ? 1 : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed top-0 inset-x-0 z-50 bg-coconut/95 backdrop-blur-md border-b border-mist md:hidden"
      >
        <div className="max-w-2xl mx-auto px-4 min-h-16 py-2 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-charcoal line-clamp-2 leading-tight">{service.title_fr}</p>
            <p className="text-xs text-stone mt-0.5">{formatPrice(selected?.price ?? service.price_cents)} · pers.</p>
          </div>
          <Link href={`/reserver/${service.id}?offer=${selected?.id ?? 'classic'}`}>
            <Button variant="primary" size="sm">
              Choisir mon créneau
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* ── Mobile hero ─────────────────────────────────────────────────────── */}
      <div className="relative h-[300px] md:hidden bg-charcoal">
        {images.map((img, i) => (
          <motion.div key={img.id} className="absolute inset-0" initial={false}
            animate={{ opacity: i === imgIndex ? 1 : 0 }} transition={{ duration: 0.4 }}>
            <Image src={img.url} alt={img.alt_fr ?? ''} fill className="object-cover object-center" priority={i === 0} sizes="100vw" />
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
        <Link href="/search" className="absolute top-4 left-4 p-2 rounded-full bg-black/35 backdrop-blur-sm text-white hover:bg-black/55 transition-colors z-10">
          <ChevronLeft size={20} />
        </Link>
        <button type="button" onClick={() => setIsFav((v) => !v)}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/35 backdrop-blur-sm hover:bg-black/55 transition-colors z-10">
          <Heart size={20} className={cn(isFav ? 'fill-coral text-coral' : 'text-white fill-transparent')} />
        </button>
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => setImgIndex((i) => Math.max(0, i - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white disabled:opacity-0 transition-opacity"
              disabled={imgIndex === 0}><ChevronLeft size={18} /></button>
            <button type="button" onClick={() => setImgIndex((i) => Math.min(images.length - 1, i + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white disabled:opacity-0 transition-opacity"
              disabled={imgIndex === images.length - 1}><ChevronRight size={18} /></button>
          </>
        )}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 flex items-end gap-4">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/80 shadow-lg flex-none">
            <Image src={provider.user.avatar_url} alt={provider.user.full_name} fill className="object-cover" sizes="64px" />
          </div>
          <div className="flex-1 min-w-0 pb-0.5">
            <h1 className="text-2xl font-display text-white leading-tight drop-shadow-sm line-clamp-3">{service.title_fr}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium text-white/90 truncate">{provider.business_name}</span>
              <span className="text-white/40">·</span>
              {provider.languages.map((l) => <span key={l} className="text-sm">{LANG_FLAGS[l] ?? l}</span>)}
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-1.5 pb-1 shrink-0">
              {images.map((_, i) => (
                <button key={i} type="button" onClick={() => setImgIndex(i)}
                  className={cn('h-1.5 rounded-full transition-all', i === imgIndex ? 'bg-white w-4' : 'bg-white/40 w-1.5')} />
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
                Prestataire vérifié
              </Badge>
            )}
            <span className="text-sm text-stone">
              Organisé par{' '}
              <span className="font-medium text-charcoal">{provider.business_name}</span>
              {' · '}
              {provider.languages.map((l) => LANG_FLAGS[l] ?? l).join(' ')}
            </span>
            <button
              type="button"
              onClick={() => setIsFav((v) => !v)}
              className="ml-auto flex items-center gap-1.5 text-sm text-stone hover:text-charcoal transition-colors"
            >
              <Heart size={15} className={cn(isFav ? 'fill-coral text-coral' : '')} />
              {isFav ? 'Retiré des favoris' : 'Ajouter aux favoris'}
            </button>
          </div>
          <h1 className="text-3xl font-display text-charcoal leading-tight mb-3">{service.title_fr}</h1>
          <div className="flex items-center gap-5 text-sm text-stone">
            {service.duration_min && (
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-deep-green" />
                {formatDuration(service.duration_min)}
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
          className="hidden md:grid grid-rows-2 grid-flow-col gap-1.5 h-[400px] rounded-2xl overflow-hidden mb-8"
          style={{ gridTemplateColumns: '1.8fr 1fr 1fr' }}
        >
          <div className="row-span-2 relative overflow-hidden">
            <Image src={images[0].url} alt={images[0].alt_fr ?? ''} fill className="object-cover" sizes="55vw" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            <Link href="/search" className="absolute top-4 left-4 p-2 rounded-full bg-black/35 backdrop-blur-sm text-white hover:bg-black/55 transition-colors z-10">
              <ChevronLeft size={20} />
            </Link>
          </div>
          {([1, 2, 3, 4] as const).map((idx) => {
            const img = images[idx] ?? images[idx % images.length]
            const isLast = idx === 4
            return (
              <div key={idx} className="relative overflow-hidden">
                {img && <Image src={img.url} alt={img.alt_fr ?? ''} fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="20vw" />}
                {!img && <div className="absolute inset-0 bg-stone/20" />}
                {isLast && <div className="absolute inset-0 bg-black/25" />}
                {isLast && (
                  <button type="button" className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-charcoal text-xs font-medium px-3 py-1.5 rounded-full shadow-sm hover:bg-coconut transition-colors">
                    Voir tout
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
                Prestataire vérifié
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
                    'w-full text-left rounded-2xl border p-4 transition-all',
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
                          <span className="inline-flex items-center text-[10px] font-semibold text-deep-green bg-turquoise/15 border border-turquoise/25 px-1.5 py-0.5 rounded-full">
                            Populaire
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-stone">{offering.duration}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-none">
                      <p className="text-sm font-semibold text-deep-green">{formatPrice(offering.price)}</p>
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
        <section className="mb-6 bg-surface rounded-2xl border border-mist p-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-charcoal uppercase tracking-wider">Disponibilités</h2>
              <p className="mt-1 text-sm text-stone">Renseignez vos dates et votre lieu de séjour pour filtrer les créneaux compatibles.</p>
            </div>
            <CalendarDays size={18} className="text-deep-green flex-none" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <DateRangePicker
              startDate={stayStart}
              endDate={stayEnd}
              onChange={(s, e) => {
                setStayStart(s)
                setStayEnd(e)
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
                    'rounded-xl border p-2.5 text-center transition-all',
                    isActive
                      ? 'border-deep-green bg-deep-green/5 ring-2 ring-deep-green/15'
                      : hasSelected
                      ? 'border-turquoise bg-turquoise/5'
                      : 'border-mist bg-coconut hover:border-deep-green/30'
                  )}
                >
                  <p className="text-[10px] uppercase text-stone">{day.day}</p>
                  <p className="text-lg font-display text-charcoal leading-tight">{day.date}</p>
                  <div className="flex justify-center mt-1.5">
                    <div className={cn('w-2 h-2 rounded-full', {
                      'bg-turquoise': status === 'available',
                      'bg-[#F5A623]': status === 'request',
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
                className="rounded-2xl bg-sand border border-mist p-4 space-y-3"
              >
                <p className="text-xs font-semibold text-charcoal uppercase tracking-wider">
                  {day.day} {day.date} — Choisissez un créneau
                </p>
                <div className="flex flex-wrap gap-2">
                  {day.slots.map((slot) => {
                    const Icon = STATUS_ICON[slot.status as keyof typeof STATUS_ICON]
                    const isSelected = selectedSlot?.isoDate === day.isoDate && selectedSlot?.time === slot.time
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={slot.status === 'full'}
                        onClick={() => slot.status !== 'full' && setSelectedSlot(
                          isSelected ? null : { isoDate: day.isoDate, day: day.day, date: day.date, time: slot.time }
                        )}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
                          slot.status === 'full'
                            ? 'border-mist bg-mist/30 text-stone line-through cursor-not-allowed'
                            : isSelected
                            ? 'border-deep-green bg-deep-green text-white shadow-sm'
                            : slot.status === 'available'
                            ? 'border-turquoise/50 bg-turquoise/10 text-deep-green hover:bg-turquoise/20'
                            : 'border-[#F5A623]/40 bg-[#F5A623]/10 text-charcoal hover:bg-[#F5A623]/20'
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
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-turquoise inline-block" /> Disponible</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F5A623] inline-block" /> Sur demande</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-stone/40 inline-block" /> Complet</span>
          </div>
        </section>

        {/* Included */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-charcoal uppercase tracking-wider mb-3">Ce qui est inclus</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INCLUDED_ITEMS.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-charcoal-soft">
                <CheckCircle2 size={15} className="text-turquoise flex-none" />
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Description */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider mb-2">À propos</h3>
          <p className="text-sm text-charcoal-soft leading-relaxed">{service.description_fr}</p>
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
                    'relative overflow-hidden rounded-xl aspect-[4/3]',
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
            <span className="flex items-center gap-1 text-xs text-stone">
              <Clock size={12} />
              Répond en moins de 30 min
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
                Contacter
              </a>
            )}
          </div>
        </section>

        {/* Often booked with */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider mb-3">
            Complétez votre expérience
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {SERVICES
              .filter((s) => s.id !== service.id && ['cat-1', 'cat-3', 'cat-8', 'cat-9', 'cat-11'].includes(s.category_id))
              .slice(0, 5)
              .map((s) => (
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
        <section className="mb-6 rounded-2xl bg-deep-green text-coconut p-5 flex gap-4 items-start">
          <div className="flex-none w-10 h-10 rounded-full bg-coconut/15 flex items-center justify-center">
            <MessageCircle size={18} className="text-coconut" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold mb-0.5">Besoin d'aide pour composer votre séjour ?</p>
            <p className="text-xs text-coconut/70 leading-relaxed">Notre concierge peut créer un programme sur-mesure pour vous en moins de 2h — chefs, massages, sorties, transferts.</p>
          </div>
          <Link
            href="/concierge"
            className="flex-none self-center text-xs font-semibold bg-coconut text-deep-green px-4 py-2 rounded-full hover:bg-sand transition-colors whitespace-nowrap"
          >
            Demander conseil
          </Link>
        </section>

        </div>{/* fin colonne gauche */}

        {/* ── Colonne droite sticky (desktop uniquement) ── */}
        <div className="hidden md:block md:w-72 md:flex-none md:self-start md:sticky md:top-24">
          <div className="rounded-3xl border border-mist bg-surface shadow-elevated p-6 space-y-5">
            {/* Prix */}
            <div>
              <p className="text-xs text-stone mb-1">À partir de</p>
              <p className="text-3xl font-semibold text-charcoal">{formatPrice(selected?.price ?? service.price_cents)}</p>
              <p className="text-xs text-stone">par personne · déplacement inclus</p>
            </div>

            {/* Prestation sélectionnée */}
            {selected && (
              <div className="rounded-xl border border-deep-green/20 bg-deep-green/5 px-4 py-3">
                <p className="text-xs text-stone mb-0.5">Prestation sélectionnée</p>
                <p className="text-sm font-semibold text-charcoal">{selected.title}</p>
                <p className="text-xs text-stone mt-0.5">{selected.duration}</p>
              </div>
            )}

            {/* Créneau sélectionné */}
            {selectedSlot && (
              <div className="rounded-xl border border-deep-green/20 bg-deep-green/5 px-4 py-2.5 text-xs text-deep-green font-medium">
                {selectedSlot.day} {selectedSlot.date} · {fmtSlot(selectedSlot.time)}
              </div>
            )}

            {/* CTA */}
            <Link
              href={`/reserver/${service.id}?offer=${selected?.id ?? 'classic'}${selectedSlot ? `&date=${selectedSlot.isoDate}&time=${selectedSlot.time}` : ''}`}
              className="block"
            >
              <Button variant="primary" fullWidth size="lg">
                {selectedSlot ? 'Réserver ce créneau' : 'Choisir mon créneau'}
              </Button>
            </Link>

            {/* Trust signals */}
            <div className="space-y-2 pt-1 border-t border-mist">
              {[
                { icon: ShieldCheck, text: 'Prestataire vérifié Ohaana' },
                { icon: CheckCircle2, text: 'Annulation flexible' },
                { icon: MessageCircle, text: 'Réponse en moins de 30 min' },
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
              : <p className="text-xs text-stone">À partir de</p>
            }
            <p className="text-xl font-semibold text-charcoal">{formatPrice(selected?.price ?? service.price_cents)}</p>
          </div>
          <Link
            href={`/reserver/${service.id}?offer=${selected?.id ?? 'classic'}${selectedSlot ? `&date=${selectedSlot.isoDate}&time=${selectedSlot.time}` : ''}`}
            className="flex-1"
          >
            <Button variant="primary" fullWidth size="lg">
              {selectedSlot ? 'Réserver ce créneau' : 'Choisir mon créneau'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
