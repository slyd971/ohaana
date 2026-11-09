import type { Metadata } from 'next'
import { HomeClient } from './_components/HomeClient'
import { EMPTY_HOME, getHomeData, safe } from '@/lib/data/services'
import { buildMetadata, toSeoLocale } from '@/lib/seo'

const TITLES: Record<string, string> = {
  fr: 'Ohaana — Chef privé, massage, DJ à domicile aux Antilles',
  en: 'Ohaana — Private chef, massage, DJ at your villa in the Caribbean',
  es: 'Ohaana — Chef privado, masaje, DJ en tu villa en el Caribe',
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = toSeoLocale((await params).locale)
  return buildMetadata({
    title: TITLES[locale],
    description: DESCRIPTIONS[locale],
    path: '/',
    locale,
    absoluteTitle: true,
  })
}

// Data is cached by lib/data/services.ts (tag "services", 5 min). The page itself stays dynamic: next-intl resolves
// the locale per request (no route-level `revalidate`, it would raise DYNAMIC_SERVER_USAGE).
const DESCRIPTIONS: Record<string, string> = {
  fr: 'Chef créole, massage au bord de la piscine, DJ pour votre terrasse : réservez les meilleurs prestataires de Guadeloupe, Martinique, Saint-Martin et Saint-Barth, à domicile.',
  en: 'Creole chef, poolside massage, DJ for your terrace: book the best providers in Guadeloupe, Martinique, Saint-Martin and Saint-Barth, at your villa.',
  es: 'Chef criollo, masaje junto a la piscina, DJ para tu terraza: reserva a los mejores profesionales de Guadalupe, Martinica, San Martín y San Bartolomé, en tu villa.',
}

export default async function HomePage() {
  const home = await safe(getHomeData(), EMPTY_HOME)
  return <HomeClient services={home.services} rows={home.rows} />
}
