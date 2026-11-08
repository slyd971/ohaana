import { CalendarDays, TrendingUp, Briefcase, Star, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { getProviderContext } from '@/lib/provider/context'
import { getDashboardStats } from '@/lib/provider/queries'
import { nowDate } from '@/lib/data/dates'
import { ApprovalBanner, PageHeader, SignInRequired, eur, formatDateTimeFr } from '@/components/provider/ui'
import { DemoDashboard } from '../_demo/DemoDashboard'

export default async function ProviderDashboard() {
  const ctx = await getProviderContext()
  if (ctx.kind === 'demo') return <DemoDashboard />
  if (ctx.kind !== 'provider') return <SignInRequired kind={ctx.kind} />

  const stats = await getDashboardStats(ctx.supabase, ctx.provider.id, nowDate())
  const { provider } = ctx

  const kpis = [
    { label: 'Réservations ce mois', value: String(stats.bookingsThisMonth), Icon: CalendarDays, color: 'bg-turquoise/10 text-turquoise' },
    { label: 'Revenu net ce mois', value: eur(stats.netRevenueThisMonthCents), Icon: TrendingUp, color: 'bg-coral/10 text-coral' },
    { label: 'Services publiés', value: String(stats.publishedServices), hint: stats.pendingServices ? `${stats.pendingServices} en relecture` : '', Icon: Briefcase, color: 'bg-deep-green/10 text-deep-green' },
    { label: 'Note moyenne', value: provider.review_count > 0 ? provider.avg_rating.toFixed(1) : '—', hint: `${provider.review_count} avis`, Icon: Star, color: 'bg-sand text-deep-green' },
  ]

  return (
    <div className="p-5 md:p-8 space-y-8 max-w-5xl">
      <PageHeader title={`Bonjour, ${provider.business_name}`} subtitle="Voici un résumé réel de votre activité." />
      <ApprovalBanner provider={provider} />
      {provider.is_approved && !provider.stripe_onboarded && (
        <div className="rounded-xl bg-coral/10 text-coral text-xs px-4 py-3">
          <strong>Configurez vos paiements</strong> pour pouvoir recevoir des réservations :{' '}
          <Link href="/provider/paiements" className="underline">ouvrir la page Paiements</Link>.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, hint, Icon, color }) => (
          <div key={label} className="bg-coconut rounded-2xl p-4 border border-mist shadow-sm">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-display text-charcoal">{value}</p>
            <p className="text-xs text-stone mt-0.5">{label}</p>
            {hint ? <p className="text-xs text-stone/70 mt-1">{hint}</p> : null}
          </div>
        ))}
      </div>

      <p className="text-xs text-stone -mt-4">
        Revenu net : montant qui vous revient après paiement du voyageur, hors frais de service Ohaana. Total cumulé : {eur(stats.netRevenueTotalCents)}.
        {stats.honouredRate !== null && ` Prestations honorées : ${Math.round(stats.honouredRate * 100)} %.`}
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-coconut rounded-2xl border border-mist shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-mist flex items-center gap-2">
            <Clock size={15} className="text-deep-green" />
            <h2 className="text-sm font-semibold text-charcoal">Prochaines prestations</h2>
          </div>
          {stats.upcoming.length === 0 ? (
            <p className="px-5 py-6 text-sm text-stone">Aucune prestation confirmée à venir.</p>
          ) : (
            <ul className="divide-y divide-mist">
              {stats.upcoming.map((b) => (
                <li key={b.id} className="px-5 py-3.5 flex items-start gap-3">
                  <CheckCircle size={15} className="text-turquoise mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">{b.tourist_first_name || 'Voyageur'} · {b.guests_count} pers.</p>
                    <p className="text-xs text-stone truncate">{b.title_fr}</p>
                    <p className="text-xs text-deep-green/70 mt-0.5">{formatDateTimeFr(b.starts_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-coconut rounded-2xl border border-mist shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-mist flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-coral" />
              <h2 className="text-sm font-semibold text-charcoal">Paiements en attente</h2>
            </div>
            <Link href="/provider/reservations" className="text-xs text-deep-green hover:underline">Tout voir</Link>
          </div>
          {stats.awaitingPayment.length === 0 ? (
            <p className="px-5 py-6 text-sm text-stone">Aucune réservation en attente de paiement.</p>
          ) : (
            <ul className="divide-y divide-mist">
              {stats.awaitingPayment.map((b) => (
                <li key={b.id} className="px-5 py-3.5">
                  <p className="text-sm font-medium text-charcoal truncate">{b.tourist_first_name || 'Voyageur'} · {b.guests_count} pers.</p>
                  <p className="text-xs text-stone truncate">{b.title_fr}</p>
                  <p className="text-xs text-stone/70 mt-0.5">{formatDateTimeFr(b.starts_at)} · {eur(b.total_cents)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
