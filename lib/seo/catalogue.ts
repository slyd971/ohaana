import type { ServiceView } from '@/lib/data/types'
import { CATEGORIES, ISLANDS, type CategoryInfo, type IslandInfo } from './editorial'
import { MIN_SERVICES_TO_INDEX } from './landing'

// Regroupement du catalogue en pages « île » et « île / catégorie ». Pur : prend la liste des services déjà chargée.

export interface LandingTarget {
  island: IslandInfo
  category: CategoryInfo | null
  services: ServiceView[]
  /** Date de dernière modification réelle (max des updated_at), pour le sitemap. */
  updatedAt: string | null
  indexable: boolean
}

export function filterServices(all: ServiceView[], island: IslandInfo, category: CategoryInfo | null): ServiceView[] {
  return all.filter((s) => s.island === island.db && (!category || s.category_slug === category.dbSlug))
}

export function landingTarget(all: ServiceView[], island: IslandInfo, category: CategoryInfo | null): LandingTarget {
  const services = filterServices(all, island, category)
  const updatedAt = services.reduce<string | null>((max, s) => (max === null || s.updated_at > max ? s.updated_at : max), null)
  return { island, category, services, updatedAt, indexable: services.length >= MIN_SERVICES_TO_INDEX }
}

/** Toutes les pages (île, puis île / catégorie) qui ont assez de services pour être indexées. */
export function indexableTargets(all: ServiceView[]): LandingTarget[] {
  const out: LandingTarget[] = []
  for (const island of ISLANDS) {
    const t = landingTarget(all, island, null)
    if (t.indexable) out.push(t)
    for (const category of CATEGORIES) {
      const c = landingTarget(all, island, category)
      if (c.indexable) out.push(c)
    }
  }
  return out
}

export const targetPath = (t: Pick<LandingTarget, 'island' | 'category'>) =>
  t.category ? `/${t.island.slug}/${t.category.slug}` : `/${t.island.slug}`

export const minPriceCents = (services: ServiceView[]): number | null =>
  services.length ? Math.min(...services.map((s) => s.price_cents)) : null
