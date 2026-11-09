'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { HeroSection } from '@/components/home/HeroSection'
import { ServiceRow } from '@/components/home/ServiceRow'
import { ServiceCard } from '@/components/service/ServiceCard'
import { Testimonials } from '@/components/home/Testimonials'
import { type IslandFilter } from '@/components/home/IslandSelector'
import { MoodSelector } from '@/components/home/MoodSelector'
import type { HomeRow, ServiceView } from '@/lib/data/types'
import { useFavorites } from '@/hooks/useFavorites'
import { WHATSAPP_NUMBER } from '@/lib/site'
import { useAuth } from '@/lib/auth/AuthProvider'
import { providerTarget, PARTNER_EMAIL } from '@/lib/auth/provider-link'
import {
  Clock, Leaf, MessageCircle,
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

interface HomeClientProps {
  services: ServiceView[]
  rows: HomeRow[]
}

export function HomeClient({ services, rows }: HomeClientProps) {
  const locale = useLocale()
  const t = useTranslations('homePage')
  const { isLoggedIn, isProvider, isAdmin } = useAuth()
  const provider = providerTarget({ isLoggedIn, isProvider, isAdmin })
  const L = (fr: string, en: string, es: string) =>
    locale === 'en' ? en : locale === 'es' ? es : fr
  const whyItems = locale === 'en' ? WHY_ITEMS_EN : locale === 'es' ? WHY_ITEMS_ES : WHY_ITEMS
  const destinations = locale === 'en' ? DESTINATIONS_EN : locale === 'es' ? DESTINATIONS_ES : DESTINATIONS
  const [initialHomeState] = useState(getInitialHomeState)
  const [island, setIsland]       = useState<IslandFilter>(initialHomeState.island)
  const [mood, setMood]           = useState<string>('all')
  const [stayStart, setStayStart] = useState<Date | null>(initialHomeState.stayStart)
  const [stayEnd, setStayEnd]     = useState<Date | null>(initialHomeState.stayEnd)
  const { favorites, toggleFavorite } = useFavorites()
  const [showAllExplorer, setShowAllExplorer] = useState(false)
  const [whyActiveIdx, setWhyActiveIdx] = useState(0)
  const whyScrollRef = useRef<HTMLDivElement>(null)
  const explorerGridRef = useRef<HTMLDivElement>(null)
  const [stickyHidden, setStickyHidden] = useState(false)

  // Fade the sticky category bar out before the grid fully leaves the screen
  useEffect(() => {
    const onScroll = () => {
      const el = explorerGridRef.current
      if (!el) return
      setStickyHidden(el.getBoundingClientRect().bottom < 520)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const handleWhyScroll = useCallback(() => {
    const el = whyScrollRef.current
    if (!el) return
    const cardWidth = el.scrollWidth / whyItems.length
    setWhyActiveIdx(Math.round(el.scrollLeft / cardWidth))
  }, [whyItems.length])

  // Lead capture state
  const [leadEmail, setLeadEmail]   = useState('')
  const [leadDest, setLeadDest]     = useState('')
  const [leadSent, setLeadSent]     = useState(false)
  const [leadConsent, setLeadConsent] = useState(false)
  const [leadBusy, setLeadBusy]       = useState(false)
  const [leadError, setLeadError]     = useState(false)

  // Zone 1  - Explorer : tous les services filtrés par île + humeur
  const explorerServices = (() => {
    let svcs = [...services]
    if (island !== 'all') svcs = svcs.filter(s => s.island === island)
    if (mood !== 'all') {
      const kw = MOOD_FILTER[mood] ?? []
      svcs = svcs.filter(s => kw.some(k => s.tags.some(t => t.includes(k))))
    }
    return svcs
  })()

  // Zone 2  - Éditorial : ids curatés, filtrés par île uniquement
  function editorialServices(ids: string[]) {
    let svcs = ids.map((id) => services.find((s) => s.id === id)).filter((s): s is ServiceView => Boolean(s))
    if (island !== 'all') svcs = svcs.filter(s => s.island === island)
    return svcs
  }

  const rowPopular = rows.find(r => r.key === 'popular')
  const rowTonight = rows.find(r => r.key === 'tonight')
  const featuredServices = (() => {
    return editorialServices(rowPopular?.ids ?? []).slice(0, 6)
  })()
  const visibleExplorerServices = showAllExplorer ? explorerServices : explorerServices.slice(0, 8)
  const hasMoreExplorerServices = explorerServices.length > visibleExplorerServices.length

  const [leadTrap, setLeadTrap] = useState('')

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (leadBusy) return
    setLeadBusy(true)
    setLeadError(false)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: leadEmail,
          destination: leadDest || undefined,
          locale,
          consent: leadConsent,
          website: leadTrap,
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setLeadSent(true)
    } catch {
      setLeadError(true)
    } finally {
      setLeadBusy(false)
    }
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
      <section className="bg-sand">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-7 md:py-9">
          <div className="space-y-4 sm:space-y-0">
            <div
              ref={whyScrollRef}
              onScroll={handleWhyScroll}
              className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-1 snap-x snap-mandatory sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-8 sm:overflow-visible sm:px-0 sm:pb-0 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {whyItems.map(({ icon: Icon, title, text }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="w-[calc(100vw-2.5rem)] flex-none snap-center flex items-start gap-4 rounded-card bg-white p-4 shadow-card sm:w-auto sm:min-w-0 sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none"
                >
                  <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-deep-green">
                    <Icon size={20} strokeWidth={1.7} className="text-coconut" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-deep-green">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-charcoal/70">{text}</p>
                  </div>
                </motion.div>
              ))}
              <div className="w-1 flex-none sm:hidden" />
            </div>
            <div className="flex justify-center gap-1.5 sm:hidden" aria-hidden="true">
              {whyItems.map((item, i) => (
                <span
                  key={item.title}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === whyActiveIdx ? 'w-4 bg-deep-green' : 'w-1.5 bg-deep-green/25'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* '- -' Zone 1 : Explorer '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -' */}
      {/* Wrapper: bounds the sticky category bar to the explorer grid only */}
      <div>
      <div
        className={`sticky top-16 z-20 border-b border-mist bg-coconut/96 backdrop-blur-md transition-all duration-300 ${
          stickyHidden ? 'pointer-events-none -translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 pt-4 md:px-8 md:pt-5">
          <h2 className="font-display text-xl text-deep-green md:text-2xl">
            {t('explorerParCategorie')}
          </h2>
          <MoodSelector
            value={mood}
            onChange={(nextMood) => {
              setMood(nextMood)
              setShowAllExplorer(false)
            }}
          />
        </div>
      </div>
      <div ref={explorerGridRef} className="pt-8 pb-8 px-5 md:px-8 max-w-7xl mx-auto">
        <motion.div
          key={mood + island}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {explorerServices.length === 0 ? (
            <p className="text-center text-stone py-16 text-sm">
              {t('aucunServiceDisponiblePourCette')}
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
                {t('voirPlus')}
              </button>
            </div>
          )}
        </motion.div>
      </div>

      </div>

      {/* '- -' 7. Concierge  - filet de sécurité '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -' */}
      <section className="mx-5 md:mx-8 mt-6 mb-16 md:mb-20 rounded-3xl overflow-hidden relative"
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
                {t('reponseEnMoinsDe2h')}
              </span>
              <h2 className="text-2xl md:text-3xl font-display text-coconut leading-snug">
                {locale === 'en'
                  ? <>Still unsure or did not<br />find what you need?</>
                  : locale === 'es'
                  ? <>¿Dudas o no encontraste<br />lo que buscas?</>
                  : <>Vous hésitez ou vous n&apos;avez<br />pas trouvé ce que vous cherchez&nbsp;?</>}
              </h2>
              <p className="text-coconut/70 text-sm md:text-base leading-relaxed max-w-sm mx-auto md:mx-0">
                {t('dinerPriveMassageBabySitter')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:justify-start">
                {WHATSAPP_NUMBER && (
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-coral text-coconut px-6 py-3 rounded-full font-medium text-sm hover:bg-coral-light transition-colors shadow-sm"
                  >
                    <MessageCircle size={16} />
                    {t('parlerACamille')}
                  </a>
                )}
                <Link
                  href="/concierge"
                  className="inline-flex items-center gap-2 bg-coconut/10 text-coconut border border-coconut/20 px-6 py-3 rounded-full font-medium text-sm hover:bg-coconut/20 transition-colors"
                >
                  {t('creerMonProgramme')}
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
          <div className="relative min-h-[20rem] md:min-h-full">
            <Image
              src="/photos/concierge-antillaise.png"
              alt={t('conciergeAntillaiseAccueillantDesVoyageurs')}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep-green/55 via-transparent to-transparent md:bg-gradient-to-r md:from-deep-green/25 md:via-transparent md:to-transparent" />
          </div>
        </div>
      </section>

      {/* '- -' Zone 2 : Ce soir '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -' */}
      {rowTonight && (
        <div className="pb-14 max-w-7xl mx-auto md:px-8">
          <ServiceRow
            title={L(rowTonight.label_fr, rowTonight.label_en, rowTonight.label_es)}
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
          <h2 className="text-2xl md:text-3xl font-display text-deep-green">
            {t('lesIncontournables')}
          </h2>
          <p className="mt-1.5 text-sm text-stone">
            {t('lesServicesLesPlusReserves')}
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

      {/* '- -' 6. B2B partenaires '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -' */}
      <section id="partner" className="mx-5 md:mx-8 mb-10 rounded-3xl bg-sand border border-mist p-8 md:p-12">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="w-14 h-14 rounded-card bg-deep-green flex items-center justify-center flex-none">
            <Building2 size={24} className="text-coconut" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-3">
            <h2 className="text-2xl md:text-3xl font-display text-deep-green">
              {t('vousEtesChefFeMasseur')}
            </h2>
            <p className="text-sm text-stone leading-relaxed">
              {t('recevezDesDemandesDeVoyageurs')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-1">
              {(() => {
                const cta = 'inline-flex items-center gap-2 bg-deep-green text-coconut px-5 py-2.5 rounded-full text-sm font-medium hover:bg-deep-green-light transition-colors'
                const label = isProvider || isAdmin
                  ? t('monEspacePrestataire')
                  : t('rejoindreOhaana')
                return provider.external ? (
                  <a href={provider.href} className={cta}>{label}<ChevronRight size={14} /></a>
                ) : (
                  <Link href={provider.href} className={cta}>{label}<ChevronRight size={14} /></Link>
                )
              })()}
              <a
                href={`mailto:${PARTNER_EMAIL}`}
                className="inline-flex items-center gap-2 border border-mist text-charcoal px-5 py-2.5 rounded-full text-sm font-medium hover:border-deep-green/40 transition-colors"
              >
                <Mail size={14} />
                {PARTNER_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* '- -' 7. Lead capture '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */}
      <section className="mx-5 mb-16 md:mx-8 md:mb-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-mist bg-white p-7 text-center md:p-12">
          <h2 className="font-display text-2xl text-deep-green md:text-3xl">
            {t('recevoirLesNouveautesOhaana')}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-charcoal/70 md:text-base">
            {t('lesNouveauxServicesPresDe')}
          </p>

          {leadSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 flex flex-col items-center gap-2 py-4"
            >
              <CheckCircle size={36} className="text-deep-green" />
              <p className="font-medium text-deep-green">{t('plusQuUnClic')}</p>
              <p className="text-sm text-charcoal/70">{t('nousVenonsDeVousEnvoyer')}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="mx-auto mt-6 max-w-2xl space-y-3">
              {/* Piège à robots : invisible et hors parcours clavier pour un humain. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={leadTrap}
                onChange={(e) => setLeadTrap(e.target.value)}
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  type="email"
                  required
                  aria-label="Email"
                  placeholder={t('votreEmail')}
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className="h-12 w-full min-w-0 flex-1 rounded-full border border-mist bg-coconut px-5 text-sm text-charcoal placeholder:text-stone focus:border-deep-green focus:outline-none"
                />
                <select
                  value={leadDest}
                  onChange={(e) => setLeadDest(e.target.value)}
                  aria-label={t('destinationPrevue')}
                  className="h-12 w-full rounded-full border border-mist bg-coconut px-5 text-sm text-charcoal focus:border-deep-green focus:outline-none md:w-60"
                >
                  <option value="">{t('destinationOptionnel')}</option>
                  {destinations.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={leadBusy}
                  className="h-12 rounded-full bg-deep-green px-7 text-sm font-medium text-coconut transition-colors hover:bg-coral disabled:opacity-60"
                >
                  {t('jeMInscris')}
                </button>
              </div>
              <label className="flex items-start justify-center gap-2.5 text-left text-xs text-charcoal/70">
                <input
                  type="checkbox"
                  required
                  checked={leadConsent}
                  onChange={(e) => setLeadConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 flex-none accent-deep-green"
                />
                <span>
                  {t('jAccepteDeRecevoirLes')}
                </span>
              </label>
              {leadError && (
                <p role="alert" className="text-xs text-coral-text">
                  {t('uneErreurEstSurvenueReessayez')}
                </p>
              )}
            </form>
          )}
        </div>
      </section>

    </div>
  )
}
