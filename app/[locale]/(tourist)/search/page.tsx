import type { Metadata } from 'next'
import { buildMetadata, toSeoLocale } from '@/lib/seo'
import { PAGE_SEO } from '@/lib/seo/pages'
import { SearchClient } from '../_components/SearchClient'
import { getCategories, searchServices, safe } from '@/lib/data/services'
import { parseSearchParams, toSearchFilters, PAGE_SIZE } from '@/lib/data/search-params'

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const state = parseSearchParams(await searchParams)
  const [categories, result] = await Promise.all([
    safe(getCategories(), []),
    safe(searchServices(toSearchFilters(state)), { items: [], total: 0, page: state.page, pageSize: PAGE_SIZE }),
  ])
  return <SearchClient state={state} categories={categories} result={result} />
}

/** La page de recherche de base est indexable ; toute variante filtrée, triée, paginée ou avec requête ne l'est pas (canonique = /search). */
export async function generateMetadata({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchPageProps['searchParams'] }): Promise<Metadata> {
  const locale = toSeoLocale((await params).locale)
  const raw = await searchParams
  const filtered = Object.keys(raw).some((k) => ['q', 'cat', 'island', 'price', 'sort', 'page'].includes(k))
  const { title, description } = PAGE_SEO.search[locale]
  return buildMetadata({ title, description, path: '/search', locale, noindex: filtered })
}
