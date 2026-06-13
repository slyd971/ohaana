'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from '@/lib/i18n/navigation'
import { ChevronLeft, Check, Calendar, Clock, Users, FileText, CreditCard, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getServiceById } from '@/lib/data/seed'
import { formatPrice, computeFees, cn } from '@/lib/utils'

const STEPS = [
  { key: 'date',    label: 'Date',     Icon: Calendar },
  { key: 'time',    label: 'Heure',    Icon: Clock },
  { key: 'guests',  label: 'Détails',  Icon: Users },
  { key: 'notes',   label: 'Notes',    Icon: FileText },
  { key: 'payment', label: 'Paiement', Icon: CreditCard },
  { key: 'confirm', label: 'Confirmé', Icon: CheckCircle2 },
]

const TIMES = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '18:00', '19:00', '20:00']

function getDates() {
  const dates: Date[] = []
  for (let i = 1; i <= 14; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    dates.push(d)
  }
  return dates
}

const formatDateShort = (d: Date) =>
  d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })

export default function ReservationPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = use(params)
  const service = getServiceById(serviceId)
  if (!service) notFound()

  const [step, setStep] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [guests, setGuests] = useState(service.capacity_min)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const total = service.price_cents * guests
  const { platformFee } = computeFees(total)
  const cover = service.images.find((i) => i.is_cover) ?? service.images[0]

  const dates = getDates()

  async function handlePayment() {
    setLoading(true)
    // Simulated payment — in production: create Stripe PaymentIntent via API
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
    setStep(5)
  }

  const canAdvance = [
    !!selectedDate,
    !!selectedTime,
    guests >= service.capacity_min && guests <= service.capacity_max,
    true,
    true,
    true,
  ][step]

  const slide = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }

  return (
    <div className="min-h-dvh bg-coconut">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-coconut/95 backdrop-blur-md border-b border-mist">
        <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
          {step < 5 ? (
            <button type="button" onClick={() => step > 0 ? setStep(s => s - 1) : undefined} className="p-1.5 -ml-1 text-charcoal">
              <ChevronLeft size={22} />
            </button>
          ) : null}
          <div className="flex-1">
            <p className="text-xs text-stone">{step < 5 ? `Étape ${step + 1} / 5` : 'Réservation confirmée !'}</p>
            <p className="text-sm font-medium text-charcoal truncate">{service.title_fr}</p>
          </div>
        </div>

        {/* Progress bar */}
        {step < 5 && (
          <div className="h-0.5 bg-mist">
            <motion.div
              className="h-full bg-deep-green"
              animate={{ width: `${((step + 1) / 5) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Step icons */}
        {step < 5 && (
          <div className="flex justify-center gap-1 pb-2 pt-1 px-4">
            {STEPS.slice(0, 5).map(({ key, label, Icon }, i) => (
              <div key={key} className={cn('flex items-center gap-1', i < STEPS.length - 2 && 'flex-1')}>
                <div className={cn(
                  'flex flex-col items-center gap-0.5 flex-none',
                )}>
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors',
                    i < step ? 'bg-deep-green text-coconut' : i === step ? 'bg-deep-green/15 text-deep-green border border-deep-green' : 'bg-mist text-stone'
                  )}>
                    {i < step ? <Check size={12} /> : <Icon size={12} />}
                  </div>
                  <span className={cn('text-[9px] font-medium', i === step ? 'text-deep-green' : 'text-stone')}>{label}</span>
                </div>
                {i < 4 && <div className="flex-1 h-px bg-mist mx-1 mb-3" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <AnimatePresence mode="wait">
          {/* Step 0 — Date */}
          {step === 0 && (
            <motion.div key="date" {...slide} className="space-y-4">
              <h2 className="text-xl font-display text-charcoal">Choisissez une date</h2>
              <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {dates.map((d) => (
                  <button
                    key={d.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(d)}
                    className={cn(
                      'flex-none flex flex-col items-center px-4 py-3 rounded-2xl border-2 transition-all min-w-[80px]',
                      selectedDate?.toDateString() === d.toDateString()
                        ? 'border-deep-green bg-deep-green/5 text-deep-green'
                        : 'border-mist bg-surface text-charcoal hover:border-stone'
                    )}
                  >
                    <span className="text-xs capitalize">{formatDateShort(d).split(' ')[0]}</span>
                    <span className="text-2xl font-display">{d.getDate()}</span>
                    <span className="text-xs capitalize">{formatDateShort(d).split(' ')[2]}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 1 — Time */}
          {step === 1 && (
            <motion.div key="time" {...slide} className="space-y-4">
              <h2 className="text-xl font-display text-charcoal">Choisissez un créneau</h2>
              <p className="text-sm text-stone">{selectedDate ? formatDateShort(selectedDate) : ''}</p>
              <div className="grid grid-cols-3 gap-2.5">
                {TIMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTime(t)}
                    className={cn(
                      'py-3 rounded-xl border-2 text-sm font-medium transition-all',
                      selectedTime === t
                        ? 'border-deep-green bg-deep-green/5 text-deep-green'
                        : 'border-mist bg-surface text-charcoal hover:border-stone'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2 — Guests */}
          {step === 2 && (
            <motion.div key="guests" {...slide} className="space-y-6">
              <h2 className="text-xl font-display text-charcoal">Combien de personnes ?</h2>
              <div className="flex items-center justify-between bg-surface border border-mist rounded-2xl p-4">
                <div>
                  <p className="font-medium text-charcoal">Nombre de participants</p>
                  <p className="text-sm text-stone">{service.capacity_min} – {service.capacity_max} personnes</p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setGuests((g) => Math.max(service.capacity_min, g - 1))}
                    className="w-9 h-9 rounded-full border-2 border-mist flex items-center justify-center text-charcoal font-medium hover:border-deep-green transition-colors"
                  >
                    −
                  </button>
                  <span className="text-xl font-semibold text-charcoal w-6 text-center">{guests}</span>
                  <button
                    type="button"
                    onClick={() => setGuests((g) => Math.min(service.capacity_max, g + 1))}
                    className="w-9 h-9 rounded-full border-2 border-mist flex items-center justify-center text-charcoal font-medium hover:border-deep-green transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              {/* Price update */}
              <div className="bg-sand rounded-2xl p-4 space-y-1">
                <div className="flex justify-between text-sm text-stone">
                  <span>{formatPrice(service.price_cents)} × {guests} pers.</span>
                  <span>{formatPrice(service.price_cents * guests)}</span>
                </div>
                <div className="flex justify-between text-sm text-stone">
                  <span>Frais de service</span>
                  <span>{formatPrice(platformFee)}</span>
                </div>
                <div className="flex justify-between font-semibold text-charcoal pt-1 border-t border-mist mt-1">
                  <span>Total</span>
                  <span>{formatPrice(total + platformFee)}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Notes */}
          {step === 3 && (
            <motion.div key="notes" {...slide} className="space-y-4">
              <h2 className="text-xl font-display text-charcoal">Demandes spéciales</h2>
              <p className="text-sm text-stone">Allergies, préférences, occasion particulière…</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: anniversaire de mariage, allergie aux fruits de mer, végétarien…"
                rows={5}
                className="w-full rounded-2xl border border-mist bg-surface px-4 py-3 text-sm text-charcoal placeholder:text-stone focus:outline-none focus:border-deep-green focus:ring-2 focus:ring-deep-green/15 resize-none"
              />
              <p className="text-xs text-stone">Optionnel — le prestataire répondra avant confirmation.</p>
            </motion.div>
          )}

          {/* Step 4 — Payment */}
          {step === 4 && (
            <motion.div key="payment" {...slide} className="space-y-5">
              <h2 className="text-xl font-display text-charcoal">Paiement sécurisé</h2>

              {/* Summary card */}
              <div className="flex gap-3 bg-surface border border-mist rounded-2xl p-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-none">
                  <Image src={cover?.url ?? ''} alt={service.title_fr} fill className="object-cover" sizes="64px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal line-clamp-2">{service.title_fr}</p>
                  <p className="text-xs text-stone mt-0.5">
                    {selectedDate ? formatDateShort(selectedDate) : ''} · {selectedTime} · {guests} pers.
                  </p>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="bg-sand rounded-2xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-stone">
                  <span>{formatPrice(service.price_cents)} × {guests} pers.</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-stone">
                  <span>Frais de service (20%)</span>
                  <span>{formatPrice(platformFee)}</span>
                </div>
                <div className="flex justify-between font-semibold text-charcoal pt-2 border-t border-mist">
                  <span>Total à payer</span>
                  <span className="text-base">{formatPrice(total + platformFee)}</span>
                </div>
              </div>

              {/* Stripe mock */}
              <div className="space-y-3">
                <Input label="Numéro de carte" placeholder="1234 5678 9012 3456" />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Expiration" placeholder="MM / AA" />
                  <Input label="CVC" placeholder="123" />
                </div>
                <Input label="Nom sur la carte" placeholder="SOPHIE MARTIN" />
              </div>

              <div className="flex items-center gap-2 text-xs text-stone">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <rect x="1" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M5 4V3a2 2 0 1 1 4 0v1" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                Paiement sécurisé par Stripe. Débité uniquement après confirmation.
              </div>

              {/* Apple/Google Pay mock */}
              <div className="flex gap-2">
                <button type="button" className="flex-1 h-11 bg-black text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                  <span>🍎</span> Apple Pay
                </button>
                <button type="button" className="flex-1 h-11 bg-surface border border-mist rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                  <span>G</span> Google Pay
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5 — Confirmed */}
          {step === 5 && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
                className="w-20 h-20 rounded-full bg-deep-green/10 flex items-center justify-center mx-auto"
              >
                <CheckCircle2 size={40} className="text-deep-green" />
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-2xl font-display text-charcoal">Réservation confirmée&nbsp;!</h2>
                <p className="text-stone text-sm max-w-xs mx-auto">
                  Vous recevrez une confirmation par email sous quelques minutes.
                </p>
              </div>

              <div className="bg-sand rounded-2xl p-4 text-left space-y-2 text-sm max-w-xs mx-auto">
                <div className="flex justify-between">
                  <span className="text-stone">Service</span>
                  <span className="text-charcoal font-medium text-right max-w-[60%] line-clamp-1">{service.title_fr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone">Date</span>
                  <span className="text-charcoal">{selectedDate ? formatDateShort(selectedDate) : ''} · {selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone">Participants</span>
                  <span className="text-charcoal">{guests} personne{guests > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between font-semibold pt-1 border-t border-mist">
                  <span className="text-charcoal">Total payé</span>
                  <span className="text-charcoal">{formatPrice(total + platformFee)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 max-w-xs mx-auto w-full">
                <Link href="/voyages"><Button fullWidth>Voir mes réservations</Button></Link>
                <Link href="/"><Button fullWidth variant="ghost">Retour à l'accueil</Button></Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA flottant */}
        {step < 5 && (
          <div className="sticky bottom-4 mt-8">
            <Button
              fullWidth
              size="lg"
              variant={step === 4 ? 'coral' : 'primary'}
              disabled={!canAdvance}
              loading={loading}
              onClick={step === 4 ? handlePayment : () => setStep((s) => s + 1)}
            >
              {step === 4 ? `Payer ${formatPrice(total + platformFee)}` : 'Continuer'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
