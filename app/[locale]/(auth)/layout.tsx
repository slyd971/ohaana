import Image from 'next/image'
import { getLocale } from 'next-intl/server'
import { ShieldCheck, MessageCircle, MapPin } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { getEnabledProviders } from '@/lib/auth/providers'
import { AuthProvidersProvider } from '@/components/auth/AuthProviders'
import type { Metadata } from 'next'
import { PRIVATE_METADATA } from '@/lib/seo'

// Espace privé : jamais indexé.
export const metadata: Metadata = PRIVATE_METADATA

const COPY = {
  fr: {
    tagline: 'Les Antilles, sans les intermédiaires.',
    sub: 'Chef privé, massage, DJ… des prestataires locaux, réservés en quelques minutes.',
    points: ['Prestataires locaux vérifiés', 'Réponse de Camille en moins de 2 h', 'Guadeloupe, Martinique, Saint-Martin'],
    back: 'Retour au site',
    alt: 'Séance de yoga sur une plage tropicale',
  },
  en: {
    tagline: 'The Caribbean, without the middlemen.',
    sub: 'Private chef, massage, DJ… local providers, booked in minutes.',
    points: ['Verified local providers', 'Camille replies in under 2 h', 'Guadeloupe, Martinique, Saint-Martin'],
    back: 'Back to site',
    alt: 'Yoga session on a tropical beach',
  },
  es: {
    tagline: 'El Caribe, sin intermediarios.',
    sub: 'Chef privado, masaje, DJ… proveedores locales, reservados en minutos.',
    points: ['Proveedores locales verificados', 'Camille responde en menos de 2 h', 'Guadalupe, Martinica, San Martín'],
    back: 'Volver al sitio',
    alt: 'Sesión de yoga en una playa tropical',
  },
} as const

const POINT_ICONS = [ShieldCheck, MessageCircle, MapPin]

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const providers = await getEnabledProviders()
  const locale = await getLocale()
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.fr
  return (
    <AuthProvidersProvider google={providers.google}>
    <div className="min-h-dvh bg-coconut lg:grid lg:grid-cols-2">
      {/* Brand panel (desktop only) */}
      <aside className="relative hidden overflow-hidden lg:block">
        <Image
          src="/photos/yoga-plage-tropicale.jpeg"
          alt={copy.alt}
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-green/90 via-deep-green/40 to-deep-green/20" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link href="/" className="font-display text-3xl italic">Ohaana</Link>
          <div className="max-w-md">
            <h2 className="font-display text-4xl leading-tight">{copy.tagline}</h2>
            <p className="mt-3 text-base text-white/85">{copy.sub}</p>
            <ul className="mt-8 space-y-3">
              {copy.points.map((point, i) => {
                const Icon = POINT_ICONS[i]
                return (
                  <li key={point} className="flex items-center gap-3 text-sm">
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                      <Icon size={15} aria-hidden="true" />
                    </span>
                    {point}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </aside>

      <div className="relative flex min-h-dvh flex-col overflow-x-hidden">
        {/* Decorative background (mobile / tablet) */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden lg:hidden">
          <div
            className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, var(--turquoise), transparent 70%)' }}
          />
          <div
            className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, var(--coral), transparent 70%)' }}
          />
        </div>

        {/* Back to home */}
        <div className="relative px-4 pt-6 lg:px-10">
          <Link href="/" className="inline-flex min-h-11 items-center gap-1.5 text-sm text-stone hover:text-charcoal transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-display italic text-deep-green text-lg lg:hidden">Ohaana</span>
            <span className="hidden lg:inline">{copy.back}</span>
          </Link>
        </div>

        <main className="relative flex-1 flex w-full items-center justify-start px-4 py-8 sm:justify-center">
          <div className="w-full max-w-[20rem] min-w-0 sm:max-w-md">
            {children}
          </div>
        </main>
      </div>
    </div>
    </AuthProvidersProvider>
  )
}
