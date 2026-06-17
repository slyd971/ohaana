import { motion } from 'framer-motion'
import { CalendarDays, Sparkles, HeartHandshake } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    Icon: CalendarDays,
    title: 'Choisissez votre île et vos dates',
    desc: 'Sélectionnez votre destination et vos dates de séjour. Les disponibilités se mettent à jour en temps réel.',
  },
  {
    number: '02',
    Icon: Sparkles,
    title: 'Sélectionnez une expérience',
    desc: 'Parcourez notre sélection ou décrivez ce que vous souhaitez vivre — notre concierge compose votre programme.',
  },
  {
    number: '03',
    Icon: HeartHandshake,
    title: 'Profitez — on s\'occupe du reste',
    desc: 'Confirmation immédiate, rappel la veille, prestataire ponctuel. Vous n\'avez qu\'à savourer.',
  },
]

export function HowItWorks() {
  return (
    <section className="px-5 md:px-8 py-14 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <p className="text-xs text-stone uppercase tracking-widest mb-2">Simple & rapide</p>
        <h2 className="text-2xl md:text-3xl font-display text-charcoal">
          Comment ça marche&nbsp;?
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
        {/* Ligne de connexion desktop */}
        <div className="hidden md:block absolute top-10 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-mist" />

        {STEPS.map(({ number, Icon, title, desc }, i) => (
          <motion.div
            key={number}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="flex flex-col items-center text-center gap-4"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-sand border border-mist flex items-center justify-center shadow-sm">
                <Icon size={28} className="text-deep-green" />
              </div>
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-deep-green text-coconut text-[10px] font-bold flex items-center justify-center">
                {number.slice(1)}
              </span>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-semibold text-charcoal text-sm leading-snug">{title}</h3>
              <p className="text-xs text-stone leading-relaxed max-w-[220px] mx-auto">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
