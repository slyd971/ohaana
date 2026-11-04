'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { setProviderApprovalAction } from '@/app/actions/admin'
import { Link } from '@/lib/i18n/navigation'
import { CheckCircle, Clock, Star, Search, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const ISLAND_LABELS: Record<string, string> = {
  guadeloupe: 'Guadeloupe',
  martinique: 'Martinique',
  saint_martin: 'Saint-Martin',
  saint_barth: 'Saint-Barth',
}

interface ProviderRow {
  id: string
  business_name: string
  island: string
  certifications: string[] | null
  avg_rating: number
  review_count: number
  stripe_onboarded: boolean
  is_approved: boolean
  users: { full_name: string | null; avatar_url: string | null } | null
}

async function fetchProviders(): Promise<{ rows: ProviderRow[]; error: boolean }> {
  // RLS: only admins can read every provider profile.
  const { data, error } = await createClient()
    .from('provider_profiles')
    .select('id, business_name, island, certifications, avg_rating, review_count, stripe_onboarded, is_approved, users ( full_name, avatar_url )')
    .order('created_at', { ascending: false })
  return { rows: (data ?? []) as unknown as ProviderRow[], error: Boolean(error) }
}

export default function AdminProvidersPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all')
  const [providers, setProviders] = useState<ProviderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true
    fetchProviders().then((result) => {
      if (!active) return
      setProviders(result.rows)
      setError(result.error)
      setLoading(false)
    })
    return () => { active = false }
  }, [version])

  async function setApproval(id: string, approved: boolean) {
    if (!approved && !window.confirm('Suspendre ce prestataire ? Ses fiches publiées repasseront en relecture.')) return
    const result = await setProviderApprovalAction(id, approved)
    if (result.error) { window.alert(result.error); return }
    setVersion((v) => v + 1)
  }

  const filtered = providers.filter((p) => {
    const q = query.toLowerCase()
    const matchQuery =
      (p.users?.full_name ?? '').toLowerCase().includes(q) ||
      p.business_name.toLowerCase().includes(q) ||
      p.island.toLowerCase().includes(q)
    const matchFilter = filter === 'all' || (filter === 'approved' && p.is_approved) || (filter === 'pending' && !p.is_approved)
    return matchQuery && matchFilter
  })

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-6xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display text-white">Prestataires</h1>
          <p className="text-white/40 text-sm mt-0.5">{loading ? '…' : `${providers.length} prestataires enregistrés`}</p>
        </div>
        <Link
          href="/admin/providers/new"
          className="flex-none text-xs bg-turquoise/20 text-turquoise border border-turquoise/30 px-4 py-2 rounded-xl hover:bg-turquoise/30"
        >
          + Nouveau prestataire
        </Link>
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

        {error && <p role="alert" className="px-5 py-4 text-sm text-red-400">Impossible de charger les prestataires.</p>}
        {!loading && !error && filtered.length === 0 && <p className="px-5 py-6 text-sm text-white/40">Aucun prestataire.</p>}
        <ul className="divide-y divide-white/5">
          {filtered.map(p => {
            const isPending = !p.is_approved
            return (
              <li key={p.id} className="px-5 py-4 flex flex-col md:grid md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-2 md:gap-4 items-start md:items-center">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white">
                    {p.business_name.charAt(0)}
                  </span>
                  <div>
                    <Link href={`/admin/providers/${p.id}`} className="text-sm font-medium text-white hover:text-turquoise">
                      {p.users?.full_name ?? p.business_name}
                    </Link>
                    <p className="text-xs text-white/40">{p.business_name}</p>
                  </div>
                </div>
                <p className="text-sm text-white/60">{p.certifications?.[0] ?? '—'}</p>
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
                      <button type="button" onClick={() => void setApproval(p.id, true)} aria-label={`Approuver ${p.business_name}`} className="p-1.5 bg-green-500/15 text-green-400 rounded-lg hover:bg-green-500/25 transition-colors" title="Approuver">
                        <CheckCircle size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-400/10 rounded-full px-2 py-0.5">
                        <CheckCircle size={10} /> Validé
                      </span>
                      <button
                        type="button"
                        onClick={() => void setApproval(p.id, false)}
                        aria-label={`Suspendre ${p.business_name}`}
                        className="text-[11px] text-white/50 border border-white/10 rounded-lg px-2 py-1 hover:text-white/80 hover:bg-white/5"
                      >
                        Suspendre
                      </button>
                    </div>
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
