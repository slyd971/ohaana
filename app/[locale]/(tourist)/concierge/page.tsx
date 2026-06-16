'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MessageCircle, Send, ExternalLink, CalendarDays, MapPin, Sparkles, Clock } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/Button'
import { SERVICES } from '@/lib/data/seed'

const WHATSAPP_NUMBER = '590690000000'
const WHATSAPP_DEFAULT_MSG = encodeURIComponent(
  "Bonjour, je souhaite réserver une expérience sur Ohaana. Pouvez-vous m'aider ?"
)
const CONCIERGE_PHOTO =
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&h=240&fit=crop&q=85'

const SUGGESTIONS = [
  'Je fête notre anniversaire',
  'Je cherche une soirée romantique',
  'Je voyage avec deux enfants',
  'Un massage duo dans notre villa ce soir',
  'Un DJ pour notre soirée d\'anniversaire en terrasse',
  'Une décoration romantique de villa pour une demande en mariage',
]

const RECOMMENDED_IDS = ['s-1', 's-8', 's-18', 's-19', 's-17', 's-13']
const RECOMMENDATIONS = RECOMMENDED_IDS
  .map((id) => SERVICES.find((service) => service.id === id))
  .filter(Boolean) as typeof SERVICES

export default function ConciergePage() {
  const [message, setMessage] = useState('')
  const [stayDates, setStayDates] = useState('')
  const [location, setLocation] = useState('')
  const [sent, setSent] = useState(false)

  function handleSend(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!message.trim()) return
    // In production: send to backend / notify concierge team
    setSent(true)
  }

  function applySuggestion(s: string) {
    setMessage(s)
  }

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${
    message.trim()
      ? encodeURIComponent(message)
      : WHATSAPP_DEFAULT_MSG
  }`

  return (
    <div className="min-h-screen bg-coconut pt-16">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-8"
        >
          <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto border-4 border-coconut shadow-elevated">
            <Image
              src={CONCIERGE_PHOTO}
              alt="Concierge antillaise Ohaana"
              fill
              className="object-cover"
              sizes="96px"
            />
            <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-turquoise border-2 border-coconut" />
          </div>

          <div>
            <h1 className="text-2xl font-display text-charcoal">Assistant séjour Ohaana</h1>
            <p className="text-stone text-sm mt-1">Recommandations, prestataires et créneaux adaptés à votre villa.</p>
          </div>
        </motion.div>

        {/* WhatsApp CTA */}
        <motion.a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4 bg-[#25D366] text-white rounded-2xl p-4 mb-6 hover:bg-[#20C05C] transition-colors shadow-sm"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-none">
            <MessageCircle size={24} />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Demander conseil à notre concierge</p>
            <p className="text-sm text-white/80">Réponse rapide · En français ou anglais</p>
          </div>
          <ExternalLink size={18} className="flex-none opacity-70" />
        </motion.a>

        {/* Request form */}
        {!sent ? (
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onSubmit={handleSend}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Quelle ambiance souhaitez-vous créer ?
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: je fête notre anniversaire, je cherche une soirée romantique, je voyage avec deux enfants..."
                rows={4}
                className="w-full rounded-2xl border border-mist bg-surface px-4 py-3 text-sm text-charcoal placeholder:text-stone focus:outline-none focus:border-deep-green focus:ring-2 focus:ring-deep-green/15 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="flex items-center gap-1.5 text-sm font-medium text-charcoal mb-2">
                  <CalendarDays size={14} />
                  Dates du séjour
                </span>
                <input
                  value={stayDates}
                  onChange={(e) => setStayDates(e.target.value)}
                  placeholder="Ex: 12–18 août"
                  className="w-full h-12 rounded-2xl border border-mist bg-surface px-4 text-sm text-charcoal placeholder:text-stone focus:outline-none focus:border-deep-green focus:ring-2 focus:ring-deep-green/15"
                />
              </label>
              <label className="block">
                <span className="flex items-center gap-1.5 text-sm font-medium text-charcoal mb-2">
                  <MapPin size={14} />
                  Lieu de séjour
                </span>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: villa à Deshaies"
                  className="w-full h-12 rounded-2xl border border-mist bg-surface px-4 text-sm text-charcoal placeholder:text-stone focus:outline-none focus:border-deep-green focus:ring-2 focus:ring-deep-green/15"
                />
              </label>
            </div>

            {/* Suggestions */}
            <div>
              <p className="text-xs text-stone mb-2">Idées populaires :</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => applySuggestion(s)}
                    className="text-xs px-3 py-1.5 rounded-full bg-sand border border-mist text-charcoal-soft hover:border-deep-green hover:text-deep-green transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" fullWidth size="lg" disabled={!message.trim()}>
              <Send size={16} />
              Recevoir mes recommandations
            </Button>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10 space-y-4 bg-sand rounded-3xl px-6"
          >
            <div className="text-4xl">✅</div>
            <h2 className="text-xl font-display text-charcoal">Demande envoyée !</h2>
            <p className="text-sm text-stone max-w-xs mx-auto">
              Votre concierge prépare une proposition avec les prestataires et créneaux compatibles.
            </p>
            <Button
              variant="outline"
              onClick={() => { setMessage(''); setSent(false) }}
            >
              Nouvelle demande
            </Button>
          </motion.div>
        )}

        {/* Recommendations */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="mt-8 space-y-3"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-charcoal">Recommandations pour votre séjour</h2>
            <span className="inline-flex items-center gap-1 text-[11px] text-stone">
              <Clock size={11} />
              Créneaux filtrés
            </span>
          </div>
          <div className="space-y-2">
            {RECOMMENDATIONS.slice(0, 4).map((service) => (
              <Link
                key={service.id}
                href={`/prestataires/${service.id}`}
                className="flex items-center gap-3 rounded-2xl border border-mist bg-surface p-3 hover:border-deep-green/40 transition-colors"
              >
                <div className="relative h-14 w-14 rounded-xl overflow-hidden flex-none">
                  <Image
                    src={(service.images.find((image) => image.is_cover) ?? service.images[0])?.url ?? ''}
                    alt={service.title_fr}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-charcoal truncate">{service.title_fr}</p>
                  <p className="text-xs text-stone truncate">{service.provider.business_name}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-turquoise/10 px-2 py-1 text-[11px] font-medium text-deep-green">
                  <Sparkles size={11} />
                  Compatible
                </span>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 space-y-3"
        >
          <h3 className="text-sm font-semibold text-charcoal">Comment ça marche</h3>
          {[
            { step: '1', title: 'Décrivez votre envie', desc: 'Plus c\'est précis, mieux c\'est.' },
            { step: '2', title: 'Votre concierge organise tout', desc: 'Réservation, logistique, surprise…' },
            { step: '3', title: 'Profitez', desc: 'Il ne reste plus qu\'à vivre l\'expérience.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-deep-green/10 text-deep-green flex items-center justify-center text-sm font-semibold flex-none">
                {step}
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal">{title}</p>
                <p className="text-xs text-stone">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
