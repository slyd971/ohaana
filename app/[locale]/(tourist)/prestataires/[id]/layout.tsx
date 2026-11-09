import type { Metadata } from 'next'
import { getReviews, getServiceByIdOrSlug, safe } from '@/lib/data/services'
import { JsonLd } from '@/components/seo/JsonLd'
import { absolute, breadcrumbJsonLd, buildMetadata, toSeoLocale, type SeoLocale } from '@/lib/seo'
import { categoryByDb, islandByDb } from '@/lib/seo/editorial'
import type { ServiceView } from '@/lib/data/types'

interface Props {
  children: React.ReactNode
  params: Promise<{ id: string; locale: string }>
}

const pick = (s: ServiceView, locale: SeoLocale) => ({
  title: locale === 'en' ? s.title_en : locale === 'es' ? s.title_es : s.title_fr,
  description: (locale === 'en' ? s.description_en : locale === 'es' ? s.description_es : s.description_fr) || s.description_fr,
})
const altOf = (img: ServiceView['images'][number], locale: SeoLocale, fallback: string) =>
  (locale === 'en' ? img.alt_en : locale === 'es' ? img.alt_es : img.alt_fr) || img.alt_fr || fallback

export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }): Promise<Metadata> {
  const { id, locale: raw } = await params
  const locale = toSeoLocale(raw)
  const service = await safe(getServiceByIdOrSlug(id), null)
  if (!service) return {}

  const { title, description } = pick(service, locale)
  const cover = service.images.find((i) => i.is_cover) ?? service.images[0]
  const island = islandByDb(service.island)?.name[locale] ?? ''
  return {
    ...buildMetadata({
      title,
      description,
      path: `/prestataires/${service.id}`,
      locale,
      image: cover ? { url: cover.url, width: 1200, height: 800, alt: altOf(cover, locale, title) } : undefined,
    }),
    // Titre complet : « Service — Île | Ohaana ».
    ...(island ? { title: `${title} — ${island}` } : {}),
  }
}

export default async function ServiceLayout({ children, params }: Props) {
  const { id, locale: raw } = await params
  const locale = toSeoLocale(raw)
  const service = await safe(getServiceByIdOrSlug(id), null)
  if (!service) return <>{children}</>

  const { title, description } = pick(service, locale)
  const island = islandByDb(service.island)
  const category = categoryByDb(service.category_slug)
  const url = absolute(`/prestataires/${service.id}`, locale)
  const regionName = island?.name[locale] ?? service.island

  // Des avis réels uniquement : pas de note agrégée sans avis, et jamais de valeur par défaut.
  const reviews = service.review_count > 0 ? await safe(getReviews(service.id, 5), []) : []

  const nodes: Record<string, unknown>[] = [
    {
      '@type': 'Service',
      '@id': `${url}#service`,
      name: title,
      description,
      url,
      image: service.images.map((i) => i.url),
      ...(category ? { serviceType: category.noun[locale] } : {}),
      areaServed: { '@type': 'Place', name: regionName, address: { '@type': 'PostalAddress', addressCountry: 'FR', addressRegion: regionName } },
      offers: {
        '@type': 'Offer',
        price: (service.price_cents / 100).toFixed(2),
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url,
      },
      provider: { '@type': 'LocalBusiness', name: service.provider.business_name, ...(service.provider.user.avatar_url ? { image: service.provider.user.avatar_url } : {}), address: { '@type': 'PostalAddress', addressCountry: 'FR', addressRegion: regionName } },
      ...(service.review_count > 0 && service.avg_rating > 0
        ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(service.avg_rating).toFixed(1), reviewCount: service.review_count, bestRating: 5, worstRating: 1 } }
        : {}),
      ...(reviews.length
        ? {
            review: reviews.map((r) => ({
              '@type': 'Review',
              author: { '@type': 'Person', name: r.author_first_name },
              datePublished: r.created_at.slice(0, 10),
              reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
              ...(r.content ? { reviewBody: r.content } : {}),
            })),
          }
        : {}),
    },
    breadcrumbJsonLd(
      [
        { name: { fr: 'Accueil', en: 'Home', es: 'Inicio' }[locale], path: '/' },
        ...(island ? [{ name: island.name[locale], path: `/${island.slug}` }] : []),
        ...(island && category ? [{ name: category.head[locale], path: `/${island.slug}/${category.slug}` }] : []),
        { name: title, path: `/prestataires/${service.id}` },
      ],
      locale,
    ),
  ]

  return (
    <>
      <JsonLd nodes={nodes} />
      {children}
    </>
  )
}
