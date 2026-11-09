import type { MetadataRoute } from 'next'
import { getPublishedServiceIndex, getPublishedServices, safe } from '@/lib/data/services'
import { absolute, languageAlternates, SEO_LOCALES } from '@/lib/seo'
import { indexableTargets, targetPath } from '@/lib/seo/catalogue'

// Régénéré chaque jour depuis la base. Uniquement des pages indexables : services PUBLIÉS de prestataires APPROUVÉS,
// et pages île / catégorie qui ont au moins 3 services. Les dates sont les vraies dates de modification (jamais « maintenant »).
export const revalidate = 86400

type Entry = MetadataRoute.Sitemap[number]

/** Une entrée par langue, chacune déclarant ses équivalents (hreflang). */
function entries(path: string, extra: Pick<Entry, 'lastModified' | 'changeFrequency' | 'priority'>): MetadataRoute.Sitemap {
  const alternates = { languages: languageAlternates(path) }
  return SEO_LOCALES.map((locale) => ({ url: absolute(path, locale), alternates, ...extra }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Les déploiements de démonstration n'annoncent aucune URL.
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return []

  const out: MetadataRoute.Sitemap = []

  out.push(...entries('/', { changeFrequency: 'daily', priority: 1 }))
  out.push(...entries('/search', { changeFrequency: 'daily', priority: 0.9 }))

  const catalogue = await safe(getPublishedServices(200), [])
  for (const t of indexableTargets(catalogue)) {
    out.push(...entries(targetPath(t), {
      lastModified: t.updatedAt ? new Date(t.updatedAt) : undefined,
      changeFrequency: 'weekly',
      priority: t.category ? 0.8 : 0.85,
    }))
  }

  const services = await safe(getPublishedServiceIndex(), [])
  for (const service of services) {
    out.push(...entries(`/prestataires/${service.id}`, {
      lastModified: new Date(service.updated_at),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
  }

  for (const path of ['/concierge', '/about', '/terms', '/privacy']) {
    out.push(...entries(path, { changeFrequency: 'monthly', priority: 0.4 }))
  }
  return out
}
