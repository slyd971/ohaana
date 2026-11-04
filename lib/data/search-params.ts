import type { Island } from '@/types/database'
import type { SearchFilters } from './types'

// Shared between the server page (parsing) and the client UI (rendering / building URLs).
export const PRICE_RANGES = [
  { label: { fr: 'Tous', en: 'All', es: 'Todos' }, min: undefined, max: undefined },
  { label: { fr: '< 50€', en: '< €50', es: '< 50€' }, min: 0, max: 5000 },
  { label: { fr: '50–100€', en: '€50–100', es: '50–100€' }, min: 5000, max: 10000 },
  { label: { fr: '100–200€', en: '€100–200', es: '100–200€' }, min: 10000, max: 20000 },
  { label: { fr: '200€+', en: '€200+', es: '200€+' }, min: 20000, max: undefined },
] as const

export const SEARCH_ISLANDS: { value: Island; label: string }[] = [
  { value: 'guadeloupe', label: 'Guadeloupe' },
  { value: 'martinique', label: 'Martinique' },
  { value: 'saint_martin', label: 'Saint-Martin' },
  { value: 'saint_barth', label: 'Saint-Barth' },
]

export const PAGE_SIZE = 12

type Raw = { [key: string]: string | string[] | undefined }
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export interface UrlState {
  q: string
  cat: string
  island: Island | ''
  price: number
  sort: 'popular' | 'price_asc' | 'price_desc'
  page: number
}

export function parseSearchParams(raw: Raw): UrlState {
  const price = Number(first(raw.price))
  const sort = first(raw.sort)
  const island = first(raw.island)
  const page = Number(first(raw.page))
  return {
    q: (first(raw.q) ?? '').slice(0, 80),
    cat: /^[a-z_]{1,30}$/.test(first(raw.cat) ?? '') ? (first(raw.cat) as string) : '',
    island: SEARCH_ISLANDS.some((i) => i.value === island) ? (island as Island) : '',
    price: Number.isInteger(price) && price >= 0 && price < PRICE_RANGES.length ? price : 0,
    sort: sort === 'price_asc' || sort === 'price_desc' ? sort : 'popular',
    page: Number.isInteger(page) && page >= 1 && page <= 500 ? page : 1,
  }
}

export function toSearchFilters(state: UrlState): SearchFilters {
  const range = PRICE_RANGES[state.price]
  return {
    q: state.q || undefined,
    category: state.cat || undefined,
    island: state.island || undefined,
    minPriceCents: range.min,
    maxPriceCents: range.max,
    sort: state.sort,
    page: state.page,
    pageSize: PAGE_SIZE,
  }
}

/** Canonical query string (defaults omitted) → clean, crawlable URLs. */
export function toQueryString(state: Partial<UrlState>): string {
  const p = new URLSearchParams()
  if (state.q) p.set('q', state.q)
  if (state.cat) p.set('cat', state.cat)
  if (state.island) p.set('island', state.island)
  if (state.price) p.set('price', String(state.price))
  if (state.sort && state.sort !== 'popular') p.set('sort', state.sort)
  if (state.page && state.page > 1) p.set('page', String(state.page))
  const s = p.toString()
  return s ? `?${s}` : ''
}
