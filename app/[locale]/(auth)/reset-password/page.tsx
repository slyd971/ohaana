'use client'

import { useState } from 'react'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { OhaanaLogo } from '@/components/layout/OhaanaLogo'
import { CheckCircle2, ChevronLeft, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-coconut flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4">
          <OhaanaLogo variant="dark" size="md" />
        </div>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-deep-green/10 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-deep-green" />
              </div>
              <div>
                <h1 className="text-xl font-display text-charcoal">Email envoyé</h1>
                <p className="text-sm text-stone mt-2 leading-relaxed">
                  Si un compte existe pour <span className="font-medium text-charcoal">{email}</span>, vous recevrez un lien de réinitialisation dans quelques minutes.
                </p>
              </div>
              <p className="text-xs text-stone">Vérifiez également vos spams.</p>
              <Link href="/login">
                <Button variant="ghost" fullWidth className="mt-2">
                  Retour à la connexion
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-2xl font-display text-charcoal">Mot de passe oublié</h1>
                <p className="text-sm text-stone mt-1.5 leading-relaxed">
                  Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Adresse email"
                  type="email"
                  required
                  placeholder="vous@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  leftIcon={<Mail size={16} />}
                />
                <Button type="submit" fullWidth variant="primary" loading={loading}>
                  Envoyer le lien
                </Button>
              </form>

              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-stone hover:text-charcoal transition-colors"
              >
                <ChevronLeft size={15} /> Retour à la connexion
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
