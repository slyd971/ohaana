'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from '@/lib/i18n/navigation'
import { HeroSection } from '@/components/home/HeroSection'
import { ServiceRow } from '@/components/home/ServiceRow'
import { HowItWorks } from '@/components/home/HowItWorks'
import { Testimonials } from '@/components/home/Testimonials'
import { type IslandFilter } from '@/components/home/IslandSelector'
import { MoodSelector } from '@/components/home/MoodSelector'
import { SERVICES, HOME_ROWS, getServicesByIds } from '@/lib/data/seed'
import {
  MapPin, Clock, Sparkles, Leaf, MessageCircle,
  Building2, ChevronRight, Mail, CheckCircle,
} from 'lucide-react'

const MOOD_FILTER: Record<string, string[]> = {
  wellness:  ['bien-être', 'spa', 'relaxation'],
  soiree:    ['soirée', 'villa', 'coucher de soleil'],
  food:      ['gastronomie', 'cuisine'],
  culture:   ['culture', 'créole'],
  relax:     ['relaxation', 'détente', 'plage', 'coucher de soleil'],
}

const WHY_ITEMS = [
  {
    icon: Leaf,
    title: 'Sélection locale',
    text: 'On évite les expériences touristiques sans âme. Chaque prestataire est rencontré en personne.',
  },
  {
    icon: Clock,
    title: 'Gain de temps',
    text: 'Un concierge organise tout pour vous — itinéraire, réservations, horaires, surprises.',
  },
  {
    icon: Sparkles,
    title: 'Expériences premium',
    text: 'Chefs créoles, DJ, massages à domicile, décorations romantiques — chez vous, au niveau.',
  },
  {
    icon: MapPin,
    title: 'Connaissance terrain',
    text: 'Îles, bonnes adresses, artisans locaux, marchés secrets — on connaît les Caraïbes de l\'intérieur.',
  },
]

const DESTINATIONS = [
  'Guadeloupe', 'Martinique', 'Saint-Martin', 'Saint-Barth',
  'Dominique', 'Autre île', 'Pas encore décidé',
]

export default function HomePage() {
  const [island, setIsland]       = useState<IslandFilter>('all')
  const [mood, setMood]           = useState<string>('all')
  const [stayStart, setStayStart] = useState<Date | null>(null)
  const [stayEnd, setStayEnd]     = useState<Date | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Restore island + dates from previous session
  useEffect(() => {
    try {
      const savedIsland = sessionStorage.getItem('ohaana_island')
      if (savedIsland) setIsland(savedIsland as IslandFilter)
      const s = sessionStorage.getItem('ohaana_stay_start')
      const e = sessionStorage.getItem('ohaana_stay_end')
      if (s) { const d = new Date(s); if (!isNaN(d.getTime())) setStayStart(d) }
      if (e) { const d = new Date(e); if (!isNaN(d.getTime())) setStayEnd(d) }
    } catch {}
  }, [])

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

  function filterServices(services: typeof SERVICES) {
    let result = services
    // Island filter
    if (island !== 'all') {
      result = result.filter((s) => s.island === island)
    }
    // Mood filter
    if (mood !== 'all') {
      const keywords = MOOD_FILTER[mood] ?? []
      result = result.filter((s) =>
        keywords.some((kw) => s.tags.some((tag) => tag.includes(kw)))
      )
    }
    return result
  }

  function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = { email: leadEmail, destination: leadDest, whatsapp: leadWA, ts: new Date().toISOString() }
    console.log('[Ohaana lead]', data)
    try { localStorage.setItem('ohaana_lead', JSON.stringify(data)) } catch {}
    setLeadSent(true)
  }

  return (
    <div className="bg-coconut pb-20 md:pb-0">

      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <HeroSection
        island={island}
        onIslandChange={(v) => {
          setIsland(v)
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

      {/* ── 2. Comment ça marche ─────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── 3. Pourquoi Ohaana ───────────────────────────────────────────────── */}
      <section className="px-5 md:px-8 pb-14 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-xs text-stone uppercase tracking-widest mb-2">Pourquoi nous choisir</p>
          <h2 className="text-2xl md:text-3xl font-display text-charcoal">
            Pourquoi passer par Ohaana&nbsp;?
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {WHY_ITEMS.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-surface rounded-2xl p-6 border border-mist shadow-card space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-sand flex items-center justify-center">
                <Icon size={18} className="text-deep-green" />
              </div>
              <h3 className="font-semibold text-charcoal text-sm">{title}</h3>
              <p className="text-xs text-stone leading-relaxed">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 4. Controls (sticky) ─────────────────────────────────────────────── */}
      <div className="sticky top-16 z-20 bg-coconut/96 backdrop-blur-md border-b border-mist pt-2 pb-2">
        <MoodSelector value={mood} onChange={setMood} />
      </div>

      {/* ── 4. Service rows ──────────────────────────────────────────────────── */}
      <div className="py-8 space-y-10 max-w-7xl mx-auto md:px-8">
        {HOME_ROWS.map(({ key, label_fr, ids }) => {
          const all = getServicesByIds(ids)
          const filtered = filterServices(all)
          return (
            <ServiceRow
              key={key}
              title={label_fr}
              services={filtered}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              seeAllHref={`/search?mood=${key}`}
            />
          )
        })}
      </div>

      {/* ── 5. Témoignages ───────────────────────────────────────────────────── */}
      <Testimonials />

      {/* ── 7. Concierge — filet de sécurité ────────────────────────────────── */}
      <section className="mx-5 md:mx-8 mb-10 rounded-3xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, var(--deep-green) 0%, #0F2B1D 100%)' }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FDFAF4' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='37' cy='37' r='1'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="relative px-6 py-10 md:py-14 max-w-2xl mx-auto text-center space-y-5">
          <span className="inline-flex items-center gap-2 bg-coconut/10 border border-coconut/15 text-coconut/80 text-xs px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-turquoise animate-pulse" />
            Réponse en moins de 2h · 7j/7
          </span>
          <h2 className="text-2xl md:text-3xl font-display text-coconut leading-snug">
            Vous hésitez ou vous n&apos;avez<br />pas trouvé ce que vous cherchez&nbsp;?
          </h2>
          <p className="text-coconut/70 text-sm md:text-base leading-relaxed max-w-sm mx-auto">
            Décrivez ce que vous souhaitez vivre — dîner privé, soirée sur mesure, demande en mariage, programme complet. Camille, notre concierge locale, s&apos;occupe de tout.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://wa.me/0000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-coral text-coconut px-6 py-3 rounded-full font-medium text-sm hover:bg-coral-light transition-colors shadow-sm"
            >
              <MessageCircle size={16} />
              Parler à Camille
            </a>
            <Link
              href="/concierge"
              className="inline-flex items-center gap-2 bg-coconut/10 text-coconut border border-coconut/20 px-6 py-3 rounded-full font-medium text-sm hover:bg-coconut/20 transition-colors"
            >
              Créer mon programme
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. B2B partenaires ───────────────────────────────────────────────── */}
      <section id="partner" className="mx-5 md:mx-8 mb-10 rounded-3xl bg-sand border border-mist p-8 md:p-12">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="w-14 h-14 rounded-2xl bg-deep-green flex items-center justify-center flex-none">
            <Building2 size={24} className="text-coconut" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-3">
            <h2 className="text-xl md:text-2xl font-display text-charcoal">
              Vous êtes chef(fe), masseur(se), DJ, photographe ou coach sportif&nbsp;?
            </h2>
            <p className="text-sm text-stone leading-relaxed">
              Recevez des demandes de voyageurs en séjour dans les Caraïbes et proposez vos prestations à domicile, sans infrastructure à gérer.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-1">
              <Link
                href="/register?role=provider"
                className="inline-flex items-center gap-2 bg-deep-green text-coconut px-5 py-2.5 rounded-full text-sm font-medium hover:bg-deep-green-light transition-colors"
              >
                Rejoindre Ohaana
                <ChevronRight size={14} />
              </Link>
              <a
                href="mailto:partenaires@ohaana.com"
                className="inline-flex items-center gap-2 border border-mist text-charcoal px-5 py-2.5 rounded-full text-sm font-medium hover:border-deep-green/40 transition-colors"
              >
                <Mail size={14} />
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Lead capture ──────────────────────────────────────────────────── */}
      <section className="px-5 md:px-8 py-14 bg-deep-green">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="space-y-2">
            <p className="text-xs text-coconut/50 uppercase tracking-widest">Lancement en cours</p>
            <h2 className="text-2xl font-display text-coconut">
              Recevoir la sélection Ohaana
            </h2>
            <p className="text-sm text-coconut/60 leading-relaxed">
              On vous envoie les plus belles expériences de la saison, les nouvelles destinations et les offres en avant-première.
            </p>
          </div>

          {leadSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-6"
            >
              <CheckCircle size={40} className="text-turquoise" />
              <p className="text-coconut font-medium">C&apos;est noté !</p>
              <p className="text-coconut/60 text-sm">On vous contacte dès le lancement.</p>
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
                <option value="" className="text-charcoal bg-coconut">Destination prévue</option>
                {DESTINATIONS.map((d) => (
                  <option key={d} value={d} className="text-charcoal bg-coconut">{d}</option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="WhatsApp (optionnel)"
                value={leadWA}
                onChange={(e) => setLeadWA(e.target.value)}
                className="w-full h-12 rounded-xl bg-white/10 border border-coconut/20 px-4 text-sm text-coconut placeholder:text-coconut/40 focus:outline-none focus:border-turquoise transition-colors"
              />
              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-coral text-coconut font-medium text-sm hover:bg-coral-light transition-colors shadow-sm"
              >
                Me prévenir du lancement
              </button>
              <p className="text-[11px] text-coconut/30">
                Pas de spam. Désabonnement en un clic.
              </p>
            </form>
          )}
        </div>
      </section>

    </div>
  )
}
