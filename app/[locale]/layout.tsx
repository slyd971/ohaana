import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/lib/i18n/routing'
import '../globals.css'

const BASE = 'https://ohaana.com'
const OG_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=630&fit=crop&q=85'

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'Ohaana — Expériences caribéennes premium',
    template: '%s | Ohaana',
  },
  description:
    'Réservez des services à domicile en Guadeloupe et Martinique : chef privé, massage à domicile, DJ, décoration, soins beauté — livrés chez vous.',
  keywords: ['guadeloupe', 'martinique', 'caraïbes', 'expériences', 'chef privé', 'massage', 'spa', 'villa', 'luxe'],
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
  alternates: {
    canonical: BASE,
    languages: {
      fr: BASE,
      en: `${BASE}/en`,
      es: `${BASE}/es`,
      'x-default': BASE,
    },
  },
  openGraph: {
    siteName: 'Ohaana',
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: ['en_US', 'es_ES'],
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Ohaana — Expériences caribéennes premium' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ohaana_caraibe',
    images: [OG_IMAGE],
  },
  robots: { index: true, follow: true },
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
  description: 'Plateforme de réservation de services et expériences premium à domicile dans les Caraïbes françaises.',
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
    <html lang={locale} className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#1A3D2B" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
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
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
