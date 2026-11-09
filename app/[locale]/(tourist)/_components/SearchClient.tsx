'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react'
import { ServiceCard } from '@/components/service/ServiceCard'
import { CATEGORY_ICONS } from '@/lib/data/category-icons'
import { PRICE_RANGES, SEARCH_ISLANDS, toQueryString, type UrlState } from '@/lib/data/search-params'
import type { CategoryView, SearchResult } from '@/lib/data/types'
import { useFavorites } from '@/hooks/useFavorites'
import { Link, useRouter } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'

type SortKey = UrlState['sort']

interface SearchClientProps {
  state: UrlState
  categories: CategoryView[]
  result: SearchResult
}

export function SearchClient({ state, categories, result }: SearchClientProps) {
  const locale = useLocale()
  const t = useTranslations('searchPage')
  const lang = locale === 'en' ? 'en' : locale === 'es' ? 'es' : 'fr'
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { favorites, toggleFavorite } = useFavorites()

  const [query, setQuery] = useState(state.q)
  const [showFilters, setShowFilters] = useState(Boolean(state.island || state.price || state.sort !== 'popular'))
  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state }, [state])

  // Every filter lives in the URL (shareable, crawlable, back-button friendly); the server renders the results.
  function navigate(patch: Partial<UrlState>) {
    const next = { ...stateRef.current, page: 1, ...patch }
    startTransition(() => router.replace(`/search${toQueryString(next)}`, { scroll: false }))
  }

  // Debounced text search
  useEffect(() => {
    if (query === stateRef.current.q) return
    const id = setTimeout(() => navigate({ q: query }), 350)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const results = result.items
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize))
  const categoryId = categories.find((c) => c.slug === state.cat)?.id ?? null
  const priceRange = state.price
  const sortKey: SortKey = state.sort

  return (
    <div className="min-h-screen bg-coconut pt-16 pb-20 md:pb-0">
      {/* Search bar */}
      <div className="sticky top-16 z-20 bg-coconut/95 backdrop-blur-md border-b border-mist px-4 md:px-8 py-3">
        <div className="flex gap-2 max-w-7xl mx-auto">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full h-11 pl-9 pr-4 bg-surface border border-mist rounded-control text-sm text-charcoal placeholder:text-stone focus:outline-none focus:border-deep-green focus:ring-2 focus:ring-deep-green/15"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              'h-11 w-11 flex items-center justify-center rounded-control border transition-colors',
              showFilters ? 'bg-deep-green border-deep-green text-coconut' : 'bg-surface border-mist text-charcoal'
            )}
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 mt-2.5 overflow-x-auto pb-0.5 max-w-7xl mx-auto" style={{ scrollbarWidth: 'none' }}>
          <button
            type="button"
            onClick={() => navigate({ cat: '' })}
            className={cn(
              'flex-none px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border',
              !categoryId ? 'bg-deep-green text-coconut border-deep-green' : 'bg-surface border-mist text-stone hover:border-deep-green'
            )}
          >
            {t('all')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => navigate({ cat: cat.id === categoryId ? '' : cat.slug })}
              className={cn(
                'flex-none flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border',
                cat.id === categoryId ? 'bg-deep-green text-coconut border-deep-green' : 'bg-surface border-mist text-stone hover:border-deep-green'
              )}
            >
              {(() => { const Icon = CATEGORY_ICONS[cat.slug]; return Icon ? <Icon size={13} /> : null })()}
              <span>{locale === 'en' ? cat.name_en : locale === 'es' ? cat.name_es : cat.name_fr}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-sand border-b border-mist px-4 md:px-8 py-4 space-y-4 max-w-7xl mx-auto"
        >
          <div>
            <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">Budget</p>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((range, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => navigate({ price: i })}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    priceRange === i ? 'bg-deep-green text-coconut border-deep-green' : 'bg-coconut border-mist text-stone'
                  )}
                >
                  {range.label[lang]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">{t('island')}</p>
            <div className="flex flex-wrap gap-2">
              {[{ value: '' as const, label: t('allIslands') }, ...SEARCH_ISLANDS].map(({ value, label }) => (
                <button
                  key={value || 'all'}
                  type="button"
                  onClick={() => navigate({ island: value })}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    state.island === value ? 'bg-deep-green text-coconut border-deep-green' : 'bg-coconut border-mist text-stone'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">
              {t('sortBy')}
            </p>
            <div className="flex flex-wrap gap-2">
              {([
                { key: 'popular', label: t('popularity') },
                { key: 'price_asc', label: t('priceAsc') },
                { key: 'price_desc', label: t('priceDesc') },
              ] as { key: SortKey; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => navigate({ sort: key })}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    sortKey === key ? 'bg-deep-green text-coconut border-deep-green' : 'bg-coconut border-mist text-stone'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      <div className={cn('px-4 md:px-8 py-6 max-w-7xl mx-auto transition-opacity', isPending && 'opacity-60')} aria-busy={isPending}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-stone">
            {locale === 'en' ? (
              <><span className="font-semibold text-charcoal">{result.total}</span> experience{result.total !== 1 ? 's' : ''} found</>
            ) : locale === 'es' ? (
              <><span className="font-semibold text-charcoal">{result.total}</span> experiencia{result.total !== 1 ? 's' : ''} encontrada{result.total !== 1 ? 's' : ''}</>
            ) : (
              <><span className="font-semibold text-charcoal">{result.total}</span> expérience{result.total !== 1 ? 's' : ''} trouvée{result.total !== 1 ? 's' : ''}</>
            )}
          </p>
          <Button variant="link" size="bare" type="button" className="text-xs flex-none">
            <MapPin size={13} />
            <span className="hidden sm:inline">{t('viewOnMap')}</span>
          </Button>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-4xl">🌴</p>
            <p className="text-charcoal font-medium">{t('noResultsTitle')}</p>
            <p className="text-sm text-stone">{t('noResultsHint')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 xl:gap-5">
            {results.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ServiceCard
                  service={service}
                  isFavorite={favorites.has(service.id)}
                  onToggleFavorite={toggleFavorite}
                  size="lg"
                  className="w-full"
                />
              </motion.div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-3 text-sm" aria-label="Pagination">
            {state.page > 1 ? (
              <Link href={`/search${toQueryString({ ...state, page: state.page - 1 })}`} rel="prev" className="px-4 py-2 rounded-full border border-mist bg-surface text-charcoal hover:border-deep-green">
                ← {t('previous')}
              </Link>
            ) : <span />}
            <span className="text-stone">{state.page} / {totalPages}</span>
            {state.page < totalPages ? (
              <Link href={`/search${toQueryString({ ...state, page: state.page + 1 })}`} rel="next" className="px-4 py-2 rounded-full border border-mist bg-surface text-charcoal hover:border-deep-green">
                {t('next')} →
              </Link>
            ) : <span />}
          </nav>
        )}
      </div>
    </div>
  )
}
