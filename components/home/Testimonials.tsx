'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from 'next-intl'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'

const TESTIMONIALS = [
  {
    name: 'Sophie D.',
    origin: 'Paris',
    destination: 'Guadeloupe',
    avatar: 'SD',
    color: 'bg-coral/20 text-coral',
    rating: 5,
    text_fr: '« Chef Marcus a transformé notre dîner en soirée inoubliable. Les produits locaux, le service impeccable, l\'ambiance… on se serait cru dans un restaurant étoilé. On recommande sans hésiter. »',
    text_en: '« Chef Marcus turned our dinner into an unforgettable evening. Local products, flawless service, the atmosphere… it felt like a Michelin-level restaurant. We\'d recommend it without hesitation. »',
    text_es: '« El chef Marcus convirtió nuestra cena en una velada inolvidable. Productos locales, servicio impecable. Lo recomendamos sin dudar. »',
    service_fr: 'Dîner de chef à domicile',
    service_en: 'Private chef dinner',
    service_es: 'Cena con chef privado',
  },
  {
    name: 'Thomas M.',
    origin: 'Lyon',
    destination: 'Martinique',
    avatar: 'TM',
    color: 'bg-turquoise/20 text-turquoise',
    rating: 5,
    text_fr: '« Le massage à domicile de Madeleine était tout simplement parfait. Huiles artisanales, ambiance bougies, vue sur le lagon. Ohaana a pensé à tout — le matériel était déjà installé à notre arrivée. »',
    text_en: '« Madeleine\'s in-home massage was simply perfect. Handmade oils, candlelit atmosphere, lagoon view. Ohaana thought of everything — the equipment was already set up when we arrived. »',
    text_es: '« El masaje a domicilio de Madeleine fue perfecto. Aceites artesanales, velas, vista a la laguna. Ohaana pensó en todo. »',
    service_fr: 'Massage balinais à domicile',
    service_en: 'Balinese massage at home',
    service_es: 'Masaje balinés a domicilio',
  },
  {
    name: 'Laura & Jim B.',
    origin: 'Londres',
    destination: 'Guadeloupe',
    avatar: 'LJ',
    color: 'bg-deep-green/20 text-deep-green',
    rating: 5,
    text_fr: '« Nous avons utilisé le concierge pour organiser toute notre semaine et tout était fluide. Chaque expérience était authentique, ponctuelle et au-delà de nos attentes. »',
    text_en: '« We used the concierge to plan our full week and everything was seamless. Every experience was authentic, punctual and above expectations. This is what travel should feel like. »',
    text_es: '« Usamos la conserjería para organizar toda la semana. Cada experiencia fue auténtica y superó nuestras expectativas. »',
    service_fr: 'Programme concierge — 7 jours',
    service_en: 'Concierge program — 7 days',
    service_es: 'Programa concierge — 7 días',
  },
  {
    name: 'Isabelle R.',
    origin: 'Montréal',
    destination: 'Saint-Martin',
    avatar: 'IR',
    color: 'bg-sand text-deep-green',
    rating: 5,
    text_fr: '« Le shooting photo de William était magique. Il connaît chaque recoin de l\'île — lever de soleil sur la plage de Friar\'s Bay, lumière dorée à l\'heure bleue. On gardera ces photos pour la vie. »',
    text_en: '« William\'s photo shoot was magical. He knows every corner of the island — sunrise at Friar\'s Bay, golden hour at dusk. We\'ll keep these photos forever. »',
    text_es: '« El shooting de William fue mágico. Conoce cada rincón de la isla. Guardaremos estas fotos toda la vida. »',
    service_fr: 'Shooting photo lifestyle',
    service_en: 'Lifestyle photo shoot',
    service_es: 'Sesión de fotos lifestyle',
  },
  {
    name: 'Marcus & Elena W.',
    origin: 'New York',
    destination: 'Saint-Barth',
    avatar: 'ME',
    color: 'bg-turquoise/15 text-turquoise',
    rating: 5,
    text_fr: '« La soirée DJ dans notre villa était incroyable. Kenzo a su créer exactement l\'ambiance qu\'on voulait — zouk, afrobeats, musique caribéenne. Nos amis en parlent encore. »',
    text_en: '« The DJ night at our villa was incredible. Kenzo perfectly matched the vibe we wanted — zouk, afrobeats, Caribbean beats. Our friends are still talking about it. »',
    text_es: '« La noche con DJ en nuestra villa fue increíble. Kenzo creó exactamente el ambiente que queríamos. Nuestros amigos siguen hablando de ello. »',
    service_fr: 'DJ set soirée villa',
    service_en: 'Villa DJ set',
    service_es: 'DJ set en villa',
  },
  {
    name: 'Céline P.',
    origin: 'Bordeaux',
    destination: 'Guadeloupe',
    avatar: 'CP',
    color: 'bg-coral/15 text-coral',
    rating: 5,
    text_fr: '« Keisha a adapté la séance yoga à mon niveau — débutante totale. Sur notre terrasse, face à la mer des Caraïbes, au lever du soleil. Un moment de paix absolue que je n\'oublierai pas. »',
    text_en: '« Keisha adapted the yoga session to my level — total beginner. On our terrace, facing the Caribbean Sea at sunrise. A moment of absolute peace I will never forget. »',
    text_es: '« Keisha adaptó la sesión de yoga a mi nivel. En nuestra terraza, frente al mar, al amanecer. Un momento de paz absoluta. »',
    service_fr: 'Yoga privé en terrasse',
    service_en: 'Private terrace yoga',
    service_es: 'Yoga privado en terraza',
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

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

export function Testimonials() {
  const locale = useLocale()
  const L = (fr: string, en: string, es: string) =>
    locale === 'en' ? en : locale === 'es' ? es : fr

  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState(1)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const idxRef = useRef(idx)
  idxRef.current = idx

  function go(next: number) {
    const cur = idxRef.current
    const n = ((next % TESTIMONIALS.length) + TESTIMONIALS.length) % TESTIMONIALS.length
    setDir(n === cur ? 1 : n > cur || (cur === TESTIMONIALS.length - 1 && n === 0) ? 1 : -1)
    setIdx(n)
  }

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => go(idxRef.current + 1), 5000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused])

  const t = TESTIMONIALS[idx]

  return (
    <section className="py-14 overflow-hidden">
      <div className="max-w-5xl mx-auto px-5 md:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs text-stone uppercase tracking-widest mb-2">
            {L('Ils en parlent mieux que nous', 'They say it better than we do', 'Ellos lo cuentan mejor')}
          </p>
          <h2 className="text-2xl md:text-3xl font-display text-charcoal">
            {L('Ce que vivent nos clients', 'What our clients experience', 'Lo que viven nuestros clientes')}
          </h2>
        </div>

        {/* Slider */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
          onTouchEnd={e => {
            if (touchStartX.current === null) return
            const dx = e.changedTouches[0].clientX - touchStartX.current
            if (Math.abs(dx) > 40) go(dx < 0 ? idx + 1 : idx - 1)
            touchStartX.current = null
          }}
        >
          {/* Card */}
          <div className="relative h-auto min-h-[230px] md:min-h-[200px]">
            <AnimatePresence custom={dir} mode="wait">
              <motion.div
                key={idx}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                className="bg-surface rounded-2xl border border-mist shadow-card p-6 md:p-8"
              >
                <Quote size={24} className="text-mist mb-4" />
                <p className="text-base md:text-lg text-charcoal/85 leading-relaxed font-light mb-6">
                  {L(t.text_fr, t.text_en, t.text_es)}
                </p>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-none', t.color)}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-charcoal">{t.name}</p>
                      <p className="text-[11px] text-stone">{t.origin} → {t.destination}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Stars n={t.rating} />
                    <p className="text-[11px] text-stone">{L(t.service_fr, t.service_en, t.service_es)}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Arrows */}
          <button
            onClick={() => go(idx - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 hidden md:flex w-10 h-10 rounded-full bg-coconut border border-mist shadow-sm items-center justify-center text-stone hover:text-charcoal hover:border-deep-green/30 transition-colors"
            aria-label="Précédent"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => go(idx + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 hidden md:flex w-10 h-10 rounded-full bg-coconut border border-mist shadow-sm items-center justify-center text-stone hover:text-charcoal hover:border-deep-green/30 transition-colors"
            aria-label="Suivant"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={cn(
                'rounded-full transition-all duration-300',
                i === idx
                  ? 'w-5 h-2 bg-deep-green'
                  : 'w-2 h-2 bg-mist hover:bg-stone/40'
              )}
              aria-label={`Avis ${i + 1}`}
            />
          ))}
        </div>

        {/* Global rating */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
          </div>
          <p className="text-sm text-stone">
            <span className="font-semibold text-charcoal">4.9/5</span>
            {' '}{L('· 340+ avis clients', '· 340+ client reviews', '· 340+ reseñas')}
          </p>
        </div>

      </div>
    </section>
  )
}
