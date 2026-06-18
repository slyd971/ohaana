'use client'

import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import { Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Sophie D.',
    origin: 'Paris',
    destination: 'Guadeloupe',
    avatar: 'SD',
    color: 'bg-coral/20 text-coral',
    rating: 5,
    text_fr: 'Chef Marcus a transformé notre dîner en soirée inoubliable. Les produits locaux, le service impeccable, l\'ambiance… on se serait cru dans un restaurant étoilé. On recommande sans hésiter.',
    text_en: 'Chef Marcus turned our dinner into an unforgettable evening. Local products, flawless service, the whole atmosphere… it felt like a Michelin-level restaurant. We would recommend it without hesitation.',
    service_fr: 'Dîner de chef à domicile',
    service_en: 'Private chef dinner at home',
  },
  {
    name: 'Thomas M.',
    origin: 'Lyon',
    destination: 'Martinique',
    avatar: 'TM',
    color: 'bg-turquoise/20 text-turquoise',
    rating: 5,
    text_fr: 'Le massage à domicile de Madeleine était tout simplement parfait. Huiles artisanales, ambiance bougies, vue sur le lagon. Ohaana a pensé à tout — même le matériel était déjà installé à notre arrivée.',
    text_en: 'Madeleine’s in-home massage was simply perfect. Handmade oils, candlelit atmosphere, lagoon view. Ohaana thought of everything — even the equipment was already set up when we arrived.',
    service_fr: 'Massage balinais à domicile',
    service_en: 'Balinese massage at home',
  },
  {
    name: 'Laura & Jim B.',
    origin: 'Londres',
    destination: 'Guadeloupe',
    avatar: 'LJ',
    color: 'bg-deep-green/20 text-deep-green',
    rating: 5,
    text_fr: 'Nous avons utilisé le concierge pour organiser toute notre semaine et tout était fluide. Chaque expérience était authentique, ponctuelle et au-delà de nos attentes.',
    text_en: 'We used the concierge to plan our full week and it was seamless. Every experience was authentic, punctual and above our expectations. This is what travel should feel like.',
    service_fr: 'Programme complet — 7 jours',
    service_en: 'Full 7-day program',
  },
]

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
      ))}
    </div>
  )
}

export function Testimonials() {
  const locale = useLocale()
  const isEn = locale === 'en'

  return (
    <section className="px-5 md:px-8 py-14 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <p className="text-xs text-stone uppercase tracking-widest mb-2">{isEn ? 'They say it better than we do' : 'Ils en parlent mieux que nous'}</p>
        <h2 className="text-2xl md:text-3xl font-display text-charcoal">
          {isEn ? 'What our clients experience' : 'Ce que vivent nos clients'}
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TESTIMONIALS.map(({ name, origin, destination, avatar, color, rating, text_fr, text_en, service_fr, service_en }, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-surface rounded-2xl p-5 border border-mist shadow-card flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-none ${color}`}>
                  {avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal">{name}</p>
                  <p className="text-[11px] text-stone">{origin} → {destination}</p>
                </div>
              </div>
              <Stars n={rating} />
            </div>

            <p className="text-sm text-charcoal/80 leading-relaxed flex-1">
              &ldquo;{isEn ? text_en : text_fr}&rdquo;
            </p>

            <p className="text-[11px] text-stone border-t border-mist pt-3">{isEn ? service_en : service_fr}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
