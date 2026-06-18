'use client'

import { useState } from 'react'
import { Search, Shield, User, Briefcase, Handshake, Ban, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Role = 'tourist' | 'provider' | 'partner'

const DEMO_USERS: { id: string; name: string; email: string; role: Role; island: string; joined: string; bookings: number; active: boolean }[] = [
  { id: 'u-101', name: 'Sophie Laurent',    email: 'sophie.laurent@gmail.com',    role: 'tourist',  island: 'Guadeloupe',  joined: '2026-01-12', bookings: 8,  active: true },
  { id: 'u-102', name: 'Thomas Renaud',     email: 'thomas.renaud@gmail.com',     role: 'tourist',  island: 'Martinique',  joined: '2026-01-24', bookings: 5,  active: true },
  { id: 'u-103', name: 'Isabelle Moreau',   email: 'isabelle.m@icloud.com',       role: 'tourist',  island: 'Saint-Martin',joined: '2026-02-03', bookings: 12, active: true },
  { id: 'u-104', name: 'Marcus Williams',   email: 'marcus.w@gmail.com',          role: 'tourist',  island: 'Guadeloupe',  joined: '2026-02-14', bookings: 3,  active: true },
  { id: 'u-105', name: 'Lucie Bernard',     email: 'lucie.b@gmail.com',           role: 'tourist',  island: 'Saint-Barth', joined: '2026-03-01', bookings: 7,  active: true },
  { id: 'u-106', name: 'Éric Descamps',     email: 'eric.desc@yahoo.fr',          role: 'tourist',  island: 'Guadeloupe',  joined: '2026-03-15', bookings: 2,  active: false },
  { id: 'u-201', name: 'Marcus Théophile',  email: 'marcus@ohaana.com',           role: 'provider', island: 'Guadeloupe',  joined: '2024-01-01', bookings: 47, active: true },
  { id: 'u-202', name: 'Madeleine Lacroix', email: 'madeleine@ohaana.com',        role: 'provider', island: 'Guadeloupe',  joined: '2024-01-01', bookings: 83, active: true },
  { id: 'u-203', name: 'Camille Desroses',  email: 'camille@ohaana.com',          role: 'provider', island: 'Guadeloupe',  joined: '2024-01-01', bookings: 36, active: true },
  { id: 'u-204', name: 'Keisha Dantor',     email: 'keisha@ohaana.com',           role: 'provider', island: 'Guadeloupe',  joined: '2024-01-01', bookings: 29, active: true },
  { id: 'u-301', name: 'Élise Beaumont',    email: 'elise@conciergerie-971.com',  role: 'partner',  island: 'Guadeloupe',  joined: '2024-06-01', bookings: 24, active: true },
  { id: 'u-302', name: 'Jean-Luc Viora',    email: 'jlviora@caribhome.com',       role: 'partner',  island: 'Saint-Martin',joined: '2025-01-01', bookings: 18, active: true },
]

const ROLE_CONFIG = {
  tourist:  { label: 'Voyageur',    Icon: User,      color: 'text-blue-400 bg-blue-400/10' },
  provider: { label: 'Prestataire', Icon: Briefcase, color: 'text-turquoise bg-turquoise/10' },
  partner:  { label: 'Partenaire',  Icon: Handshake, color: 'text-[#F5A623] bg-[#F5A623]/10' },
}

export default function AdminUsersPage() {
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all')

  const filtered = DEMO_USERS.filter(u => {
    const matchQ = u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())
    const matchR = roleFilter === 'all' || u.role === roleFilter
    return matchQ && matchR
  })

  const counts = {
    all: DEMO_USERS.length,
    tourist: DEMO_USERS.filter(u => u.role === 'tourist').length,
    provider: DEMO_USERS.filter(u => u.role === 'provider').length,
    partner: DEMO_USERS.filter(u => u.role === 'partner').length,
  }

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-display text-white">Utilisateurs</h1>
        <p className="text-white/40 text-sm mt-0.5">{DEMO_USERS.length} comptes enregistrés</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Nom ou email…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-turquoise/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'tourist', 'provider', 'partner'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-medium transition-colors',
                roleFilter === r
                  ? 'bg-turquoise/20 text-turquoise border border-turquoise/30'
                  : 'bg-white/5 text-white/50 border border-white/10 hover:text-white/80'
              )}
            >
              {r === 'all' ? `Tous (${counts.all})` : `${ROLE_CONFIG[r].label} (${counts[r]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 rounded-2xl border border-white/8 overflow-hidden">
        <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/8 text-xs text-white/30 font-medium uppercase tracking-wider">
          <span>Utilisateur</span>
          <span>Email</span>
          <span>Rôle</span>
          <span>Île</span>
          <span>Réservations</span>
          <span>Statut</span>
        </div>
        <ul className="divide-y divide-white/5">
          {filtered.map(u => {
            const { label, Icon, color } = ROLE_CONFIG[u.role]
            return (
              <li key={u.id} className="px-5 py-3.5 flex flex-col md:grid md:grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-2 md:gap-4 items-start md:items-center">
                <div>
                  <p className="text-sm font-medium text-white">{u.name}</p>
                  <p className="text-xs text-white/30 md:hidden">{u.email}</p>
                </div>
                <p className="hidden md:block text-sm text-white/50 truncate">{u.email}</p>
                <span className={cn('inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 w-fit', color)}>
                  <Icon size={10} /> {label}
                </span>
                <p className="text-sm text-white/60">{u.island}</p>
                <p className="text-sm text-white/60">{u.bookings}</p>
                <div>
                  {u.active ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-400/10 rounded-full px-2 py-0.5">
                      <CheckCircle size={10} /> Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-white/30 bg-white/5 rounded-full px-2 py-0.5">
                      <Ban size={10} /> Inactif
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <p className="text-xs text-white/20 flex items-center gap-1.5">
        <Shield size={11} /> Données fictives — environnement de démonstration
      </p>
    </div>
  )
}
