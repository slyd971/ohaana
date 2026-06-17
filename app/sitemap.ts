import type { MetadataRoute } from 'next'
import { SERVICES } from '@/lib/data/seed'

const BASE = 'https://ohaana.com'

function u(path: string, locale: 'fr' | 'en') {
  return locale === 'fr' ? `${BASE}${path}` : `${BASE}/en${path}`
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const locales = ['fr', 'en'] as const
  const entries: MetadataRoute.Sitemap = []

  // Home
  for (const locale of locales) {
    entries.push({ url: u('/', locale), lastModified: now, changeFrequency: 'daily', priority: 1.0 })
  }

  // Search
  for (const locale of locales) {
    entries.push({ url: u('/search', locale), lastModified: now, changeFrequency: 'daily', priority: 0.9 })
  }

  // Service pages
  for (const service of SERVICES) {
    for (const locale of locales) {
      entries.push({
        url: u(`/prestataires/${service.id}`, locale),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  }

  // Static pages
  for (const path of ['/concierge', '/about']) {
    for (const locale of locales) {
      entries.push({ url: u(path, locale), lastModified: now, changeFrequency: 'monthly', priority: 0.5 })
    }
  }

  return entries
}
