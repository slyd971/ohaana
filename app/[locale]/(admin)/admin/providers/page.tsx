'use client'

import { useState } from 'react'
import { PROVIDERS } from '@/lib/data/seed'
import { CheckCircle, XCircle, Clock, Star, Search, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const ISLAND_LABELS: Record<string, string> = {
  guadeloupe: 'Guadeloupe',
  martinique: 'Martinique',
  'saint-martin': 'Saint-Martin',
  'saint-barth': 'Saint-Barth',
}

const STATUS_PENDING = ['p-11', 'p-13']

export default function AdminProvidersPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all')

  const filtered = PROVIDERS.filter(p => {
    const matchQuery =
      p.user.full_name.toLowerCase().includes(query.toLowerCase()) ||
      p.business_name.toLowerCase().includes(query.toLowerCase()) ||
      p.island.toLowerCase().includes(query.toLowerCase())

    const isPending = STATUS_PENDING.includes(p.id)
    const matchFilter =
      filter === 'all' ||
      (filter === 'approved' && !isPending) ||
      (filter === 'pending' && isPending)

    return matchQuery && matchFilter
  })

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-display text-white">Prestataires</h1>
        <p className="text-white/40 text-sm mt-0.5">{PROVIDERS.length} prestataires enregistrés</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Nom, activité, île…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-turquoise/50"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'approved', 'pending'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-medium transition-colors',
                filter === f
                  ? 'bg-turquoise/20 text-turquoise border border-turquoise/30'
                  : 'bg-white/5 text-white/50 border border-white/10 hover:text-white/80'
              )}
            >
              {f === 'all' ? 'Tous' : f === 'approved' ? 'Validés' : 'En attente'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 rounded-2xl border border-white/8 overflow-hidden">
        <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/8 text-xs text-white/30 font-medium uppercase tracking-wider">
          <span>Prestataire</span>
          <span>Activité</span>
          <span>Île</span>
          <span>Note</span>
          <span>Stripe</span>
          <span>Statut</span>
        </div>

        <ul className="divide-y divide-white/5">
          {filtered.map(p => {
            const isPending = STATUS_PENDING.includes(p.id)
            return (
              <li key={p.id} className="px-5 py-4 flex flex-col md:grid md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-2 md:gap-4 items-start md:items-center">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.user.avatar_url}
                    alt={p.user.full_name}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{p.user.full_name}</p>
                    <p className="text-xs text-white/40">{p.business_name}</p>
                  </div>
                </div>
                <p className="text-sm text-white/60">{p.certifications[0] ?? '—'}</p>
                <p className="text-sm text-white/60">{ISLAND_LABELS[p.island] ?? p.island}</p>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-[#F5A623] fill-[#F5A623]" />
                  <span className="text-sm text-white/80">{p.avg_rating.toFixed(1)}</span>
                  <span className="text-xs text-white/30">({p.review_count})</span>
                </div>
                <div>
                  {p.stripe_onboarded ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-400/10 rounded-full px-2 py-0.5">
                      <CheckCircle size={10} /> Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-white/30 bg-white/5 rounded-full px-2 py-0.5">
                      <Clock size={10} /> À configurer
                    </span>
                  )}
                </div>
                <div>
                  {isPending ? (
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-xs text-[#F5A623] bg-[#F5A623]/10 rounded-full px-2 py-0.5">
                        <AlertTriangle size={10} /> En attente
                      </span>
                      <button className="p-1.5 bg-green-500/15 text-green-400 rounded-lg hover:bg-green-500/25 transition-colors" title="Approuver">
                        <CheckCircle size={13} />
                      </button>
                      <button className="p-1.5 bg-red-500/15 text-red-400 rounded-lg hover:bg-red-500/25 transition-colors" title="Rejeter">
                        <XCircle size={13} />
                      </button>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-400/10 rounded-full px-2 py-0.5">
                      <CheckCircle size={10} /> Validé
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
