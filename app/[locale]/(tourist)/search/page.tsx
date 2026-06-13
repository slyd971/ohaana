'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react'
import { ServiceCard } from '@/components/service/ServiceCard'
import { SERVICES, CATEGORIES, CATEGORY_ICONS } from '@/lib/data/seed'
import { cn } from '@/lib/utils'

type SortKey = 'popular' | 'rating' | 'price_asc' | 'price_desc'

const PRICE_RANGES = [
  { label: 'Tous', min: 0, max: Infinity },
  { label: '< 50€', min: 0, max: 5000 },
  { label: '50–100€', min: 5000, max: 10000 },
  { label: '100–200€', min: 10000, max: 20000 },
  { label: '200€+', min: 20000, max: Infinity },
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState(0)
  const [sortKey, setSortKey] = useState<SortKey>('popular')
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const { min, max } = PRICE_RANGES[priceRange]

  const results = useMemo(() => {
    let list = [...SERVICES]

    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (s) =>
          s.title_fr.toLowerCase().includes(q) ||
          s.provider.business_name.toLowerCase().includes(q) ||
          s.tags.some((t) => t.includes(q))
      )
    }

    if (categoryId) list = list.filter((s) => s.category_id === categoryId)

    list = list.filter((s) => s.price_cents >= min && s.price_cents <= max)

    if (sortKey === 'rating')      list.sort((a, b) => b.avg_rating - a.avg_rating)
    else if (sortKey === 'price_asc')  list.sort((a, b) => a.price_cents - b.price_cents)
    else if (sortKey === 'price_desc') list.sort((a, b) => b.price_cents - a.price_cents)
    else                               list.sort((a, b) => b.booking_count - a.booking_count)

    return list
  }, [query, categoryId, priceRange, sortKey, min, max])

  return (
    <div className="min-h-screen bg-coconut pt-16">
      {/* Search bar */}
      <div className="sticky top-16 z-20 bg-coconut/95 backdrop-blur-md border-b border-mist px-4 py-3">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Chef, massage, catamaran…"
              className="w-full h-11 pl-9 pr-4 bg-surface border border-mist rounded-xl text-sm text-charcoal placeholder:text-stone focus:outline-none focus:border-deep-green focus:ring-2 focus:ring-deep-green/15"
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
              'h-11 w-11 flex items-center justify-center rounded-xl border transition-colors',
              showFilters ? 'bg-deep-green border-deep-green text-coconut' : 'bg-surface border-mist text-charcoal'
            )}
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 mt-2.5 overflow-x-auto pb-0.5 max-w-2xl mx-auto" style={{ scrollbarWidth: 'none' }}>
          <button
            type="button"
            onClick={() => setCategoryId(null)}
            className={cn(
              'flex-none px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border',
              !categoryId ? 'bg-deep-green text-coconut border-deep-green' : 'bg-surface border-mist text-stone hover:border-deep-green'
            )}
          >
            Tout
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryId(cat.id === categoryId ? null : cat.id)}
              className={cn(
                'flex-none flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border',
                cat.id === categoryId ? 'bg-deep-green text-coconut border-deep-green' : 'bg-surface border-mist text-stone hover:border-deep-green'
              )}
            >
              {(() => { const Icon = CATEGORY_ICONS[cat.slug]; return Icon ? <Icon size={13} /> : null })()}
              <span>{cat.name_fr}</span>
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
          className="bg-sand border-b border-mist px-4 py-4 space-y-4 max-w-2xl mx-auto"
        >
          <div>
            <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">Budget</p>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((range, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPriceRange(i)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    priceRange === i ? 'bg-deep-green text-coconut border-deep-green' : 'bg-coconut border-mist text-stone'
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">Trier par</p>
            <div className="flex flex-wrap gap-2">
              {([
                { key: 'popular', label: 'Popularité' },
                { key: 'rating', label: 'Note' },
                { key: 'price_asc', label: 'Prix ↑' },
                { key: 'price_desc', label: 'Prix ↓' },
              ] as { key: SortKey; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSortKey(key)}
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
      <div className="px-4 py-5 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-stone">
            <span className="font-semibold text-charcoal">{results.length}</span> expérience{results.length !== 1 ? 's' : ''} trouvée{results.length !== 1 ? 's' : ''}
          </p>
          <button type="button" className="flex items-center gap-1.5 text-xs text-deep-green font-medium">
            <MapPin size={13} />
            Voir sur carte
          </button>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-4xl">🌴</p>
            <p className="text-charcoal font-medium">Aucune expérience trouvée</p>
            <p className="text-sm text-stone">Essayez d'autres filtres ou mots-clés</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>
    </div>
  )
}
