'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

type TravelerType = 'couple' | 'family' | 'friends' | 'solo'
type Interest = 'wellness' | 'adventure' | 'food' | 'culture' | 'relax'

const TRAVELERS: { value: TravelerType; label: string; emoji: string; desc: string }[] = [
  { value: 'couple',  label: 'En couple',   emoji: '💑', desc: 'Escapade romantique' },
  { value: 'family',  label: 'En famille',  emoji: '👨‍👩‍👧‍👦', desc: 'Moments inoubliables' },
  { value: 'friends', label: 'Entre amis',  emoji: '🥂', desc: 'Aventures entre complices' },
  { value: 'solo',    label: 'En solo',     emoji: '🌟', desc: 'Liberté totale' },
]

const INTERESTS: { value: Interest; label: string; emoji: string; img: string }[] = [
  { value: 'wellness',  label: 'Bien-être & spa',   emoji: '🌿', img: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=400&h=300&fit=crop&q=85&bri=8&sat=8' },
  { value: 'adventure', label: 'Aventure & nature', emoji: '🌊', img: 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=400&h=300&fit=crop&q=85&bri=5&sat=10' },
  { value: 'food',      label: 'Gastronomie',       emoji: '🍽️', img: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=300&fit=crop&q=85&bri=8&sat=8' },
  { value: 'culture',   label: 'Culture locale',    emoji: '🎭', img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop&q=85&bri=8&sat=10' },
  { value: 'relax',     label: 'Détente',           emoji: '🌅', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&q=85&bri=8&sat=10' },
]

const slide = {
  initial:  { opacity: 0, x: 40 },
  animate:  { opacity: 1, x: 0 },
  exit:     { opacity: 0, x: -40 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [traveler, setTraveler] = useState<TravelerType | null>(null)
  const [interests, setInterests] = useState<Interest[]>([])

  function toggleInterest(v: Interest) {
    setInterests((prev) =>
      prev.includes(v) ? prev.filter((i) => i !== v) : [...prev, v]
    )
  }

  function finish() {
    // In production: save to tourist_profiles via Supabase
    router.push('/')
  }

  const steps = [
    // ── Step 0: Welcome ─────────────────────────────────────────
    <motion.div key="welcome" {...slide} className="flex flex-col items-center text-center px-6 pt-16 pb-8 space-y-8">
      <div className="relative w-full h-52 rounded-3xl overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=500&fit=crop&q=90&bri=5&sat=12"
          alt="Guadeloupe"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-green/60 to-transparent" />
        <p className="absolute bottom-5 left-5 right-5 text-2xl font-display text-coconut leading-tight">
          Votre expérience caribéenne<br />commence maintenant.
        </p>
      </div>

      <div className="space-y-3 max-w-xs">
        <p className="text-stone text-sm leading-relaxed">
          Découvrez des expériences uniques, des prestataires passionnés et une île qui vous attend.
        </p>
      </div>

      <div className="w-full space-y-3 pt-2">
        <Button fullWidth size="lg" onClick={() => setStep(1)}>
          Commencer
        </Button>
        <Link href="/" className="block text-center text-sm text-stone hover:text-charcoal transition-colors">
          Passer
        </Link>
      </div>
    </motion.div>,

    // ── Step 1: Traveler type ────────────────────────────────────
    <motion.div key="traveler" {...slide} className="px-5 pt-8 pb-8 space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-medium text-deep-green uppercase tracking-widest">Étape 1 / 3</p>
        <h2 className="text-2xl font-display text-charcoal">Vous voyagez…</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {TRAVELERS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTraveler(t.value)}
            className={cn(
              'relative p-5 rounded-2xl border-2 text-left transition-all active:scale-[0.97]',
              traveler === t.value
                ? 'border-deep-green bg-deep-green/5'
                : 'border-mist bg-surface hover:border-stone'
            )}
          >
            <div className="text-3xl mb-2">{t.emoji}</div>
            <div className="font-medium text-charcoal text-sm">{t.label}</div>
            <div className="text-xs text-stone mt-0.5">{t.desc}</div>
            {traveler === t.value && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-deep-green flex items-center justify-center">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <Button fullWidth size="lg" onClick={() => setStep(2)} disabled={!traveler}>
        Suivant
      </Button>
    </motion.div>,

    // ── Step 2: Interests ────────────────────────────────────────
    <motion.div key="interests" {...slide} className="px-5 pt-8 pb-8 space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-medium text-deep-green uppercase tracking-widest">Étape 2 / 3</p>
        <h2 className="text-2xl font-display text-charcoal">Qu'est-ce qui vous attire&nbsp;?</h2>
        <p className="text-sm text-stone">Choisissez un ou plusieurs univers</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {INTERESTS.map((interest) => {
          const selected = interests.includes(interest.value)
          return (
            <button
              key={interest.value}
              type="button"
              onClick={() => toggleInterest(interest.value)}
              className={cn(
                'relative rounded-2xl overflow-hidden h-28 transition-all active:scale-[0.97]',
                selected ? 'ring-2 ring-deep-green ring-offset-2' : ''
              )}
            >
              <Image src={interest.img} alt={interest.label} fill className="object-cover" sizes="160px" />
              <div className={cn(
                'absolute inset-0 flex flex-col items-center justify-center transition-colors',
                selected ? 'bg-deep-green/60' : 'bg-black/30'
              )}>
                <span className="text-2xl">{interest.emoji}</span>
                <span className="text-xs font-medium text-coconut mt-1">{interest.label}</span>
              </div>
            </button>
          )
        })}
      </div>

      <Button fullWidth size="lg" onClick={() => setStep(3)} disabled={interests.length === 0}>
        Suivant
      </Button>
    </motion.div>,

    // ── Step 3: Account ──────────────────────────────────────────
    <motion.div key="account" {...slide} className="px-5 pt-8 pb-8 space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-medium text-deep-green uppercase tracking-widest">Étape 3 / 3</p>
        <h2 className="text-2xl font-display text-charcoal">Dernière étape</h2>
        <p className="text-sm text-stone">Créez votre compte pour sauvegarder vos préférences.</p>
      </div>

      <div className="space-y-3">
        <Link href="/register">
          <Button fullWidth size="lg">
            Créer mon compte
          </Button>
        </Link>
        <Link href="/login">
          <Button fullWidth size="lg" variant="outline">
            J'ai déjà un compte
          </Button>
        </Link>
        <button
          type="button"
          onClick={finish}
          className="w-full text-center text-sm text-stone hover:text-charcoal transition-colors py-2"
        >
          Continuer sans compte
        </button>
      </div>
    </motion.div>,
  ]

  return (
    <div className="min-h-dvh bg-coconut flex flex-col max-w-lg mx-auto">
      {/* Progress dots */}
      {step > 0 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                s <= step ? 'bg-deep-green w-8' : 'bg-mist w-4'
              )}
            />
          ))}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {steps[step]}
        </AnimatePresence>
      </div>
    </div>
  )
}
