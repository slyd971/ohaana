import { CalendarDays, Users } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { getProviderContext } from '@/lib/provider/context'
import { listProviderBookings } from '@/lib/provider/queries'
import { nowDate } from '@/lib/data/dates'
import { EmptyState, PageHeader, SignInRequired, StatusBadge, eur, formatDateTimeFr } from '@/components/provider/ui'
import { BookingActions } from '@/components/provider/RowActions'
import { DemoReservations } from '../_demo/DemoReservations'

const FILTERS = [
  { key: 'all', label: 'Toutes', match: () => true },
  { key: 'upcoming', label: 'À venir', match: (s: string) => s === 'confirmed' },
  { key: 'pending', label: 'Paiement en attente', match: (s: string) => s === 'pending' },
  { key: 'done', label: 'Terminées', match: (s: string) => s === 'completed' },
  { key: 'cancelled', label: 'Annulées', match: (s: string) => s.startsWith('cancelled') || s === 'expired' },
] as const

export default async function ProviderReservationsPage({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const ctx = await getProviderContext()
  if (ctx.kind === 'demo') return <DemoReservations />
  if (ctx.kind !== 'provider') return <SignInRequired kind={ctx.kind} />

  const { s } = await searchParams
  const filter = FILTERS.find((f) => f.key === s) ?? FILTERS[0]
  const all = await listProviderBookings(ctx.supabase)
  const bookings = all.filter((b) => filter.match(b.status))
  const nowIso = nowDate().toISOString()

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-4xl">
      <PageHeader title="Réservations" subtitle="La confirmation est automatique dès que le voyageur a payé." />

      <nav aria-label="Filtrer les réservations" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === 'all' ? '/provider/reservations' : `/provider/reservations?s=${f.key}`}
            aria-current={f.key === filter.key ? 'page' : undefined}
            className={`px-3.5 py-1.5 rounded-full text-xs border transition-colors ${
              f.key === filter.key ? 'bg-deep-green text-coconut border-deep-green' : 'border-mist text-stone hover:bg-sand'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {bookings.length === 0 ? (
        <EmptyState title="Aucune réservation ici">Les réservations de vos voyageurs apparaîtront dès qu’elles seront créées.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.id} className="bg-coconut rounded-card border border-mist p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-charcoal truncate">{b.title_fr}</p>
                  <p className="text-xs text-stone mt-0.5">{b.tourist_first_name || 'Voyageur'}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-stone">
                <span className="flex items-center gap-1"><CalendarDays size={11} />{formatDateTimeFr(b.starts_at)}</span>
                <span className="flex items-center gap-1"><Users size={11} />{b.guests_count} pers.</span>
                <span className="font-semibold text-charcoal">{eur(b.total_cents)}</span>
              </div>
              {b.notes && <p className="text-xs bg-sand rounded-lg px-3 py-2 text-charcoal">« {b.notes} »</p>}
              <BookingActions id={b.id} status={b.status} past={(b.starts_at ?? '9999') <= nowIso} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
