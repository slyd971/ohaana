import { Link } from '@/lib/i18n/navigation'
import { OhaanaLogo } from '@/components/layout/OhaanaLogo'
import { Search, Home, MessageCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-coconut flex flex-col items-center justify-center px-6 text-center">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-turquoise/5" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-coral/5" />
      </div>

      <div className="relative space-y-8 max-w-sm">
        <div className="flex justify-center">
          <OhaanaLogo size="md" />
        </div>

        {/* Big 404 */}
        <div className="space-y-1">
          <p className="text-[96px] font-display text-deep-green/10 leading-none select-none">404</p>
          <h1 className="text-2xl font-display text-charcoal -mt-4">Page introuvable</h1>
          <p className="text-stone text-sm leading-relaxed">
            Cette page n'existe pas ou a été déplacée. Pas de panique — les plus belles expériences caribéennes vous attendent.
          </p>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-2xl bg-deep-green text-coconut font-medium text-sm hover:bg-deep-green/90 transition-colors"
          >
            <Home size={16} />
            Retour à l'accueil
          </Link>
          <Link
            href="/search"
            className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-2xl border border-mist text-charcoal font-medium text-sm hover:bg-sand transition-colors"
          >
            <Search size={16} />
            Explorer les expériences
          </Link>
          <Link
            href="/concierge"
            className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-2xl text-deep-green font-medium text-sm hover:text-coral transition-colors"
          >
            <MessageCircle size={16} />
            Contacter le concierge
          </Link>
        </div>
      </div>
    </div>
  )
}
