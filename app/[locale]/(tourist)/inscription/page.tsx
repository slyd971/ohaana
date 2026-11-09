import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { Link } from '@/lib/i18n/navigation'

export const metadata: Metadata = { robots: { index: false, follow: false } }

const COPY = {
  fr: {
    confirmed: ['Inscription confirmée', 'Merci ! Vous recevrez les prochaines nouveautés d’Ohaana. Désinscription possible à tout moment depuis chaque email.'],
    unsubscribed: ['Vous êtes désinscrit', 'Vous ne recevrez plus nos actualités. Vos réservations et leurs emails ne sont pas concernés.'],
    invalid: ['Lien invalide ou expiré', 'Ce lien n’est plus valable. Vous pouvez vous réinscrire depuis la page d’accueil.'],
    home: 'Retour à l’accueil',
  },
  en: {
    confirmed: ['Subscription confirmed', 'Thank you! You will receive Ohaana’s next news. You can unsubscribe at any time from any email.'],
    unsubscribed: ['You are unsubscribed', 'You will no longer receive our news. Your bookings and their emails are not affected.'],
    invalid: ['Invalid or expired link', 'This link is no longer valid. You can sign up again from the home page.'],
    home: 'Back to home',
  },
  es: {
    confirmed: ['Suscripción confirmada', '¡Gracias! Recibirás las próximas novedades de Ohaana. Puedes darte de baja en cualquier momento desde cada email.'],
    unsubscribed: ['Te has dado de baja', 'Ya no recibirás nuestras novedades. Tus reservas y sus emails no se ven afectados.'],
    invalid: ['Enlace no válido o caducado', 'Este enlace ya no es válido. Puedes volver a suscribirte desde la página de inicio.'],
    home: 'Volver al inicio',
  },
} as const

export default async function SubscriptionStatusPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const locale = (await getLocale()) as 'fr' | 'en' | 'es'
  const { status } = await searchParams
  const t = COPY[locale] ?? COPY.fr
  const key = status === 'confirmed' || status === 'unsubscribed' ? status : 'invalid'
  const [title, body] = t[key]
  return (
    <div className="min-h-screen bg-coconut pt-16">
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="font-display text-3xl text-charcoal">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-charcoal-soft">{body}</p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-deep-green px-6 py-2.5 text-sm font-medium text-coconut">
          {t.home}
        </Link>
      </div>
    </div>
  )
}
