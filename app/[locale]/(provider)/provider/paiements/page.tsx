import { Wallet, TrendingUp, Clock } from 'lucide-react'
import { getProviderContext } from '@/lib/provider/context'
import { listProviderBookings, listProviderPayments } from '@/lib/provider/queries'
import { EmptyState, PageHeader, SignInRequired, eur } from '@/components/provider/ui'
import { PaymentsSetup } from '@/components/provider/PaymentsSetup'
import { syncProviderPaymentsStatus } from '@/lib/stripe/connect-service'
import type { ConnectState } from '@/lib/stripe/connect-status'
import { DemoPaiements } from '../_demo/DemoPaiements'

const PAYMENT_LABELS: Record<string, string> = {
  succeeded: 'Encaissé',
  pending: 'En attente',
  failed: 'Échoué',
  refunded: 'Remboursé',
}

export default async function ProviderPaiementsPage() {
  const ctx = await getProviderContext()
  if (ctx.kind === 'demo') return <DemoPaiements />
  if (ctx.kind !== 'provider') return <SignInRequired kind={ctx.kind} />

  const [payments, bookings] = await Promise.all([listProviderPayments(ctx.supabase), listProviderBookings(ctx.supabase, 300)])
  const titleByBooking = new Map(bookings.map((b) => [b.id, b.title_fr]))

  // État du compte de versement : relu chez Stripe à chaque visite (le prestataire revient du formulaire de Stripe sur cette page).
  const { data: stripeRow } = await ctx.supabase.from('provider_profiles').select('stripe_account_id').eq('id', ctx.provider.id).maybeSingle()
  let paymentsState: ConnectState = ctx.provider.stripe_onboarded ? 'active' : stripeRow?.stripe_account_id ? 'incomplete' : 'none'
  if (stripeRow?.stripe_account_id) {
    try {
      paymentsState = (await syncProviderPaymentsStatus(ctx.provider.id)).state
    } catch {
      // Stripe injoignable ou non configuré : on garde le dernier état connu.
    }
  }
  const received = payments.filter((p) => p.status === 'succeeded').reduce((sum, p) => sum + p.provider_amount_cents, 0)
  const pending = payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.provider_amount_cents, 0)
  const refunded = payments.filter((p) => p.status === 'refunded').reduce((sum, p) => sum + p.provider_amount_cents, 0)

  const summary = [
    { label: 'Encaissé (net)', value: eur(received), Icon: TrendingUp, color: 'bg-turquoise/10 text-turquoise' },
    { label: 'En attente', value: eur(pending), Icon: Clock, color: 'bg-[#F5A623]/15 text-[#B7791F]' },
    { label: 'Remboursé', value: eur(refunded), Icon: Wallet, color: 'bg-sand text-deep-green' },
  ]

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-4xl">
      <PageHeader title="Paiements" subtitle="Historique réel de vos encaissements." />

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {summary.map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-coconut rounded-2xl p-4 border border-mist">
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-xl mb-2 ${color}`}><Icon size={16} /></div>
            <p className="text-lg sm:text-xl font-display text-charcoal">{value}</p>
            <p className="text-[11px] text-stone">{label}</p>
          </div>
        ))}
      </div>

      <PaymentsSetup initialState={paymentsState} approved={ctx.provider.is_approved} />

      {payments.length === 0 ? (
        <EmptyState title="Aucun paiement pour l’instant" />
      ) : (
        <div className="bg-coconut rounded-2xl border border-mist overflow-hidden">
          <ul className="divide-y divide-mist">
            {payments.map((p) => (
              <li key={`${p.booking_id}-${p.created_at}`} className="px-5 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-charcoal truncate">{titleByBooking.get(p.booking_id) ?? 'Réservation'}</p>
                  <p className="text-[11px] text-stone">
                    {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(p.created_at))} · {PAYMENT_LABELS[p.status] ?? p.status}
                  </p>
                </div>
                <div className="text-right flex-none">
                  <p className="text-sm font-semibold text-deep-green">{eur(p.provider_amount_cents)}</p>
                  <p className="text-[11px] text-stone">payé par le voyageur : {eur(p.total_cents)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
