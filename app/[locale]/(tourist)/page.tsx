import type { Metadata } from 'next'
import { HomeClient } from './_components/HomeClient'
import { EMPTY_HOME, getHomeData, safe } from '@/lib/data/services'

const TITLES: Record<string, string> = {
  fr: 'Ohaana — Chef privé, massage, DJ à domicile aux Antilles',
  en: 'Ohaana — Private chef, massage, DJ at your villa in the Caribbean',
  es: 'Ohaana — Chef privado, masaje, DJ en tu villa en el Caribe',
}

// Canonical + hreflang for the home (localePrefix "as-needed": fr = "/", others = "/en", "/es").
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const path = (l: string) => (l === 'fr' ? '/' : `/${l}`)
  return {
    title: { absolute: TITLES[locale] ?? TITLES.fr },
    alternates: {
      canonical: path(locale),
      languages: { fr: '/', en: '/en', es: '/es', 'x-default': '/' },
    },
  }
}

// Data is cached by lib/data/services.ts (tag "services", 5 min). The page itself stays dynamic: next-intl resolves
// the locale per request (no route-level `revalidate`, it would raise DYNAMIC_SERVER_USAGE).
export default async function HomePage() {
  const home = await safe(getHomeData(), EMPTY_HOME)
  return <HomeClient services={home.services} rows={home.rows} />
}
