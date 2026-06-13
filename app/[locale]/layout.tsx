import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/lib/i18n/routing'
import '../globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Ohaana — Expériences caribéennes premium',
    template: '%s | Ohaana',
  },
  description:
    'Réservez des expériences authentiques en Guadeloupe : chef privé, massage en villa, catamaran au coucher du soleil, et bien plus.',
  keywords: ['guadeloupe', 'caribéen', 'expériences', 'luxe', 'chef privé', 'spa'],
  openGraph: {
    siteName: 'Ohaana',
    type: 'website',
    locale: 'fr_FR',
  },
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'fr' | 'en')) {
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
