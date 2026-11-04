import type { MetadataRoute } from 'next'
import { getPublishedServiceIndex, safe } from '@/lib/data/services'
import { SITE_URL } from '@/lib/site'

// Regenerated daily from the database: only PUBLISHED services of APPROVED providers are listed.
export const revalidate = 86400

const BASE = SITE_URL
const LOCALES = ['fr', 'en', 'es'] as const

function u(path: string, locale: (typeof LOCALES)[number]) {
  if (locale === 'fr') return `${BASE}${path}`
  return `${BASE}/${locale}${path}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Demo deployments must not advertise any URL.
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return []

  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  for (const locale of LOCALES) {
    entries.push({ url: u('/', locale), lastModified: now, changeFrequency: 'daily', priority: 1.0 })
    entries.push({ url: u('/search', locale), lastModified: now, changeFrequency: 'daily', priority: 0.9 })
  }

  const services = await safe(getPublishedServiceIndex(), [])
  for (const service of services) {
    for (const locale of LOCALES) {
      entries.push({
        url: u(`/prestataires/${service.id}`, locale),
        lastModified: new Date(service.updated_at),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  }

  for (const path of ['/concierge', '/about']) {
    for (const locale of LOCALES) {
      entries.push({ url: u(path, locale), lastModified: now, changeFrequency: 'monthly', priority: 0.5 })
    }
  }

  return entries
}
