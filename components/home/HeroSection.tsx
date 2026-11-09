'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import { useRouter } from '@/lib/i18n/navigation'
import { Search } from 'lucide-react'
import { IslandSelector, type IslandFilter } from '@/components/home/IslandSelector'
import { DateRangePicker } from '@/components/ui/DateRangePicker'

const COPY = {
  fr: {
    eyebrow: 'Guadeloupe · Martinique · Saint-Martin',
    title: 'Vos plus belles expériences aux Antilles, sans bouger de chez vous.',
    subtitle: 'Massage, chef créole, photographe ou DJ : les meilleurs prestataires des Antilles, réservés en quelques clics.',
    where: 'Où',
    when: 'Quand',
    what: 'Quoi',
    placeholder: 'Ajouter des dates',
    search: 'Massage, chef privé, DJ...',
    cta: 'Rechercher',
  },
  en: {
    eyebrow: 'Guadeloupe · Martinique · Saint-Martin',
    title: 'Your finest Caribbean experiences, without leaving home.',
    subtitle: 'Massage, Creole chef, photographer or DJ: the best providers in the Caribbean, booked in a few clicks.',
    where: 'Where',
    when: 'When',
    what: 'What',
    placeholder: 'Add dates',
    search: 'Massage, private chef, DJ...',
    cta: 'Search',
  },
  es: {
    eyebrow: 'Guadalupe · Martinica · Saint-Martin',
    title: 'Tus mejores experiencias en el Caribe, sin salir de casa.',
    subtitle: 'Masaje, chef criollo, fotógrafo o DJ: los mejores prestadores del Caribe, reservados en pocos clics.',
    where: 'Dónde',
    when: 'Cuándo',
    what: 'Qué',
    placeholder: 'Añadir fechas',
    search: 'Masaje, chef privado, DJ...',
    cta: 'Buscar',
  },
} as const

interface HeroSectionProps {
  island: IslandFilter
  onIslandChange: (v: IslandFilter) => void
  stayStart: Date | null
  stayEnd: Date | null
  onDatesChange: (start: Date | null, end: Date | null) => void
}

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

export function HeroSection({
  island,
  onIslandChange,
  stayStart,
  stayEnd,
  onDatesChange,
}: HeroSectionProps) {
  const locale = useLocale()
  const router = useRouter()
  const copy = COPY[(locale in COPY ? locale : 'fr') as keyof typeof COPY]
  const [query, setQuery] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    const q = query.trim()
    if (q) params.set('q', q)
    if (island !== 'all') params.set('island', island)
    const qs = params.toString()
    router.push(qs ? `/search?${qs}` : '/search')
  }

  const label = 'text-[11px] font-semibold uppercase tracking-wider text-charcoal'

  return (
    <section className="relative bg-coconut pt-16">
      <div className="mx-auto max-w-4xl px-5 md:px-8 pt-12 pb-14 md:pt-20 md:pb-24 text-center">
        <motion.div
          initial={{ y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-turquoise-text sm:text-xs sm:tracking-[0.18em]">
            {copy.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-4xl leading-[1.1] text-deep-green md:text-6xl">
            {copy.title}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-charcoal/70 md:text-lg">
            {copy.subtitle}
          </p>
        </motion.div>

        {/* Floating search — overlaps the next section */}
        <motion.form
          onSubmit={submit}
          role="search"
          initial={{ y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          className="relative z-30 mx-auto mt-10 md:mt-12  flex w-full max-w-3xl flex-col gap-1 rounded-3xl border border-mist/70 bg-white p-2 text-left shadow-modal md:flex-row md:items-stretch md:rounded-full md:p-2.5"
        >
          <div className="min-h-14 rounded-card px-5 py-3 md:rounded-full md:flex-none md:w-44 hover:bg-sand/50 transition-colors">
            <div className={label}>{copy.where}</div>
            <div className="mt-1">
              <IslandSelector value={island} onChange={onIslandChange} variant="bare" />
            </div>
          </div>

          <span className="hidden md:block my-3 w-px bg-mist" aria-hidden="true" />

          <div className="min-h-14 rounded-card px-5 py-3 md:rounded-full md:flex-none md:w-44 hover:bg-sand/50 transition-colors">
            <div className={label}>{copy.when}</div>
            <div className="mt-1">
              <DateRangePicker
                startDate={stayStart}
                endDate={stayEnd}
                onChange={onDatesChange}
                placeholder={copy.placeholder}
                bare
              />
            </div>
          </div>

          <span className="hidden md:block my-3 w-px bg-mist" aria-hidden="true" />

          <label className="flex min-h-14 flex-1 min-w-0 cursor-text flex-col rounded-card px-5 py-3 md:rounded-full hover:bg-sand/50 transition-colors">
            <span className={label}>{copy.what}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.search}
              className="mt-1 min-h-6 w-full min-w-0 bg-transparent text-sm text-charcoal placeholder:text-stone focus:outline-none"
            />
          </label>

          <button
            type="submit"
            className="m-1 flex items-center justify-center gap-2 rounded-full bg-deep-green px-6 py-3.5 text-sm font-medium text-coconut transition-colors hover:bg-deep-green-light active:scale-[0.98] md:flex-none"
          >
            <Search size={18} />
            <span className="md:sr-only lg:not-sr-only">{copy.cta}</span>
          </button>
        </motion.form>
      </div>
    </section>
  )
}
