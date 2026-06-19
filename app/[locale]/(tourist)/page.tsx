'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { HeroSection } from '@/components/home/HeroSection'
import { ServiceRow } from '@/components/home/ServiceRow'
import { ServiceCard } from '@/components/service/ServiceCard'
import { Testimonials } from '@/components/home/Testimonials'
import { type IslandFilter } from '@/components/home/IslandSelector'
import { MoodSelector } from '@/components/home/MoodSelector'
import { SERVICES, HOME_ROWS, getServicesByIds } from '@/lib/data/seed'
import {
  Clock, Sparkles, Leaf, MessageCircle,
  Building2, ChevronRight, Mail, CheckCircle,
} from 'lucide-react'

const WHY_ITEMS = [
  {
    icon: Leaf,
    title: 'Sélection locale',
    text: 'Nos prestataires sont sélectionnés pour la qualité de leur service et leur connaissance du territoire.',
  },
  {
    icon: Clock,
    title: 'Gain de temps',
    text: 'Réservez en quelques minutes, nous nous occupons du reste.',
  },
  {
    icon: Sparkles,
    title: 'Expériences premium',
    text: 'Des prestations soigneusement sélectionnées pour rendre votre séjour inoubliable.',
  },
  {
    icon: MessageCircle,
    title: 'Support local',
    text: 'Besoin d\'un conseil, d\'une modification ou d\'une réservation ? Notre équipe locale est disponible pendant votre séjour.',
  },
]

const WHY_ITEMS_EN = [
  {
    icon: Leaf,
    title: 'Locally selected',
    text: 'Our providers are selected for the quality of their service and their knowledge of the territory.',
  },
  {
    icon: Clock,
    title: 'Time saved',
    text: 'Book in just a few minutes, and we take care of the rest.',
  },
  {
    icon: Sparkles,
    title: 'Premium experiences',
    text: 'Carefully selected services designed to make your stay unforgettable.',
  },
  {
    icon: MessageCircle,
    title: 'Local support',
    text: 'Need advice, a change, or a booking? Our local team is available during your stay.',
  },
]

const DESTINATIONS = [
  'Guadeloupe', 'Martinique', 'Saint-Martin', 'Saint-Barth',
  'Dominique', 'Autre île', 'Pas encore décidé',
]

const DESTINATIONS_EN = [
  'Guadeloupe', 'Martinique', 'Saint-Martin', 'Saint-Barth',
  'Dominica', 'Another island', 'Not decided yet',
]

const WHY_ITEMS_ES = [
  {
    icon: Leaf,
    title: 'Selección local',
    text: 'Nuestros proveedores son seleccionados por la calidad de su servicio y su conocimiento del territorio.',
  },
  {
    icon: Clock,
    title: 'Tiempo ganado',
    text: 'Reserva en pocos minutos y nosotros nos encargamos del resto.',
  },
  {
    icon: Sparkles,
    title: 'Experiencias premium',
    text: 'Servicios cuidadosamente seleccionados para que tu estancia sea inolvidable.',
  },
  {
    icon: MessageCircle,
    title: 'Soporte local',
    text: '¿Necesitas consejo, una modificación o una reserva? Nuestro equipo local está disponible durante tu estancia.',
  },
]

const DESTINATIONS_ES = [
  'Guadalupe', 'Martinica', 'Saint-Martin', 'Saint-Barth',
  'Dominica', 'Otra isla', 'Aún no decidido',
]

const MOOD_FILTER: Record<string, string[]> = {
  wellness: ['bien-être', 'spa', 'relaxation'],
  soiree:   ['soirée', 'villa', 'coucher de soleil'],
  food:     ['gastronomie', 'cuisine'],
  culture:  ['culture', 'créole'],
  couples:  ['couple', 'romantique'],
}

function getInitialHomeState() {
  if (typeof window === 'undefined') {
    return {
      island: 'all' as IslandFilter,
      stayStart: null as Date | null,
      stayEnd: null as Date | null,
    }
  }

  try {
    const savedIsland = sessionStorage.getItem('ohaana_island')
    const s = sessionStorage.getItem('ohaana_stay_start')
    const e = sessionStorage.getItem('ohaana_stay_end')
    const start = s ? new Date(s) : null
    const end = e ? new Date(e) : null

    return {
      island: (savedIsland || 'all') as IslandFilter,
      stayStart: start && !isNaN(start.getTime()) ? start : null,
      stayEnd: end && !isNaN(end.getTime()) ? end : null,
    }
  } catch {
    return {
      island: 'all' as IslandFilter,
      stayStart: null as Date | null,
      stayEnd: null as Date | null,
    }
  }
}

export default function HomePage() {
  const locale = useLocale()
  const L = (fr: string, en: string, es: string) =>
    locale === 'en' ? en : locale === 'es' ? es : fr
  const whyItems = locale === 'en' ? WHY_ITEMS_EN : locale === 'es' ? WHY_ITEMS_ES : WHY_ITEMS
  const destinations = locale === 'en' ? DESTINATIONS_EN : locale === 'es' ? DESTINATIONS_ES : DESTINATIONS
  const [initialHomeState] = useState(getInitialHomeState)
  const [island, setIsland]       = useState<IslandFilter>(initialHomeState.island)
  const [mood, setMood]           = useState<string>('all')
  const [stayStart, setStayStart] = useState<Date | null>(initialHomeState.stayStart)
  const [stayEnd, setStayEnd]     = useState<Date | null>(initialHomeState.stayEnd)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [showAllExplorer, setShowAllExplorer] = useState(false)

  // Lead capture state
  const [leadEmail, setLeadEmail]   = useState('')
  const [leadDest, setLeadDest]     = useState('')
  const [leadWA, setLeadWA]         = useState('')
  const [leadSent, setLeadSent]     = useState(false)

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Zone 1  - Explorer : tous les services filtrés par île + humeur
  const explorerServices = (() => {
    let svcs = [...SERVICES]
    if (island !== 'all') svcs = svcs.filter(s => s.island === island)
    if (mood !== 'all') {
      const kw = MOOD_FILTER[mood] ?? []
      svcs = svcs.filter(s => kw.some(k => s.tags.some(t => t.includes(k))))
    }
    return svcs
  })()

  // Zone 2  - Éditorial : ids curatés, filtrés par île uniquement
  function editorialServices(ids: string[]) {
    let svcs = getServicesByIds(ids)
    if (island !== 'all') svcs = svcs.filter(s => s.island === island)
    return svcs
  }

  const rowPopular = HOME_ROWS.find(r => r.key === 'popular')
  const rowTonight = HOME_ROWS.find(r => r.key === 'tonight')
  const featuredServices = (() => {
    return editorialServices(rowPopular?.ids ?? []).slice(0, 6)
  })()
  const visibleExplorerServices = showAllExplorer ? explorerServices : explorerServices.slice(0, 8)
  const hasMoreExplorerServices = explorerServices.length > visibleExplorerServices.length

  function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = { email: leadEmail, destination: leadDest, whatsapp: leadWA, ts: new Date().toISOString() }
    console.log('[Ohaana lead]', data)
    try { localStorage.setItem('ohaana_lead', JSON.stringify(data)) } catch {}
    setLeadSent(true)
  }

  return (
    <div className="bg-coconut pb-20 md:pb-0">

      {/* '- -' 1. Hero '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -' */}
      <HeroSection
        island={island}
        onIslandChange={(v) => {
          setIsland(v)
          setShowAllExplorer(false)
          try { sessionStorage.setItem('ohaana_island', v) } catch {}
        }}
        stayStart={stayStart}
        stayEnd={stayEnd}
        onDatesChange={(s, e) => {
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

      {/* '- -' 2. Pourquoi Ohaana '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -' */}
      <section className="border-y border-mist/70 bg-[#F7F7F4]">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="mb-6 md:mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-display text-charcoal">
              {L('Pourquoi réserver avec Ohaana ?', 'Why book with Ohaana?', '¿Por qué reservar con Ohaana?')}
            </h2>
            <p className="mt-2 max-w-2xl text-sm md:text-base text-stone leading-relaxed">
              {L(
                'La simplicité d\'un concierge, pensée pour les voyageurs en villa, bungalow, Airbnb ou maison de vacances.',
                'The ease of a concierge, designed for travelers staying in villas, bungalows, Airbnbs, or vacation homes.',
                'La facilidad de un conserje, pensada para viajeros en villas, bungalows, Airbnb o casas de vacaciones.'
              )}
            </p>
          </motion.div>
          <div className="space-y-4 sm:space-y-0">
            <div
              className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-1 scroll-snap-x sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-8 sm:overflow-visible sm:px-0 sm:pb-0 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {whyItems.map(({ icon: Icon, title, text }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="w-[calc(100vw-2.5rem)] flex-none rounded-2xl border border-mist/80 bg-white p-5 shadow-card space-y-3 sm:w-auto sm:min-w-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none"
                >
                  <div className="flex h-12 w-12 items-center justify-center sm:h-11 sm:w-11">
                    <Icon size={34} strokeWidth={1.7} className="text-charcoal sm:size-8" />
                  </div>
                  <h3 className="font-semibold text-charcoal text-base sm:text-sm">{title}</h3>
                  <p className="text-sm text-stone leading-relaxed">{text}</p>
                </motion.div>
              ))}
              <div className="w-1 flex-none sm:hidden" />
            </div>
            <div className="flex justify-center gap-1.5 sm:hidden" aria-hidden="true">
              {whyItems.map((item) => (
                <span key={item.title} className="h-1.5 w-1.5 rounded-full bg-charcoal/35" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* '- -' Zone 1 : Explorer '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -' */}
      <section className="px-5 md:px-8 pt-8 pb-4 max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <h2 className="text-xl md:text-2xl font-display text-charcoal">
            {L('Explorer par catégorie', 'Explore by category', 'Explorar por categoría')}
          </h2>
          <p className="mt-1.5 text-sm text-stone">
            {L(
              "Choisissez le type d'expérience que vous recherchez.",
              'Choose the type of experience you are looking for.',
              'Elige el tipo de experiencia que buscas.'
            )}
          </p>
        </div>
      </section>
      <div className="sticky top-16 z-20 bg-coconut/96 backdrop-blur-md border-b border-mist pt-2 pb-2">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <MoodSelector
            value={mood}
            onChange={(nextMood) => {
              setMood(nextMood)
              setShowAllExplorer(false)
            }}
          />
        </div>
      </div>
      <div className="pt-8 pb-8 px-5 md:px-8 max-w-7xl mx-auto">
        <motion.div
          key={mood + island}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {explorerServices.length === 0 ? (
            <p className="text-center text-stone py-16 text-sm">
              {L('Aucun service disponible pour cette sélection.', 'No service available for this selection.', 'Ningún servicio disponible para esta selección.')}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {visibleExplorerServices.map(s => (
                <ServiceCard
                  key={s.id}
                  service={s}
                  isFavorite={favorites.has(s.id)}
                  onToggleFavorite={toggleFavorite}
                  className="w-full"
                />
              ))}
            </div>
          )}
          {hasMoreExplorerServices && (
            <div className="flex justify-center pt-7">
              <button
                type="button"
                onClick={() => setShowAllExplorer(true)}
                className="inline-flex items-center justify-center rounded-full border border-mist bg-coconut px-5 py-2.5 text-sm font-medium text-deep-green transition-colors hover:border-deep-green/40 hover:bg-sand"
              >
                {L('Voir plus', 'See more', 'Ver más')}
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Rappel concierge */}
      <div className="px-5 md:px-8 pb-16 md:pb-20 max-w-7xl mx-auto">
        <div className="rounded-2xl border border-deep-green/15 bg-deep-green/5 px-5 py-4 flex items-center gap-4">
          <span className="relative flex h-2.5 w-2.5 flex-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-turquoise opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-turquoise" />
          </span>
          <p className="text-sm text-deep-green flex-1 leading-snug">
            <span className="font-semibold">{L('Vous ne savez pas quoi choisir ?', 'Not sure what to choose?', '¿No sabes qué elegir?')}</span>{' '}
            {L(
              'Décrivez votre séjour, nous vous orientons vers les bons prestataires locaux.',
              'Tell us about your stay, and we will point you to the right local providers.',
              'Cuéntanos tu estancia y te orientamos hacia los proveedores locales adecuados.'
            )}
          </p>
          <Link
            href="/concierge"
            className="flex-none text-xs font-medium bg-deep-green text-coconut px-3.5 py-2 rounded-full hover:bg-coral transition-colors whitespace-nowrap"
          >
            {L('Demander conseil', 'Ask for advice', 'Pedir consejo')}
          </Link>
        </div>
      </div>

      {/* '- -' Zone 2 : Ce soir '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -' */}
      {rowTonight && (
        <div className="pb-14 max-w-7xl mx-auto md:px-8">
          <ServiceRow
            title={L(rowTonight.label_fr, rowTonight.label_en, 'Disponible esta noche')}
            services={editorialServices(rowTonight.ids)}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            seeAllHref="/search"
          />
        </div>
      )}

      {/* '- -' Zone 3 : Sélections éditoriales '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -' */}
      <section className="px-5 md:px-8 pt-2 pb-6 max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <h2 className="text-xl md:text-2xl font-display text-charcoal">
            {L('Les incontournables', 'Essential picks', 'Imprescindibles')}
          </h2>
          <p className="mt-1.5 text-sm text-stone">
            {L(
              'Les services les plus réservés par les voyageurs en hébergement privatif.',
              'The services most booked by travelers in private accommodation.',
              'Los servicios más reservados por viajeros en alojamientos privados.'
            )}
          </p>
        </div>
      </section>
      <div className="px-5 md:px-8 pb-14 max-w-7xl mx-auto">
        <div className="space-y-3 sm:space-y-0">
          <div
            className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-1 scroll-snap-x sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 lg:gap-6 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {featuredServices.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="w-[82vw] max-w-[21rem] flex-none sm:w-auto sm:max-w-none sm:min-w-0"
              >
                <ServiceCard
                  service={service}
                  isFavorite={favorites.has(service.id)}
                  onToggleFavorite={toggleFavorite}
                  size="lg"
                  className="w-full"
                />
              </motion.div>
            ))}
            <div className="w-1 flex-none sm:hidden" />
          </div>
          <div className="flex justify-center gap-1.5 sm:hidden" aria-hidden="true">
            {featuredServices.map((service) => (
              <span key={service.id} className="h-1.5 w-1.5 rounded-full bg-charcoal/35" />
            ))}
          </div>
        </div>
      </div>

      {/* '- -' 5. Témoignages '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -' */}
      <Testimonials />

      {/* '- -' 7. Concierge  - filet de sécurité '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -' */}
      <section className="mx-5 md:mx-8 mb-10 rounded-3xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, var(--deep-green) 0%, #0F2B1D 100%)' }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FDFAF4' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='37' cy='37' r='1'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="relative grid min-h-[34rem] md:min-h-[28rem] md:grid-cols-[minmax(0,1fr)_minmax(20rem,0.95fr)]">
          <div className="flex flex-col justify-center px-6 py-10 text-center md:px-10 md:py-14 md:text-left lg:px-14">
            <div className="mx-auto max-w-xl space-y-5 md:mx-0">
              <span className="inline-flex items-center gap-2 bg-coconut/10 border border-coconut/15 text-coconut/80 text-xs px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-turquoise animate-pulse" />
                {L('Réponse en moins de 2h · 7j/7', 'Reply in under 2 hours · 7 days a week', 'Respuesta en menos de 2h · 7 días a la semana')}
              </span>
              <h2 className="text-2xl md:text-3xl font-display text-coconut leading-snug">
                {locale === 'en'
                  ? <>Still unsure or did not<br />find what you need?</>
                  : locale === 'es'
                  ? <>¿Dudas o no encontraste<br />lo que buscas?</>
                  : <>Vous hésitez ou vous n&apos;avez<br />pas trouvé ce que vous cherchez&nbsp;?</>}
              </h2>
              <p className="text-coconut/70 text-sm md:text-base leading-relaxed max-w-sm mx-auto md:mx-0">
                {L(
                  'Dîner privé, massage, baby-sitter, photographe, DJ ou programme complet : Camille vous aide à trouver les bons services autour de votre lieu de séjour.',
                  'Private dinner, massage, babysitter, photographer, DJ, or a full itinerary: Camille helps you find the right services near your place of stay.',
                  'Cena privada, masaje, canguro, fotógrafo, DJ o programa completo: Camille te ayuda a encontrar los servicios adecuados cerca de tu alojamiento.'
                )}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:justify-start">
                <a
                  href="https://wa.me/0000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-coral text-coconut px-6 py-3 rounded-full font-medium text-sm hover:bg-coral-light transition-colors shadow-sm"
                >
                  <MessageCircle size={16} />
                  {L('Parler à Camille', 'Talk to Camille', 'Hablar con Camille')}
                </a>
                <Link
                  href="/concierge"
                  className="inline-flex items-center gap-2 bg-coconut/10 text-coconut border border-coconut/20 px-6 py-3 rounded-full font-medium text-sm hover:bg-coconut/20 transition-colors"
                >
                  {L('Créer mon programme', 'Create my program', 'Crear mi programa')}
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
          <div className="relative min-h-[20rem] md:min-h-full">
            <Image
              src="/photos/concierge-antillaise.png"
              alt={L(
                'Concierge antillaise accueillant des voyageurs dans une villa',
                'Antillean concierge welcoming travelers in a villa',
                'Conserje antillana recibiendo viajeros en una villa'
              )}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep-green/55 via-transparent to-transparent md:bg-gradient-to-r md:from-deep-green/25 md:via-transparent md:to-transparent" />
          </div>
        </div>
      </section>

      {/* '- -' 6. B2B partenaires '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -' */}
      <section id="partner" className="mx-5 md:mx-8 mb-10 rounded-3xl bg-sand border border-mist p-8 md:p-12">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="w-14 h-14 rounded-2xl bg-deep-green flex items-center justify-center flex-none">
            <Building2 size={24} className="text-coconut" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-3">
            <h2 className="text-xl md:text-2xl font-display text-charcoal">
              {L(
                'Vous êtes chef.fe, masseur.se, DJ, photographe ou coach sportif ?',
                'Are you a chef, massage therapist, DJ, photographer, or fitness coach?',
                '¿Eres chef, terapeuta, DJ, fotógrafo o coach de fitness?'
              )}
            </h2>
            <p className="text-sm text-stone leading-relaxed">
              {L(
                'Recevez des demandes de voyageurs en villa, bungalow, Airbnb ou maison de vacances, et proposez vos prestations directement sur leur lieu de séjour.',
                'Receive requests from travelers in villas, bungalows, Airbnbs, or vacation homes, and offer your services directly at their place of stay.',
                'Recibe solicitudes de viajeros en villas, bungalows, Airbnb o casas de vacaciones, y ofrece tus servicios directamente en su alojamiento.'
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-1">
              <Link
                href="/register?role=provider"
                className="inline-flex items-center gap-2 bg-deep-green text-coconut px-5 py-2.5 rounded-full text-sm font-medium hover:bg-deep-green-light transition-colors"
              >
                {L('Rejoindre Ohaana', 'Join Ohaana', 'Unirse a Ohaana')}
                <ChevronRight size={14} />
              </Link>
              <a
                href="mailto:partenaires@ohaana.com"
                className="inline-flex items-center gap-2 border border-mist text-charcoal px-5 py-2.5 rounded-full text-sm font-medium hover:border-deep-green/40 transition-colors"
              >
                <Mail size={14} />
                {L('Nous contacter', 'Contact us', 'Contáctanos')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* '- -' 7. Lead capture '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -' */}
      <section className="px-5 md:px-8 py-14 bg-deep-green">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="space-y-2">
            <p className="text-xs text-coconut/50 uppercase tracking-widest">
              {L('Lancement en cours', 'Launch in progress', 'Lanzamiento en curso')}
            </p>
            <h2 className="text-2xl font-display text-coconut">
              {L('Recevoir la sélection Ohaana', 'Get the Ohaana selection', 'Recibe la selección Ohaana')}
            </h2>
            <p className="text-sm text-coconut/60 leading-relaxed">
              {L(
                'Recevez les nouveaux services disponibles près de votre hébergement et les destinations ouvertes en avant-première.',
                'Get the newest services available near your accommodation and early access to new destinations.',
                'Recibe los nuevos servicios disponibles cerca de tu alojamiento y acceso anticipado a nuevos destinos.'
              )}
            </p>
          </div>

          {leadSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-6"
            >
              <CheckCircle size={40} className="text-turquoise" />
              <p className="text-coconut font-medium">{L('C\'est noté !', 'You are on the list!', '¡Apuntado!')}</p>
              <p className="text-coconut/60 text-sm">{L('On vous contacte dès le lancement.', 'We will contact you as soon as we launch.', 'Te contactaremos en cuanto lancemos.')}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="space-y-3">
              <input
                type="email"
                required
                placeholder="votre@email.com"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                className="w-full h-12 rounded-xl bg-white/10 border border-coconut/20 px-4 text-sm text-coconut placeholder:text-coconut/40 focus:outline-none focus:border-turquoise transition-colors"
              />
              <select
                value={leadDest}
                onChange={(e) => setLeadDest(e.target.value)}
                className="w-full h-12 rounded-xl bg-white/10 border border-coconut/20 px-4 text-sm text-coconut focus:outline-none focus:border-turquoise transition-colors"
                style={{ colorScheme: 'dark' }}
              >
                <option value="" className="text-charcoal bg-coconut">
                  {L('Destination prévue', 'Planned destination', 'Destino previsto')}
                </option>
                {destinations.map((d) => (
                  <option key={d} value={d} className="text-charcoal bg-coconut">{d}</option>
                ))}
              </select>
              <input
                type="tel"
                placeholder={L('WhatsApp (optionnel)', 'WhatsApp (optional)', 'WhatsApp (opcional)')}
                value={leadWA}
                onChange={(e) => setLeadWA(e.target.value)}
                className="w-full h-12 rounded-xl bg-white/10 border border-coconut/20 px-4 text-sm text-coconut placeholder:text-coconut/40 focus:outline-none focus:border-turquoise transition-colors"
              />
              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-coral text-coconut font-medium text-sm hover:bg-coral-light transition-colors shadow-sm"
              >
                {L('Me prévenir du lancement', 'Notify me at launch', 'Avisarme del lanzamiento')}
              </button>
              <p className="text-[11px] text-coconut/30">
                {L('Pas de spam. Désabonnement en un clic.', 'No spam. Unsubscribe in one click.', 'Sin spam. Cancela con un clic.')}
              </p>
            </form>
          )}
        </div>
      </section>

    </div>
  )
}
