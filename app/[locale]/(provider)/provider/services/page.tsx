import { Plus, Star, Clock, Users, CalendarClock } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { getProviderContext } from '@/lib/provider/context'
import { listProviderServices } from '@/lib/provider/queries'
import { ApprovalBanner, EmptyState, PageHeader, SignInRequired, StatusBadge, eur } from '@/components/provider/ui'
import { ServiceActions } from '@/components/provider/RowActions'
import { formatDuration } from '@/lib/utils'
import { DemoServices } from '../_demo/DemoServices'

export default async function ProviderServicesPage() {
  const ctx = await getProviderContext()
  if (ctx.kind === 'demo') return <DemoServices />
  if (ctx.kind !== 'provider') return <SignInRequired kind={ctx.kind} />

  const services = await listProviderServices(ctx.supabase)

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-4xl">
      <PageHeader
        title="Mes services"
        subtitle={`${services.length} service${services.length > 1 ? 's' : ''} enregistré${services.length > 1 ? 's' : ''}`}
        action={
          <Link
            href="/provider/services/new"
            className="flex items-center gap-2 bg-deep-green text-coconut px-4 py-2.5 rounded-full text-sm font-medium hover:bg-deep-green/90 transition-colors flex-none"
          >
            <Plus size={15} /> Ajouter
          </Link>
        }
      />
      <ApprovalBanner provider={ctx.provider} />

      {services.length === 0 ? (
        <EmptyState title="Vous n’avez pas encore de service">
          Créez votre première fiche, ajoutez vos disponibilités puis soumettez-la à la relecture.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <article key={s.id} className="bg-coconut rounded-2xl border border-mist p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="mb-1"><StatusBadge status={s.status} /></div>
                  <h2 className="text-sm font-semibold text-charcoal leading-snug">{s.title_fr}</h2>
                </div>
                <div className="flex flex-none gap-3 text-xs">
                  <Link href={`/provider/disponibilites?service=${s.id}`} className="text-deep-green hover:underline inline-flex items-center gap-1">
                    <CalendarClock size={12} /> Disponibilités
                  </Link>
                  <Link href={`/provider/services/${s.id}`} className="text-deep-green hover:underline">Modifier</Link>
                </div>
              </div>

              {s.status === 'rejected' && s.rejection_reason && (
                <p className="text-xs bg-coral/10 text-coral rounded-lg px-3 py-2">Refusée : {s.rejection_reason}</p>
              )}

              <div className="flex flex-wrap gap-4 text-xs text-stone">
                <span className="font-semibold text-charcoal">{eur(s.price_cents)}{s.price_unit === 'per_person' ? ' / pers.' : ' (groupe)'}</span>
                {s.duration_min ? <span className="flex items-center gap-1"><Clock size={11} />{formatDuration(s.duration_min)}</span> : null}
                <span className="flex items-center gap-1"><Users size={11} />{s.capacity_min}–{s.capacity_max} pers.</span>
                {s.review_count > 0 && (
                  <span className="flex items-center gap-1"><Star size={11} className="text-amber-400" />{s.avg_rating.toFixed(1)} ({s.review_count} avis)</span>
                )}
                {s.booking_count > 0 && <span>{s.booking_count} réservations</span>}
              </div>

              <ServiceActions id={s.id} status={s.status} />
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
