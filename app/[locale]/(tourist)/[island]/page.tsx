import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LandingPage } from '@/components/seo/LandingPage'
import { getPublishedServices, safe } from '@/lib/data/services'
import { buildMetadata, toSeoLocale } from '@/lib/seo'
import { CATEGORIES, islandBySlug } from '@/lib/seo/editorial'
import { filterServices, landingTarget, minPriceCents } from '@/lib/seo/catalogue'
import { buildLanding } from '@/lib/seo/landing'
import { formatPrice } from '@/lib/utils'

type Params = Promise<{ locale: string; island: string }>
const INTL = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES' } as const

async function load(params: Params) {
  const { locale: raw, island: slug } = await params
  const island = islandBySlug(slug)
  if (!island) return null
  const locale = toSeoLocale(raw)
  const catalogue = await safe(getPublishedServices(200), [])
  const target = landingTarget(catalogue, island, null)
  const min = minPriceCents(target.services)
  const categoryNames = CATEGORIES.filter((c) => filterServices(catalogue, island, c).length > 0).map((c) => c.head[locale])
  const content = buildLanding({ locale, island, count: target.services.length, minPrice: min === null ? null : formatPrice(min, 'EUR', INTL[locale]), categoryNames })
  return { locale, island, catalogue, target, content }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const data = await load(params)
  if (!data) return {}
  return buildMetadata({
    title: data.content.title,
    description: data.content.description,
    path: `/${data.island.slug}`,
    locale: data.locale,
    noindex: !data.target.indexable,
  })
}

export default async function IslandPage({ params }: { params: Params }) {
  const data = await load(params)
  if (!data) notFound()
  return <LandingPage locale={data.locale} island={data.island} category={null} content={data.content} services={data.target.services} catalogue={data.catalogue} />
}
