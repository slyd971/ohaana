import type { Metadata } from 'next'
import { buildMetadata, toSeoLocale } from '@/lib/seo'
import { PAGE_SEO } from '@/lib/seo/pages'
import { ConciergeClient } from '../_components/ConciergeClient'
import { getPublishedServices, safe } from '@/lib/data/services'

export default async function ConciergePage() {
  const services = await safe(getPublishedServices(), [])
  return <ConciergeClient recommendations={services.slice(0, 6)} />
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = toSeoLocale((await params).locale)
  const { title, description } = PAGE_SEO.concierge[locale]
  return buildMetadata({ title, description, path: '/concierge', locale })
}
