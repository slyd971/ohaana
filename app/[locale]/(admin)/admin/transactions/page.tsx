'use client'

import { useState } from 'react'
import { CheckCircle, Clock, XCircle, Search, TrendingUp, CreditCard, Percent } from 'lucide-react'
import { cn } from '@/lib/utils'

type TxStatus = 'completed' | 'pending' | 'refunded'

const TRANSACTIONS: { id: string; from: string; to: string; service: string; amount: number; commission: number; date: string; status: TxStatus }[] = [
  { id: 'tx-001', from: 'Sophie Laurent',    to: 'Chef Marcus',         service: 'Dîner créole privé',         amount: 38000, commission: 3800, date: '2026-06-13', status: 'completed' },
  { id: 'tx-002', from: 'Thomas Renaud',     to: 'Dive Martinique',     service: 'Plongée découverte',         amount: 18000, commission: 1800, date: '2026-06-12', status: 'completed' },
  { id: 'tx-003', from: 'Isabelle Moreau',   to: 'Bella Coiffure',      service: 'Tresses & coiffure',         amount:  9500, commission:  950, date: '2026-06-12', status: 'pending'   },
  { id: 'tx-004', from: 'Marcus Williams',   to: 'Sail Caribe',         service: 'Catamaran privatif',         amount: 52000, commission: 5200, date: '2026-06-11', status: 'completed' },
  { id: 'tx-005', from: 'Lucie Bernard',     to: 'Massage Madeleine',   service: 'Massage duo en villa',       amount: 19000, commission: 1900, date: '2026-06-10', status: 'completed' },
  { id: 'tx-006', from: 'Sophie Laurent',    to: 'Studio Camille Photo',service: 'Shooting couple',            amount: 24000, commission: 2400, date: '2026-06-09', status: 'completed' },
  { id: 'tx-007', from: 'Éric Descamps',     to: 'Yoga Keisha',         service: 'Séance yoga privée',         amount:  8500, commission:  850, date: '2026-06-08', status: 'refunded'  },
  { id: 'tx-008', from: 'Isabelle Moreau',   to: 'Chef Marcus',         service: 'Brunch antillais',           amount: 14500, commission: 1450, date: '2026-06-07', status: 'completed' },
  { id: 'tx-009', from: 'Thomas Renaud',     to: 'DJ Kenzo',            service: 'DJ set soirée villa',        amount: 45000, commission: 4500, date: '2026-06-06', status: 'completed' },
  { id: 'tx-010', from: 'Marcus Williams',   to: 'Massage Madeleine',   service: 'Massage thaï',               amount:  9500, commission:  950, date: '2026-06-05', status: 'completed' },
  { id: 'tx-011', from: 'Lucie Bernard',     to: 'Chef Clarisse',       service: 'Cours cuisine créole',       amount: 12000, commission: 1200, date: '2026-06-04', status: 'completed' },
  { id: 'tx-012', from: 'Sophie Laurent',    to: 'Naomi Beauté',        service: 'Soins beauté & détox',       amount: 18500, commission: 1850, date: '2026-06-03', status: 'completed' },
]

const STATUS_CONFIG = {
  completed: { label: 'Réglée',   Icon: CheckCircle, color: 'text-green-400 bg-green-400/10' },
  pending:   { label: 'En attente', Icon: Clock,     color: 'text-[#F5A623] bg-[#F5A623]/10' },
  refunded:  { label: 'Remboursée', Icon: XCircle,   color: 'text-red-400 bg-red-400/10'     },
}

function fmt(cents: number) {
  return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

export default function AdminTransactionsPage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | TxStatus>('all')

  const filtered = TRANSACTIONS.filter(t => {
    const matchQ = t.from.toLowerCase().includes(query.toLowerCase()) ||
      t.to.toLowerCase().includes(query.toLowerCase()) ||
      t.service.toLowerCase().includes(query.toLowerCase())
    const matchS = statusFilter === 'all' || t.status === statusFilter
    return matchQ && matchS
  })

  const totalVolume = TRANSACTIONS.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0)
  const totalCommissions = TRANSACTIONS.filter(t => t.status === 'completed').reduce((s, t) => s + t.commission, 0)
  const pendingCount = TRANSACTIONS.filter(t => t.status === 'pending').length

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-display text-white">Transactions</h1>
        <p className="text-white/40 text-sm mt-0.5">{TRANSACTIONS.length} transactions · Juin 2026</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/8">
          <CreditCard size={16} className="text-turquoise mb-2" />
          <p className="text-xl font-display text-white">{fmt(totalVolume)}</p>
          <p className="text-xs text-white/40 mt-0.5">Volume réglé</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/8">
          <Percent size={16} className="text-green-400 mb-2" />
          <p className="text-xl font-display text-white">{fmt(totalCommissions)}</p>
          <p className="text-xs text-white/40 mt-0.5">Commissions Ohaana</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/8">
          <TrendingUp size={16} className="text-[#F5A623] mb-2" />
          <p className="text-xl font-display text-white">{pendingCount}</p>
          <p className="text-xs text-white/40 mt-0.5">En attente</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Client, prestataire, service…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-turquoise/50"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'completed', 'pending', 'refunded'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-medium transition-colors',
                statusFilter === s
                  ? 'bg-turquoise/20 text-turquoise border border-turquoise/30'
                  : 'bg-white/5 text-white/50 border border-white/10 hover:text-white/80'
              )}
            >
              {s === 'all' ? 'Toutes' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 rounded-2xl border border-white/8 overflow-hidden">
        <div className="hidden md:grid grid-cols-[auto_2fr_2fr_2fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/8 text-xs text-white/30 font-medium uppercase tracking-wider">
          <span>ID</span>
          <span>Client</span>
          <span>Prestataire</span>
          <span>Service</span>
          <span>Montant</span>
          <span>Commission</span>
          <span>Statut</span>
        </div>
        <ul className="divide-y divide-white/5">
          {filtered.map(t => {
            const { label, Icon, color } = STATUS_CONFIG[t.status]
            return (
              <li key={t.id} className="px-5 py-3.5 grid grid-cols-[auto_2fr_2fr_2fr_1fr_1fr_auto] gap-4 items-center">
                <span className="hidden md:block text-xs font-mono text-white/20">{t.id}</span>
                <p className="text-sm text-white/80">{t.from}</p>
                <p className="text-sm text-white/60">{t.to}</p>
                <p className="text-xs text-white/40 truncate">{t.service}</p>
                <p className="text-sm font-medium text-white">{fmt(t.amount)}</p>
                <p className="text-sm text-turquoise">{fmt(t.commission)}</p>
                <span className={cn('inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 whitespace-nowrap', color)}>
                  <Icon size={10} /> {label}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
