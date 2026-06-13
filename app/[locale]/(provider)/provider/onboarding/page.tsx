'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { CheckCircle, Upload, Globe, Phone, MapPin, FileText, Camera, Star } from 'lucide-react'

const ISLANDS = ['Guadeloupe', 'Martinique', 'Saint-Martin', 'Saint-Barthélemy', 'La Réunion']
const CATEGORIES = [
  { id: 'chef_prive',  label: 'Chef privé',          emoji: '🍽️' },
  { id: 'massage',     label: 'Massage & spa',        emoji: '💆' },
  { id: 'bateau',      label: 'Tour en bateau',       emoji: '⛵' },
  { id: 'photographe', label: 'Photographe',          emoji: '📸' },
  { id: 'fitness',     label: 'Coach fitness',        emoji: '🏋️' },
  { id: 'culture',     label: 'Expérience culturelle',emoji: '🎭' },
  { id: 'coiffure',    label: 'Coiffure',             emoji: '💇' },
  { id: 'maquillage',  label: 'Maquillage',           emoji: '💄' },
  { id: 'babysitter',  label: 'Babysitter',           emoji: '👶' },
  { id: 'guide',       label: 'Guide touristique',    emoji: '🗺️' },
]
const LANGS = [
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'en', label: 'English',  flag: '🇬🇧' },
  { id: 'es', label: 'Español',  flag: '🇪🇸' },
  { id: 'de', label: 'Deutsch',  flag: '🇩🇪' },
]

const slide = {
  initial:  { opacity: 0, x: 32 },
  animate:  { opacity: 1, x: 0 },
  exit:     { opacity: 0, x: -32 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
}

const STEPS = ['Profil', 'Activité', 'Tarifs', 'Documents']

type FormState = {
  businessName: string
  bio: string
  island: string
  phone: string
  languages: string[]
  category: string
  serviceTitle: string
  serviceDesc: string
  price: string
  duration: string
  capacity: string
  certifications: string
  hasKbis: boolean
  hasAssurance: boolean
  hasPhoto: boolean
}

const INIT: FormState = {
  businessName: '', bio: '', island: '', phone: '',
  languages: ['fr'], category: '', serviceTitle: '',
  serviceDesc: '', price: '', duration: '', capacity: '',
  certifications: '', hasKbis: false, hasAssurance: false, hasPhoto: false,
}

export default function ProviderOnboarding() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(INIT)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleLang(id: string) {
    set('languages', form.languages.includes(id)
      ? form.languages.filter((l) => l !== id)
      : [...form.languages, id]
    )
  }

  const canNext = [
    form.businessName.length > 2 && form.bio.length > 20 && !!form.island && !!form.phone,
    !!form.category && form.serviceTitle.length > 5,
    !!form.price && !!form.duration && !!form.capacity,
    form.hasKbis && form.hasAssurance && form.hasPhoto,
  ]

  if (submitted) {
    return (
      <div className="min-h-[80dvh] flex flex-col items-center justify-center px-6 text-center space-y-6">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.6 }}>
          <div className="w-20 h-20 rounded-full bg-turquoise/15 flex items-center justify-center mx-auto">
            <CheckCircle size={40} className="text-turquoise" />
          </div>
        </motion.div>
        <div>
          <h2 className="text-2xl font-display text-charcoal">Dossier envoyé !</h2>
          <p className="text-stone text-sm mt-2 max-w-sm">
            Notre équipe examine votre profil sous 48 h. Vous recevrez une confirmation par email. Bienvenue dans la famille Ohaana 🌺
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button fullWidth onClick={() => router.push('/provider/dashboard')}>
            Accéder à mon espace
          </Button>
          <Button fullWidth variant="outline" onClick={() => router.push('/')}>
            Retour au site
          </Button>
        </div>
      </div>
    )
  }

  const steps = [
    // ── Step 0: Profil ───────────────────────────────────────────
    <motion.div key="profil" {...slide} className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-deep-green uppercase tracking-widest mb-1">Étape 1 · Profil</p>
        <h2 className="text-2xl font-display text-charcoal">Présentez votre activité</h2>
        <p className="text-sm text-stone mt-1">Ces informations apparaîtront sur votre page publique.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-charcoal mb-1.5 block">Nom de votre activité *</label>
          <input
            value={form.businessName}
            onChange={(e) => set('businessName', e.target.value)}
            placeholder="Ex. Chef Marcus, Massage Madeleine…"
            className="w-full px-4 py-3 rounded-xl border border-mist bg-white text-charcoal placeholder:text-stone text-sm focus:outline-none focus:border-deep-green transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-charcoal mb-1.5 block">Bio (présentée aux clients) *</label>
          <textarea
            value={form.bio}
            onChange={(e) => set('bio', e.target.value)}
            placeholder="Décrivez votre expertise, votre histoire, ce qui vous rend unique…"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-mist bg-white text-charcoal placeholder:text-stone text-sm focus:outline-none focus:border-deep-green transition-colors resize-none"
          />
          <p className="text-xs text-stone/60 mt-1">{form.bio.length} / 500 caractères</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-charcoal mb-1.5 flex items-center gap-1.5">
              <MapPin size={11} className="text-deep-green" /> Île principale *
            </label>
            <select
              value={form.island}
              onChange={(e) => set('island', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-mist bg-white text-charcoal text-sm focus:outline-none focus:border-deep-green transition-colors appearance-none"
            >
              <option value="">Choisir…</option>
              {ISLANDS.map((i) => <option key={i} value={i.toLowerCase()}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-charcoal mb-1.5 flex items-center gap-1.5">
              <Phone size={11} className="text-deep-green" /> WhatsApp *
            </label>
            <input
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+590 690…"
              className="w-full px-4 py-3 rounded-xl border border-mist bg-white text-charcoal placeholder:text-stone text-sm focus:outline-none focus:border-deep-green transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-charcoal mb-2 flex items-center gap-1.5">
            <Globe size={11} className="text-deep-green" /> Langues parlées
          </label>
          <div className="flex gap-2 flex-wrap">
            {LANGS.map(({ id, label, flag }) => (
              <button
                key={id}
                type="button"
                onClick={() => toggleLang(id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-sm border transition-all',
                  form.languages.includes(id)
                    ? 'border-deep-green bg-deep-green/8 text-charcoal font-medium'
                    : 'border-mist text-stone hover:border-stone'
                )}
              >
                {flag} {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>,

    // ── Step 1: Activité ─────────────────────────────────────────
    <motion.div key="activite" {...slide} className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-deep-green uppercase tracking-widest mb-1">Étape 2 · Activité</p>
        <h2 className="text-2xl font-display text-charcoal">Votre premier service</h2>
        <p className="text-sm text-stone mt-1">Vous pourrez en ajouter d'autres depuis votre dashboard.</p>
      </div>

      <div>
        <label className="text-xs font-medium text-charcoal mb-2 block">Catégorie *</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(({ id, label, emoji }) => (
            <button
              key={id}
              type="button"
              onClick={() => set('category', id)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm text-left transition-all',
                form.category === id
                  ? 'border-deep-green bg-deep-green/8 text-charcoal font-medium'
                  : 'border-mist text-stone hover:border-stone'
              )}
            >
              <span>{emoji}</span>{label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-charcoal mb-1.5 block">Titre du service *</label>
        <input
          value={form.serviceTitle}
          onChange={(e) => set('serviceTitle', e.target.value)}
          placeholder="Ex. Dîner privé créole en villa, 4–8 pers."
          className="w-full px-4 py-3 rounded-xl border border-mist bg-white text-charcoal placeholder:text-stone text-sm focus:outline-none focus:border-deep-green transition-colors"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-charcoal mb-1.5 block">Description</label>
        <textarea
          value={form.serviceDesc}
          onChange={(e) => set('serviceDesc', e.target.value)}
          placeholder="Décrivez l'expérience, ce qui est inclus, le lieu…"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-mist bg-white text-charcoal placeholder:text-stone text-sm focus:outline-none focus:border-deep-green transition-colors resize-none"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-charcoal mb-1.5 flex items-center gap-1.5">
          <Star size={11} className="text-deep-green" /> Certifications (optionnel)
        </label>
        <input
          value={form.certifications}
          onChange={(e) => set('certifications', e.target.value)}
          placeholder="CAP Cuisine, BPJEPS, Capitaine 200…"
          className="w-full px-4 py-3 rounded-xl border border-mist bg-white text-charcoal placeholder:text-stone text-sm focus:outline-none focus:border-deep-green transition-colors"
        />
      </div>
    </motion.div>,

    // ── Step 2: Tarifs ───────────────────────────────────────────
    <motion.div key="tarifs" {...slide} className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-deep-green uppercase tracking-widest mb-1">Étape 3 · Tarifs</p>
        <h2 className="text-2xl font-display text-charcoal">Définissez vos prix</h2>
        <p className="text-sm text-stone mt-1">Ohaana prélève 20 % de commission sur chaque réservation.</p>
      </div>

      <div className="bg-sand rounded-2xl p-4 border border-mist">
        <p className="text-xs font-medium text-charcoal mb-3">Simulateur de revenus</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-stone">Prix affiché :</span>
          <span className="font-semibold text-charcoal">{form.price ? `${form.price} €` : '—'}</span>
          <span className="text-stone mx-1">→</span>
          <span className="text-stone">Vous percevez :</span>
          <span className="font-semibold text-deep-green">
            {form.price ? `${(parseFloat(form.price) * 0.8).toFixed(0)} €` : '—'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-charcoal mb-1.5 block">Prix (€) *</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            placeholder="150"
            min="10"
            className="w-full px-4 py-3 rounded-xl border border-mist bg-white text-charcoal placeholder:text-stone text-sm focus:outline-none focus:border-deep-green transition-colors"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-charcoal mb-1.5 block">Durée (min) *</label>
          <input
            type="number"
            value={form.duration}
            onChange={(e) => set('duration', e.target.value)}
            placeholder="120"
            min="30"
            className="w-full px-4 py-3 rounded-xl border border-mist bg-white text-charcoal placeholder:text-stone text-sm focus:outline-none focus:border-deep-green transition-colors"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-charcoal mb-1.5 block">Capacité max *</label>
          <input
            type="number"
            value={form.capacity}
            onChange={(e) => set('capacity', e.target.value)}
            placeholder="8"
            min="1"
            className="w-full px-4 py-3 rounded-xl border border-mist bg-white text-charcoal placeholder:text-stone text-sm focus:outline-none focus:border-deep-green transition-colors"
          />
        </div>
      </div>

      <div className="bg-deep-green/5 rounded-2xl p-4 border border-deep-green/15 space-y-1">
        <p className="text-xs font-semibold text-charcoal">Conditions de paiement</p>
        <p className="text-xs text-stone">Versement sous 7 jours ouvrés après chaque prestation. Stripe Connect sécurisé. Retrait instantané disponible.</p>
      </div>
    </motion.div>,

    // ── Step 3: Documents ────────────────────────────────────────
    <motion.div key="docs" {...slide} className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-deep-green uppercase tracking-widest mb-1">Étape 4 · Documents</p>
        <h2 className="text-2xl font-display text-charcoal">Vérification du profil</h2>
        <p className="text-sm text-stone mt-1">Documents requis pour activer votre compte prestataire.</p>
      </div>

      <div className="space-y-3">
        {[
          { key: 'hasKbis' as const, icon: FileText, label: 'Extrait Kbis ou attestation auto-entrepreneur', desc: 'PDF ou image · Max 5 Mo' },
          { key: 'hasAssurance' as const, icon: FileText, label: 'Attestation responsabilité civile professionnelle', desc: 'PDF ou image · Max 5 Mo' },
          { key: 'hasPhoto' as const, icon: Camera, label: 'Photo de profil professionnelle', desc: 'JPG/PNG · Min 400×400 px' },
        ].map(({ key, icon: Icon, label, desc }) => (
          <button
            key={key}
            type="button"
            onClick={() => set(key, !form[key])}
            className={cn(
              'w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all',
              form[key]
                ? 'border-turquoise bg-turquoise/5'
                : 'border-mist bg-surface hover:border-stone'
            )}
          >
            <div className={cn('mt-0.5 p-2 rounded-xl flex-none', form[key] ? 'bg-turquoise/15' : 'bg-mist/60')}>
              {form[key]
                ? <CheckCircle size={16} className="text-turquoise" />
                : <Upload size={16} className="text-stone" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium', form[key] ? 'text-charcoal' : 'text-stone')}>{label}</p>
              <p className="text-xs text-stone/60 mt-0.5">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-sand rounded-2xl p-4 border border-mist text-xs text-stone space-y-1">
        <p className="font-medium text-charcoal">Validation sous 48h</p>
        <p>Notre équipe vérifie chaque dossier manuellement. Vous serez notifié par email dès l'activation de votre profil.</p>
      </div>
    </motion.div>,
  ]

  return (
    <div className="p-5 md:p-8 max-w-lg">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors flex-none',
              i < step ? 'bg-deep-green text-coconut'
                : i === step ? 'bg-deep-green text-coconut ring-4 ring-deep-green/20'
                : 'bg-mist text-stone'
            )}>
              {i < step ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className={cn('text-xs hidden sm:block transition-colors', i === step ? 'text-charcoal font-medium' : 'text-stone')}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={cn('h-px flex-1 transition-colors', i < step ? 'bg-deep-green' : 'bg-mist')} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {steps[step]}
      </AnimatePresence>

      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
            Retour
          </Button>
        )}
        <Button
          fullWidth
          disabled={!canNext[step]}
          onClick={() => {
            if (step < STEPS.length - 1) setStep((s) => s + 1)
            else setSubmitted(true)
          }}
        >
          {step === STEPS.length - 1 ? 'Soumettre mon dossier' : 'Continuer'}
        </Button>
      </div>
    </div>
  )
}
