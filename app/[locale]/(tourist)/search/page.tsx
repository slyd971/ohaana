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
