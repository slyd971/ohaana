import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Sophie D.',
    origin: 'Paris',
    destination: 'Guadeloupe',
    avatar: 'SD',
    color: 'bg-coral/20 text-coral',
    rating: 5,
    text: 'Chef Marcus a transformé notre dîner en soirée inoubliable. Les produits locaux, le service impeccable, l\'ambiance… on se serait cru dans un restaurant étoilé. On recommande sans hésiter.',
    service: 'Dîner de chef à domicile',
  },
  {
    name: 'Thomas M.',
    origin: 'Lyon',
    destination: 'Martinique',
    avatar: 'TM',
    color: 'bg-turquoise/20 text-turquoise',
    rating: 5,
    text: 'Le massage à domicile de Madeleine était tout simplement parfait. Huiles artisanales, ambiance bougies, vue sur le lagon. Ohaana a pensé à tout — même le matériel était déjà installé à notre arrivée.',
    service: 'Massage balinais à domicile',
  },
  {
    name: 'Laura & Jim B.',
    origin: 'Londres',
    destination: 'Guadeloupe',
    avatar: 'LJ',
    color: 'bg-deep-green/20 text-deep-green',
    rating: 5,
    text: 'We used the concierge to plan our full week and it was seamless. Every experience was authentic, punctual and above our expectations. This is what travel should feel like.',
    service: 'Programme complet — 7 jours',
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
  return (
    <section className="px-5 md:px-8 py-14 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <p className="text-xs text-stone uppercase tracking-widest mb-2">Ils en parlent mieux que nous</p>
        <h2 className="text-2xl md:text-3xl font-display text-charcoal">
          Ce que vivent nos clients
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TESTIMONIALS.map(({ name, origin, destination, avatar, color, rating, text, service }, i) => (
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
              &ldquo;{text}&rdquo;
            </p>

            <p className="text-[11px] text-stone border-t border-mist pt-3">{service}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
