'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import { MessageCircle, Search, CalendarDays, MapPin, ChevronRight } from 'lucide-react'
import { Link, useRouter } from '@/lib/i18n/navigation'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import type { ServiceView } from '@/lib/data/types'
import { WHATSAPP_NUMBER } from '@/lib/site'

const CONCIERGE_PHOTO = '/photos/concierge-antillaise.png'

type Lang = 'fr' | 'en' | 'es'

const COPY = {
  eyebrow: { fr: 'Concierge Ohaana', en: 'Ohaana concierge', es: 'Concierge Ohaana' },
  title: {
    fr: 'Dites-nous ce qu\'il vous faut, on s\'occupe du reste.',
    en: 'Tell us what you need, we take care of the rest.',
    es: 'Dinos qué necesitas, nosotros nos ocupamos del resto.',
  },
  subtitle: {
    fr: 'Services locaux vérifiés, adaptés à votre hébergement et à vos dates.',
    en: 'Verified local services, matched to your accommodation and dates.',
    es: 'Servicios locales verificados, adaptados a tu alojamiento y a tus fechas.',
  },
  what: { fr: 'Quel service souhaitez-vous réserver ?', en: 'Which service would you like to book?', es: '¿Qué servicio quieres reservar?' },
  whatPh: {
    fr: 'Ex : massage à domicile demain, chef privé vendredi soir, baby-sitter pour deux enfants…',
    en: 'E.g. a massage tomorrow, a private chef on Friday night, a babysitter for two kids…',
    es: 'Ej.: masaje mañana, chef privado el viernes por la noche, niñera para dos niños…',
  },
  dates: { fr: 'Dates du séjour', en: 'Stay dates', es: 'Fechas de la estancia' },
  datesPh: { fr: 'Ajouter des dates', en: 'Add dates', es: 'Añadir fechas' },
  place: { fr: 'Lieu de séjour', en: 'Where you stay', es: 'Lugar de estancia' },
  placePh: { fr: 'Ex : villa à Deshaies', en: 'E.g. villa in Deshaies', es: 'Ej.: villa en Deshaies' },
  contact: { fr: 'Votre email ou WhatsApp', en: 'Your email or WhatsApp', es: 'Tu email o WhatsApp' },
  contactPh: { fr: 'Pour vous répondre', en: 'So we can reply', es: 'Para responderte' },
  privacy: {
    fr: 'Ces informations servent uniquement à répondre à votre demande.',
    en: 'This information is only used to answer your request.',
    es: 'Esta información solo se usa para responder a tu solicitud.',
  },
  ideas: { fr: 'Idées populaires', en: 'Popular ideas', es: 'Ideas populares' },
  suggestions: {
    fr: ['Un massage à domicile', 'Un chef privé', 'Je voyage avec deux enfants', 'Un DJ pour notre soirée en terrasse', 'Un photographe près de notre villa'],
    en: ['A massage at home', 'A private chef', 'I\'m travelling with two kids', 'A DJ for our terrace party', 'A photographer near our villa'],
    es: ['Un masaje a domicilio', 'Un chef privado', 'Viajo con dos niños', 'Un DJ para nuestra fiesta en la terraza', 'Un fotógrafo cerca de nuestra villa'],
  },
  ctaWhatsApp: { fr: 'Envoyer à Camille sur WhatsApp', en: 'Send to Camille on WhatsApp', es: 'Enviar a Camille por WhatsApp' },
  ctaSearch: { fr: 'Voir les services', en: 'See services', es: 'Ver servicios' },
  orSearch: { fr: 'Ou parcourir directement les services', en: 'Or browse the services directly', es: 'O explorar los servicios directamente' },
  reply: { fr: 'Réponse en moins de 2h', en: 'Reply within 2 hours', es: 'Respuesta en menos de 2 h' },
  popular: { fr: 'Services populaires', en: 'Popular services', es: 'Servicios populares' },
  seeAll: { fr: 'Voir tout', en: 'See all', es: 'Ver todo' },
  how: { fr: 'Comment ça marche', en: 'How it works', es: 'Cómo funciona' },
  steps: {
    fr: [
      ['Décrivez votre envie', 'Plus c\'est précis, mieux c\'est.'],
      ['On trouve les bons prestataires', 'Disponibilités, lieu, profil voyageur.'],
      ['Réservez en quelques minutes', 'Le service vient directement à vous.'],
    ],
    en: [
      ['Describe what you want', 'The more precise, the better.'],
      ['We find the right providers', 'Availability, location, traveller profile.'],
      ['Book in a few minutes', 'The service comes straight to you.'],
    ],
    es: [
      ['Describe lo que quieres', 'Cuanto más preciso, mejor.'],
      ['Encontramos a los prestadores adecuados', 'Disponibilidad, lugar, perfil del viajero.'],
      ['Reserva en unos minutos', 'El servicio va directamente a ti.'],
    ],
  },
} as const

interface ConciergeClientProps {
  recommendations: ServiceView[]
}

export function ConciergeClient({ recommendations }: ConciergeClientProps) {
  const locale = useLocale()
  const lang: Lang = locale === 'en' || locale === 'es' ? locale : 'fr'
  const c = <K extends keyof typeof COPY>(k: K) => COPY[k][lang] as (typeof COPY)[K][Lang]
  const router = useRouter()

  const [message, setMessage] = useState('')
  const [stayStart, setStayStart] = useState<Date | null>(null)
  const [stayEnd, setStayEnd] = useState<Date | null>(null)
  const [location, setLocation] = useState('')
  const [contact, setContact] = useState('')

  const fmt = (d: Date) => d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const stayDates = stayStart ? (stayEnd && stayEnd.getTime() !== stayStart.getTime() ? `${fmt(stayStart)} → ${fmt(stayEnd)}` : fmt(stayStart)) : ''

  const fullMessage = [
    message.trim(),
    stayDates.trim() && `${c('dates')} : ${stayDates.trim()}`,
    location.trim() && `${c('place')} : ${location.trim()}`,
  ].filter(Boolean).join('\n')

  function openSearch() {
    const q = message.trim()
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Record the request for the team (best effort: the visitor is never blocked by a storage error).
    void fetch('/api/concierge-requests', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: message.trim(),
        stayDates: stayDates.trim() || undefined,
        location: location.trim() || undefined,
        contact: contact.trim(),
        locale: lang,
      }),
      keepalive: true,
    }).catch(() => {})

    if (WHATSAPP_NUMBER) {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(fullMessage)}`, '_blank', 'noopener,noreferrer')
    } else {
      openSearch()
    }
  }

  const field =
    'w-full rounded-2xl border border-mist bg-white px-4 text-sm text-charcoal placeholder:text-stone focus:border-deep-green focus:outline-none focus:ring-2 focus:ring-deep-green/15'
  const steps = c('steps')
  const title = (s: ServiceView) => (lang === 'en' ? s.title_en : lang === 'es' ? s.title_es : s.title_fr) || s.title_fr

  return (
    <div className="min-h-screen bg-coconut pt-16">
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-10 md:px-8 md:pt-16">
        {/* Header */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-10 max-w-2xl text-center md:mb-14"
        >
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-turquoise-text">{c('eyebrow')}</p>
          <h1 className="mt-4 font-display text-3xl leading-[1.15] text-deep-green md:text-5xl">{c('title')}</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-charcoal/70 md:text-lg">{c('subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Request form */}
          <motion.form
            initial={{ y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-5 rounded-3xl border border-mist bg-white p-6 shadow-card md:p-8 lg:col-span-7"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 flex-none overflow-hidden rounded-full border-2 border-coconut shadow-card">
                <Image src={CONCIERGE_PHOTO} alt="Camille, concierge Ohaana" fill className="object-cover" sizes="48px" />
              </div>
              <div>
                <p className="text-sm font-semibold text-deep-green">Camille</p>
                <p className="flex items-center gap-1.5 text-xs text-charcoal/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-turquoise" aria-hidden="true" />
                  {c('reply')}
                </p>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-charcoal">{c('what')}</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={c('whatPh')}
                rows={4}
                required
                className={`${field} resize-none py-3`}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="block">
                <span className="mb-2 flex items-center gap-1.5 text-sm font-medium text-charcoal">
                  <CalendarDays size={14} /> {c('dates')}
                </span>
                <DateRangePicker
                  startDate={stayStart}
                  endDate={stayEnd}
                  onChange={(a, b) => { setStayStart(a); setStayEnd(b) }}
                  placeholder={c('datesPh')}
                />
              </div>
              <label className="block">
                <span className="mb-2 flex items-center gap-1.5 text-sm font-medium text-charcoal">
                  <MapPin size={14} /> {c('place')}
                </span>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={c('placePh')} className={`${field} h-12`} />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-charcoal">{c('contact')}</span>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={c('contactPh')}
                required
                minLength={3}
                maxLength={254}
                autoComplete="email"
                className={`${field} h-12`}
              />
              <span className="mt-1.5 block text-xs text-charcoal-soft">{c('privacy')}</span>
            </label>

            <div>
              <p className="mb-2 text-xs text-charcoal/70">{c('ideas')}</p>
              <div className="flex flex-wrap gap-2">
                {c('suggestions').map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setMessage(s)}
                    className="min-h-9 rounded-full border border-mist bg-coconut px-3.5 text-xs text-charcoal transition-colors hover:border-deep-green hover:text-deep-green"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <button
                type="submit"
                disabled={!message.trim() || contact.trim().length < 3}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-deep-green text-sm font-medium text-coconut transition-colors hover:bg-coral disabled:cursor-not-allowed disabled:opacity-50"
              >
                {WHATSAPP_NUMBER ? <MessageCircle size={18} /> : <Search size={18} />}
                {WHATSAPP_NUMBER ? c('ctaWhatsApp') : c('ctaSearch')}
              </button>
              {WHATSAPP_NUMBER && (
                <button
                  type="button"
                  onClick={openSearch}
                  className="flex min-h-11 w-full items-center justify-center text-sm text-charcoal/70 underline-offset-4 hover:text-deep-green hover:underline"
                >
                  {c('orSearch')}
                </button>
              )}
            </div>
          </motion.form>

          {/* Side column */}
          <div className="space-y-8 lg:col-span-5">
            <motion.section initial={{ y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-xl text-deep-green">{c('popular')}</h2>
                <Link href="/search" className="flex min-h-11 items-center gap-0.5 text-sm font-medium text-deep-green">
                  {c('seeAll')} <ChevronRight size={15} />
                </Link>
              </div>
              <div className="space-y-2.5">
                {recommendations.slice(0, 4).map((service) => {
                  const img = (service.images.find((i) => i.is_cover) ?? service.images[0])?.url
                  return (
                    <Link
                      key={service.id}
                      href={`/prestataires/${service.id}`}
                      className="flex items-center gap-3 rounded-2xl border border-mist bg-white p-3 transition-colors hover:border-deep-green/40"
                    >
                      <div className="relative h-16 w-16 flex-none overflow-hidden rounded-xl bg-sand">
                        {img && <Image src={img} alt={title(service)} fill className="object-cover" sizes="64px" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-charcoal">{title(service)}</p>
                        <p className="truncate text-xs text-charcoal/70">{service.provider.business_name}</p>
                      </div>
                      <span className="flex-none text-sm font-semibold text-deep-green">
                        {Math.round(service.price_cents / 100)} €
                      </span>
                    </Link>
                  )
                })}
              </div>
            </motion.section>

            <motion.section initial={false} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <h2 className="mb-4 font-display text-xl text-deep-green">{c('how')}</h2>
              <ol className="space-y-4">
                {steps.map(([t, d], i) => (
                  <li key={t} className="flex items-start gap-4">
                    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-deep-green text-sm font-semibold text-coconut">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-deep-green">{t}</p>
                      <p className="text-xs text-charcoal/70">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  )
}
