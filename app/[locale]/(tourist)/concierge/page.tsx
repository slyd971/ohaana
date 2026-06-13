'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MessageCircle, Send, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const WHATSAPP_NUMBER = '590690000000'
const WHATSAPP_DEFAULT_MSG = encodeURIComponent(
  "Bonjour, je souhaite réserver une expérience sur Ohaana. Pouvez-vous m'aider ?"
)

const SUGGESTIONS = [
  'Un dîner romantique dans une villa avec vue sur mer',
  'Une sortie en catamaran pour toute la famille',
  'Un shooting photo au lever du soleil',
  'Un massage pour deux sur la plage',
  'Une dégustation de rhum chez un producteur local',
  'Un cours de cuisine créole avec marché',
]

export default function ConciergePage() {
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    // In production: send to backend / notify concierge team
    setSent(true)
  }

  function useSuggestion(s: string) {
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
              src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop"
              alt="Votre concierge"
              fill
              className="object-cover"
              sizes="96px"
            />
            <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-turquoise border-2 border-coconut" />
          </div>

          <div>
            <h1 className="text-2xl font-display text-charcoal">Votre concierge personnel</h1>
            <p className="text-stone text-sm mt-1">Disponible 7j/7 · Réponse en moins de 30 min</p>
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
            <p className="font-semibold">Contacter via WhatsApp</p>
            <p className="text-sm text-white/80">Réponse instantanée · En français ou anglais</p>
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
                Décrivez votre expérience idéale
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Je cherche quelque chose de romantique pour notre anniversaire ce soir..."
                rows={4}
                className="w-full rounded-2xl border border-mist bg-surface px-4 py-3 text-sm text-charcoal placeholder:text-stone focus:outline-none focus:border-deep-green focus:ring-2 focus:ring-deep-green/15 resize-none"
              />
            </div>

            {/* Suggestions */}
            <div>
              <p className="text-xs text-stone mb-2">Idées populaires :</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => useSuggestion(s)}
                    className="text-xs px-3 py-1.5 rounded-full bg-sand border border-mist text-charcoal-soft hover:border-deep-green hover:text-deep-green transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" fullWidth size="lg" disabled={!message.trim()}>
              <Send size={16} />
              Envoyer la demande
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
              Votre concierge vous répond sous 30 minutes avec une proposition sur mesure.
            </p>
            <Button
              variant="outline"
              onClick={() => { setMessage(''); setSent(false) }}
            >
              Nouvelle demande
            </Button>
          </motion.div>
        )}

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
