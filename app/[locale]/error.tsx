'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { RefreshCw, Home } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { OhaanaLogo } from '@/components/layout/OhaanaLogo'

/** Page d'erreur (500) localisée : message clair, nouvel essai et retour à l'accueil. Aucun détail technique n'est affiché. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('errorPages')

  useEffect(() => {
    console.error('[page error]', error.digest ?? error.message)
  }, [error])

  return (
    <div className="min-h-dvh bg-coconut flex flex-col items-center justify-center px-6 text-center">
      <div className="space-y-6 max-w-sm" role="alert">
        <div className="flex justify-center"><OhaanaLogo size="md" /></div>
        <div className="space-y-2">
          <h1 className="text-2xl font-display text-charcoal">{t('errorTitle')}</h1>
          <p className="text-sm leading-relaxed text-stone">{t('errorBody')}</p>
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onClick={reset}
            className="flex w-full items-center justify-center gap-2 rounded-card bg-deep-green px-5 py-3 text-sm font-medium text-coconut hover:bg-deep-green/90"
          >
            <RefreshCw size={16} /> {t('retry')}
          </button>
          <Link href="/" className="flex w-full items-center justify-center gap-2 rounded-card border border-mist px-5 py-3 text-sm font-medium text-charcoal hover:bg-sand">
            <Home size={16} /> {t('home')}
          </Link>
        </div>
      </div>
    </div>
  )
}
