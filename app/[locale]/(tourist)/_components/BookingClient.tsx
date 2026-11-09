'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from '@/lib/i18n/navigation'
import {
  ChevronLeft, CheckCircle2, Clock, Heart, Users, ShieldCheck,
  Lock, Info, ChevronDown, ChevronUp, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StripeCheckout } from '@/components/checkout/StripeCheckout'
import { STRIPE_CONFIGURED, STRIPE_TEST_MODE, getStripePromise } from '@/lib/stripe/browser'
import { isStripeAccountId } from '@/lib/stripe/direct-charge'
import { useAuth } from '@/lib/auth/AuthProvider'
import { DEMO_MODE } from '@/lib/demo-mode'
import type { ServiceView, SlotView } from '@/lib/data/types'
import { cn } from '@/lib/utils'
import { useFormat } from '@/hooks/useFormat'

const isoOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`


function startOfDay(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function getCalendarCells(year: number, month: number): (Date | null)[] {
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7 // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function InlineCalendar({ selected, onChange, availableDates }: { selected: Date | null; onChange: (d: Date) => void; availableDates: Set<string> }) {
  const fmt = useFormat()
  const t = useTranslations('bookingFlow')
  const today = new Date()
  const init = selected ?? new Date(today.getTime() + 86400000)
  const [viewYear, setViewYear]   = useState(init.getFullYear())
  const [viewMonth, setViewMonth] = useState(init.getMonth())

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const cells = getCalendarCells(viewYear, viewMonth)
  const todayStart = startOfDay(today)

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={prevMonth} aria-label={t('prevMonth')}
          className="p-2 rounded-control hover:bg-mist transition-colors text-stone hover:text-charcoal">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-charcoal capitalize">
          {fmt.month(viewMonth)} {viewYear}
        </span>
        <button type="button" onClick={nextMonth} aria-label={t('nextMonth')}
          className="p-2 rounded-control hover:bg-mist transition-colors text-stone hover:text-charcoal">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {fmt.weekdayInitials().map((d, i) => (
          <div key={i} className="text-center text-xs font-medium text-stone py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const isPast = startOfDay(day) < todayStart || !availableDates.has(isoOf(day))
          const isSelected = selected ? isSameDay(day, selected) : false
          const isToday = isSameDay(day, today)
          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isPast}
              onClick={() => onChange(day)}
              className={cn(
                'h-10 w-full flex items-center justify-center rounded-full text-sm font-medium transition-all',
                isPast  && 'text-mist cursor-not-allowed',
                isSelected && 'bg-deep-green text-white',
                !isSelected && isToday && 'border border-deep-green text-deep-green',
                !isSelected && !isToday && !isPast && 'text-charcoal hover:bg-mist',
              )}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Confirmation screen ────────────────────────────────────────────────────

function ConfirmationScreen({
  service,
  title,
  selectedDate,
  selectedTime,
  guests,
  total,
  demo,
}: {
  service: ServiceView
  title: string
  selectedDate: Date
  selectedTime: string
  guests: number
  total: number
  demo: boolean
}) {
  const t = useTranslations('bookingFlow')
  const fmt = useFormat()
  const cover = service.images.find((i) => i.is_cover) ?? service.images[0]
  const svcTitle = title

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-dvh bg-coconut flex flex-col items-center justify-center px-4 py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-deep-green/10 flex items-center justify-center mb-6"
      >
        <CheckCircle2 size={40} className="text-deep-green" />
      </motion.div>

      <h1 className="text-2xl font-display text-charcoal text-center mb-2">{t('confirmedTitle')}</h1>
      <p className="text-stone text-sm text-center max-w-xs mb-8">
        {demo ? t('demoConfirmed') : t('emailSoon')}
      </p>

      <div className="w-full max-w-sm bg-surface rounded-3xl border border-mist overflow-hidden mb-6">
        <div className="relative h-32">
          <Image src={cover?.url ?? ''} alt={svcTitle} fill className="object-cover" sizes="400px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <p className="absolute bottom-3 left-4 right-4 text-white text-sm font-semibold line-clamp-2">
            {svcTitle}
          </p>
        </div>
        <div className="p-4 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-stone">{t('date')}</span>
            <span className="text-charcoal font-medium capitalize">{fmt.date(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone">{t('time')}</span>
            <span className="text-charcoal">{selectedTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone">{t('participants')}</span>
            <span className="text-charcoal">{t('guestsCount', { count: guests })}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2.5 border-t border-mist">
            <span className="text-charcoal">{t('totalPaid')}</span>
            <span className="text-charcoal">{fmt.price(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-sm">
        <Link href="/voyages">
          <Button fullWidth variant="primary">{t('viewBookings')}</Button>
        </Link>
        <Link href="/">
          <Button fullWidth variant="ghost">{t('backHome')}</Button>
        </Link>
      </div>
    </motion.div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

interface BookingClientProps {
  service: ServiceView
  slots: SlotView[]
}

export function BookingClient({ service, slots }: BookingClientProps) {
  const locale = useLocale()
  const t = useTranslations('bookingFlow')
  const ts = useTranslations('service')
  const tb = useTranslations('booking')
  const fmt = useFormat()

  const svcTitle = locale === 'es' ? service.title_es : locale === 'en' ? service.title_en : service.title_fr

  const searchParams = useSearchParams()

  const initDate = (() => {
    const d = searchParams.get('date')
    if (!d) return null
    const parsed = new Date(d)
    return isNaN(parsed.getTime()) ? null : parsed
  })()
  const initTimeParam = searchParams.get('time')
  const availableDates = useMemo(() => new Set(slots.map((sl) => sl.date)), [slots])
  // A pre-selected slot is only honoured if it is still really free.
  const initTime = initDate && initTimeParam && slots.some((sl) => sl.date === isoOf(initDate) && sl.start_time.startsWith(initTimeParam)) ? initTimeParam : null

  // Si date+heure pré-sélectionnées depuis la fiche prestataire,
  // on skip les sélecteurs et on affiche un récap compact
  const preselected = !!(initDate && initTime)

  const [isFav, setIsFav] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(initDate)
  const [selectedTime, setSelectedTime] = useState<string | null>(initTime)
  const [editingSlot, setEditingSlot] = useState(!preselected)
  const guestsParam = Number(searchParams.get('guests'))
  const [guests, setGuests] = useState(
    Number.isInteger(guestsParam) && guestsParam >= service.capacity_min && guestsParam <= service.capacity_max ? guestsParam : service.capacity_min,
  )
  const [notes, setNotes] = useState('')
  const [notesOpen, setNotesOpen] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const { isLoggedIn, loading: authLoading } = useAuth()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [stripeAccount, setStripeAccount] = useState<string | null>(null)
  const [intentLoading, setIntentLoading] = useState(false)
  const [payError, setPayError] = useState('')
  const [payBusy, setPayBusy] = useState(false)
  const payRef = useRef<(() => Promise<void>) | null>(null)
  const registerPay = useCallback((fn: (() => Promise<void>) | null) => { payRef.current = fn }, [])
  const handleSuccess = useCallback(() => setConfirmed(true), [])

  const cover = service.images.find((i) => i.is_cover) ?? service.images[0]
  const total = service.price_unit === 'flat' ? service.price_cents : service.price_cents * guests
  const times = selectedDate ? slots.filter((sl) => sl.date === isoOf(selectedDate)).map((sl) => sl.start_time.slice(0, 5)) : []
  const canBook = !!selectedDate && !!selectedTime

  const selectedSlotId = selectedDate && selectedTime
    ? slots.find((sl) => sl.date === isoOf(selectedDate) && sl.start_time.startsWith(selectedTime))?.id ?? null
    : null
  const returnUrl = typeof window === 'undefined' || !selectedDate || !selectedTime
    ? ''
    : `${window.location.origin}${window.location.pathname}?date=${isoOf(selectedDate)}&time=${selectedTime}&guests=${guests}${stripeAccount ? `&acct=${stripeAccount}` : ''}`

  // Any change to the order invalidates the PaymentIntent: it is recreated (server-priced) on the next "Réserver".
  function invalidatePayment() {
    setShowPayment(false)
    setClientSecret(null)
    setStripeAccount(null)
    setPayError('')
  }

  async function startPayment() {
    if (!selectedSlotId) return
    setShowPayment(true)
    setPayError('')
    if (!STRIPE_CONFIGURED) return
    setIntentLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: service.id, slotId: selectedSlotId, guests, notes: notes || undefined }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.clientSecret) {
        const messages: Record<string, string> = {
          slot_unavailable: t('errSlotTaken'),
          auth_required: t('errAuth'),
          payments_not_configured: t('errNotConfigured'),
          invalid_guests: t('errGuests'),
          provider_not_ready: t('errProviderNotReady'),
        }
        setPayError(messages[data.error as string] ?? t('errGeneric'))
        setShowPayment(data.error !== 'slot_unavailable')
        return
      }
      setStripeAccount(typeof data.stripeAccount === 'string' ? data.stripeAccount : null)
      setClientSecret(data.clientSecret as string)
    } catch {
      setPayError(t('errNetwork'))
    } finally {
      setIntentLoading(false)
    }
  }

  // Back from a redirect (3-D Secure, wallets): Stripe appends payment_intent_client_secret to the URL.
  const returnedSecret = searchParams.get('payment_intent_client_secret')
  const returnedAccount = searchParams.get('acct')
  useEffect(() => {
    if (!returnedSecret) return
    let active = true
    const account = returnedAccount && isStripeAccountId(returnedAccount) ? returnedAccount : null
    getStripePromise(account)?.then((stripe) => stripe?.retrievePaymentIntent(returnedSecret)).then((result) => {
      if (!active || !result) return
      const status = result.paymentIntent?.status
      if (status === 'succeeded' || status === 'processing') setConfirmed(true)
      else setPayError(t('errNotCompleted'))
    })
    return () => { active = false }
  }, [returnedSecret, returnedAccount, t])

  if (confirmed) {
    return (
      <ConfirmationScreen
        service={service}
        title={svcTitle}
        selectedDate={selectedDate!}
        selectedTime={selectedTime!}
        guests={guests}
        total={total}
        demo={DEMO_MODE}
      />
    )
  }

  return (
    <div className="min-h-dvh bg-coconut">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-coconut/95 backdrop-blur-md border-b border-mist">
        <div className="max-w-2xl mx-auto px-4 min-h-14 py-2 flex items-center gap-3">
          <Link href={`/prestataires/${service.id}`} aria-label={t('backToService')} className="flex h-11 w-11 -ml-2 items-center justify-center text-charcoal flex-none">
            <ChevronLeft size={22} />
          </Link>
          <p className="flex-1 text-sm font-semibold text-charcoal line-clamp-2 leading-tight">{svcTitle}</p>
          <button
            type="button"
            onClick={() => setIsFav(v => !v)}
            aria-label={isFav ? ts('removeFavorite') : ts('addFavorite')}
            aria-pressed={isFav}
            className="flex h-11 w-11 -mr-2 items-center justify-center flex-none transition-colors"
          >
            <Heart
              size={20}
              className={cn(isFav ? 'fill-coral text-coral-text' : 'text-stone')}
            />
          </button>
        </div>
      </div>

      {/* Progression : date, heure, participants, paiement */}
      <nav aria-label={t('progressLabel')} className="max-w-2xl mx-auto px-4 pt-3">
        <ol className="flex items-center gap-2">
          {(['date', 'time', 'details', 'payment'] as const).map((step, i) => {
            const current = !selectedDate ? 0 : !selectedTime ? 1 : !showPayment ? 2 : 3
            const done = i < current
            return (
              <li key={step} className="flex flex-1 items-center gap-2" aria-current={i === current ? 'step' : undefined}>
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-semibold',
                    done ? 'bg-deep-green text-coconut' : i === current ? 'border-2 border-deep-green text-deep-green' : 'border border-mist text-stone',
                  )}
                >
                  {done ? <CheckCircle2 size={14} /> : i + 1}
                </span>
                <span className={cn('truncate text-xs', i === current ? 'font-semibold text-charcoal' : 'text-stone')}>{tb(`steps.${step}`)}</span>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Scrollable content — padded for sticky bottom bar + bottom nav */}
      <div className="max-w-2xl mx-auto pb-40">

        {/* ── Activity summary ──────────────────────────────── */}
        <div className="px-4 pt-4 pb-5 border-b border-mist">
          <div className="flex gap-3 items-start">
            <div className="relative w-20 h-20 rounded-card overflow-hidden flex-none">
              <Image
                src={cover?.url ?? ''}
                alt={svcTitle}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-charcoal line-clamp-2 leading-tight">
                {svcTitle}
              </p>
              <p className="text-xs text-stone mt-0.5">{service.provider.business_name}</p>
                  {/* Key info */}
              <div className="flex items-center gap-3 mt-1 text-[11px] text-stone">
                {service.duration_min && (
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {fmt.duration(service.duration_min)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users size={10} />
                  {t('capacity', { min: service.capacity_min, max: service.capacity_max })}
                </span>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            {service.free_cancellation_hours && (
              <span className="flex items-center gap-1.5 text-xs text-deep-green font-medium bg-deep-green/8 rounded-full px-3 py-1">
                <ShieldCheck size={12} />
                {t('freeCancellationUntil', { hours: service.free_cancellation_hours })}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-charcoal bg-mist/60 rounded-full px-3 py-1">
              <Lock size={12} />
              {t('securePayment')}
            </span>
          </div>
        </div>

        {/* ── Créneau : récap compact OU sélecteurs ────────── */}
        {!editingSlot && canBook ? (
          /* Récap compact quand date+heure déjà choisies */
          <div className="px-4 py-4 border-b border-mist flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-control bg-deep-green/10 flex items-center justify-center flex-none">
                <CheckCircle2 size={18} className="text-deep-green" />
              </div>
              <div>
                <p className="text-xs text-stone">{t('slotSelected')}</p>
                <p className="text-sm font-semibold text-charcoal">
                  {selectedDate
                    ? fmt.date(selectedDate, { weekday: 'short', day: 'numeric', month: 'short' })
                    : ''} · {selectedTime}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setEditingSlot(true); invalidatePayment() }}
              className="text-xs text-deep-green font-medium underline underline-offset-2 flex-none"
            >
              {t('edit')}
            </button>
          </div>
        ) : (
          /* Sélecteurs complets */
          <>
            <div className="px-4 py-5 border-b border-mist">
              <h2 className="text-base font-semibold text-charcoal mb-4">{t('selectDate')}</h2>
              <InlineCalendar
                selected={selectedDate}
                onChange={(d) => {
                  setSelectedDate(d)
                  setSelectedTime(null)
                  invalidatePayment()
                }}
                availableDates={availableDates}
              />
            </div>

            <AnimatePresence initial={false}>
              {selectedDate && (
                <motion.div
                  key="times"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="border-b border-mist px-4 py-5"
                >
                  <h2 className="text-base font-semibold text-charcoal mb-3">{t('chooseSlot')}</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {times.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setSelectedTime(t)
                          setEditingSlot(false)
                          invalidatePayment()
                        }}
                        className={cn(
                          'py-3 rounded-control border-2 text-sm font-medium transition-all',
                          selectedTime === t
                            ? 'border-deep-green bg-deep-green text-white'
                            : 'border-mist bg-surface text-charcoal hover:border-deep-green/40',
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* ── Participants ──────────────────────────────────── */}
        <div className="px-4 py-5 border-b border-mist">
          <h2 className="text-base font-semibold text-charcoal mb-4">{t('participants')}</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal">{t('adults')}</p>
              <p className="text-xs text-stone">{t('perPerson', { price: fmt.price(service.price_cents) })}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => { setGuests((g) => Math.max(service.capacity_min, g - 1)); invalidatePayment() }}
                disabled={guests <= service.capacity_min}
                className="w-9 h-9 rounded-full border-2 border-mist flex items-center justify-center text-lg font-medium text-charcoal hover:border-deep-green transition-colors disabled:opacity-30"
              >
                −
              </button>
              <span className="text-xl font-semibold text-charcoal w-6 text-center">{guests}</span>
              <button
                type="button"
                onClick={() => { setGuests((g) => Math.min(service.capacity_max, g + 1)); invalidatePayment() }}
                disabled={guests >= service.capacity_max}
                className="w-9 h-9 rounded-full border-2 border-mist flex items-center justify-center text-lg font-medium text-charcoal hover:border-deep-green transition-colors disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
          <p className="text-xs text-stone mt-2">
            {t('minMax', { min: service.capacity_min, max: service.capacity_max })}
          </p>
        </div>

        {/* ── Price breakdown ───────────────────────────────── */}
        <div className="px-4 py-5 border-b border-mist">
          <h2 className="text-base font-semibold text-charcoal mb-3">{t('priceDetail')}</h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-charcoal-soft">
              <span>{t('priceLine', { price: fmt.price(service.price_cents), count: guests })}</span>
              <span>{fmt.price(total)}</span>
            </div>
            <div className="flex justify-between font-semibold text-charcoal pt-2.5 border-t border-mist text-base">
              <span>{t('total')}</span>
              <span>{fmt.price(total)}</span>
            </div>
          </div>
        </div>

        {/* ── Cancellation policy ───────────────────────────── */}
        <div className="px-4 py-4 border-b border-mist">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={15} className="text-deep-green flex-none mt-0.5" />
            <div>
              <p className="text-sm font-medium text-charcoal">
                {service.free_cancellation_hours ? t('freeCancellationUntil', { hours: service.free_cancellation_hours }) : t('cancellationTitle')}
              </p>
              <p className="text-xs text-stone mt-0.5">
                {service.free_cancellation_hours ? t('cancellationRefund', { hours: service.free_cancellation_hours }) : t('cancellationGeneric')}
              </p>
            </div>
          </div>
        </div>

        {/* ── Notes — collapsible ───────────────────────────── */}
        <div className="px-4 py-4 border-b border-mist">
          <button
            type="button"
            onClick={() => setNotesOpen((v) => !v)}
            className="w-full flex items-center justify-between text-sm font-medium text-charcoal"
          >
            <span>{t('specialRequests')} <span className="text-stone font-normal">{t('optional')}</span></span>
            {notesOpen ? (
              <ChevronUp size={16} className="text-stone" />
            ) : (
              <ChevronDown size={16} className="text-stone" />
            )}
          </button>
          {notesOpen && (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notesPlaceholder')}
              rows={3}
              className="w-full mt-3 rounded-control border border-mist bg-surface px-4 py-3 text-sm text-charcoal placeholder:text-stone focus:outline-none focus:border-deep-green resize-none"
            />
          )}
        </div>

        {/* ── Payment form (revealed on CTA click) ─────────── */}
        <AnimatePresence initial={false}>
          {showPayment && canBook && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="px-4 py-5">
                <h2 className="text-base font-semibold text-charcoal mb-4">{t('securePayment')}</h2>

                {DEMO_MODE && (
                  <p className="mb-4 rounded-control border border-star/40 bg-star/10 px-3.5 py-2.5 text-xs leading-relaxed text-charcoal">
                    {t.rich('demoNotice', { b: (c) => <strong>{c}</strong> })}
                  </p>
                )}
                {STRIPE_TEST_MODE && (
                  <div className="mb-4 rounded-control border border-mist bg-sand px-3.5 py-3 text-xs leading-relaxed text-charcoal-soft">
                    <p className="font-semibold text-charcoal">{t('testCard')}</p>
                    <p className="mt-1">
                      {t.rich('testCardLine', { num: '4242 4242 4242 4242', mono: (c) => <span className="font-mono">{c}</span> })}
                    </p>
                    <p className="mt-0.5">{t.rich('test3ds', { num: '4000 0027 6000 3184', mono: (c) => <span className="font-mono">{c}</span> })}</p>
                  </div>
                )}

                {!STRIPE_CONFIGURED ? (
                  <p role="status" className="rounded-control border border-mist bg-sand p-4 text-sm text-stone">
                    {t('paymentSoon')}
                  </p>
                ) : !DEMO_MODE && !authLoading && !isLoggedIn ? (
                  <div className="rounded-control border border-mist bg-sand p-4 space-y-3">
                    <p className="text-sm text-charcoal">{t('loginToFinish')}</p>
                    <Link href={`/login?redirectTo=${encodeURIComponent(typeof window === 'undefined' ? '/' : window.location.pathname + window.location.search)}`}>
                      <Button fullWidth variant="primary">{t('signIn')}</Button>
                    </Link>
                  </div>
                ) : intentLoading || !clientSecret ? (
                  <div className="space-y-3" aria-busy="true" role="status" aria-label={t('preparing')}>
                    <div className="h-12 animate-pulse rounded-control bg-mist/70" />
                    <div className="h-12 animate-pulse rounded-control bg-mist/70" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-12 animate-pulse rounded-control bg-mist/70" />
                      <div className="h-12 animate-pulse rounded-control bg-mist/70" />
                    </div>
                  </div>
                ) : (
                  <StripeCheckout
                    clientSecret={clientSecret}
                    stripeAccount={stripeAccount}
                    returnUrl={returnUrl}
                    registerPay={registerPay}
                    onSuccess={handleSuccess}
                    onError={setPayError}
                    onBusyChange={setPayBusy}
                  />
                )}

                {payError && <p role="alert" className="mt-3 text-sm text-coral-text">{payError}</p>}

                <ul className="mt-5 space-y-1.5 text-xs text-stone">
                  <li className="flex items-center gap-2"><Lock size={12} className="flex-none text-deep-green" /> {t('trustEncrypted')}</li>
                  <li className="flex items-center gap-2"><ShieldCheck size={12} className="flex-none text-deep-green" /> {t('trustMethods')}</li>
                  <li className="flex items-center gap-2"><Info size={12} className="flex-none text-deep-green" /> {t('trustRefund')}</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Sticky bottom CTA — above BottomNav ──────────── */}
      <div className="fixed inset-x-0 bottom-16 md:bottom-0 bg-coconut/97 backdrop-blur-md border-t border-mist z-[60]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Price summary */}
          <div className="min-w-0 flex-none">
            {canBook ? (
              <>
                <p className="text-base font-semibold text-charcoal leading-tight">
                  {fmt.price(total)}
                </p>
                <p className="text-[11px] text-stone">
                  {t('guestsShort', { count: guests })} · {selectedTime}
                </p>
              </>
            ) : (
              <>
                <p className="text-[11px] text-stone">{t('from')}</p>
                <p className="text-base font-semibold text-charcoal leading-tight">
                  {fmt.price(service.price_cents)}
                  <span className="text-xs font-normal text-stone"> {t('perPersonShort')}</span>
                </p>
              </>
            )}
          </div>

          {/* CTA */}
          <div className="flex-1">
            {!showPayment ? (
              <Button
                fullWidth
                size="lg"
                variant="primary"
                disabled={!canBook}
                onClick={() => void startPayment()}
              >
                {canBook ? t('book') : t('pickDate')}
              </Button>
            ) : (
              <Button
                fullWidth
                size="lg"
                variant="coral"
                loading={payBusy}
                disabled={!clientSecret || intentLoading}
                onClick={() => void payRef.current?.()}
              >
                {t('pay', { price: fmt.price(total) })}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
