import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { MotionProvider } from '@/components/MotionProvider'
import { getMessages } from 'next-intl/server'
import { routing } from '@/lib/i18n/routing'
import { SITE_URL } from '@/lib/site'
import { DEMO_MODE } from '@/lib/demo-mode'
import { AuthProvider } from '@/lib/auth/AuthProvider'
import { Playfair_Display, Inter } from 'next/font/google'
import '../globals.css'

// Police des titres. Playfair Display (remplace Fraunces dont le « f » était tordu).
const display = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display-serif',
  display: 'swap',
})
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const BASE = SITE_URL
const OG_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=630&fit=crop&q=85'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1A3D2B',
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'Ohaana — Massage, chef privé, DJ à domicile · Guadeloupe, Martinique, Saint-Martin',
    template: '%s | Ohaana',
  },
  description:
    'Chef créole, massage en bord de piscine, DJ pour votre terrasse — les meilleurs prestataires des Antilles, réservés en quelques clics depuis votre villa.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  // canonical / hreflang are defined per page (a layout-level canonical would point every page to the home).
  openGraph: {
    siteName: 'Ohaana',
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: ['en_US', 'es_ES'],
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Ohaana — Services locaux pour hébergements privatifs' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ohaana_caraibe',
    images: [OG_IMAGE],
  },
  // La démo ne doit jamais être indexée (robots.txt la bloque déjà : on double côté balise).
  robots: DEMO_MODE ? { index: false, follow: false } : { index: true, follow: true },
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE}/#organization`,
  name: 'Ohaana',
  url: BASE,
  logo: `${BASE}/icon-512.png`,
  sameAs: [],
  description: 'Plateforme de réservation de services locaux vérifiés pour voyageurs en villa, bungalow, Airbnb et maison de vacances.',
  areaServed: ['Guadeloupe', 'Martinique', 'Saint-Martin', 'Saint-Barthélemy'],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE}/#website`,
  url: BASE,
  name: 'Ohaana',
  publisher: { '@id': `${BASE}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${BASE}/search?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'fr' | 'en' | 'es')) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} className={`h-full scroll-smooth ${display.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="h-full antialiased" style={{ fontFamily: 'var(--font-body)' }}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <MotionProvider><AuthProvider>{children}</AuthProvider></MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
