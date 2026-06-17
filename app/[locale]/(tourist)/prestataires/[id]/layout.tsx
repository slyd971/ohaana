import type { Metadata } from 'next'
import { getServiceById, SERVICES } from '@/lib/data/seed'

const BASE = 'https://ohaana.com'

interface Props {
  children: React.ReactNode
  params: Promise<{ id: string; locale: string }>
}

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ id: s.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }): Promise<Metadata> {
  const { id, locale } = await params
  const service = getServiceById(id)
  if (!service) return {}

  const isEn = locale === 'en'
  const title = isEn ? service.title_en : service.title_fr
  const rawDesc = isEn ? service.description_en : service.description_fr
  const description = rawDesc.length > 155 ? rawDesc.slice(0, 152) + '…' : rawDesc
  const cover = service.images.find((i) => i.is_cover) ?? service.images[0]
  const island = service.island === 'guadeloupe' ? 'Guadeloupe' : 'Martinique'
  const price = (service.price_cents / 100).toFixed(0)

  const frUrl = `${BASE}/prestataires/${id}`
  const enUrl = `${BASE}/en/prestataires/${id}`
  const pageUrl = isEn ? enUrl : frUrl

  const ogImage = cover
    ? { url: cover.url, width: 1200, height: 800, alt: isEn ? (cover.alt_en ?? title) : (cover.alt_fr ?? title) }
    : undefined

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: { fr: frUrl, en: enUrl, 'x-default': frUrl },
    },
    openGraph: {
      title: `${title} — Ohaana ${island}`,
      description,
      url: pageUrl,
      type: 'website',
      images: ogImage ? [ogImage] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — Ohaana`,
      description,
      images: cover ? [cover.url] : [],
    },
    other: {
      'price:amount': price,
      'price:currency': 'EUR',
    },
  }
}

export default async function ProviderLayout({ children, params }: Props) {
  const { id, locale } = await params
  const service = getServiceById(id)

  if (!service) return <>{children}</>

  const isEn = locale === 'en'
  const title = isEn ? service.title_en : service.title_fr
  const description = isEn ? service.description_en : service.description_fr
  const cover = service.images.find((i) => i.is_cover) ?? service.images[0]
  const island = service.island === 'guadeloupe' ? 'Guadeloupe' : 'Martinique'
  const price = (service.price_cents / 100).toFixed(2)

  const frUrl = `${BASE}/prestataires/${id}`
  const enUrl = `${BASE}/en/prestataires/${id}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${frUrl}#service`,
        name: title,
        description,
        url: isEn ? enUrl : frUrl,
        image: cover?.url,
        areaServed: {
          '@type': 'Place',
          name: island,
          address: { '@type': 'PostalAddress', addressCountry: 'FR', addressRegion: island },
        },
        offers: {
          '@type': 'Offer',
          price,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          url: isEn ? enUrl : frUrl,
        },
        provider: {
          '@type': 'LocalBusiness',
          name: service.provider.business_name,
          image: service.provider.user.avatar_url,
          telephone: service.provider.phone ?? undefined,
          address: { '@type': 'PostalAddress', addressCountry: 'FR', addressRegion: island },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Prestataires', item: `${BASE}/search` },
          { '@type': 'ListItem', position: 3, name: title, item: frUrl },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
