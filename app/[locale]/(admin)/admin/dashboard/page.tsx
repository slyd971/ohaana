import { Briefcase, CalendarCheck, CreditCard, Inbox, Users2 } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { getAdminContext } from '@/lib/admin/context'
import { eur } from '@/components/provider/ui'
import { PendingRefunds, type PendingRefund } from '@/components/admin/PendingRefunds'
import { DemoAdminDashboard } from '../_demo/DemoAdminDashboard'

export default async function AdminDashboard() {
  const ctx = await getAdminContext()
  if (ctx.kind === 'demo') return <DemoAdminDashboard />
  if (ctx.kind !== 'admin') return null
  const { supabase } = ctx

  // Les comptes et fiches de démonstration (is_demo) ne comptent pas dans les chiffres.
  const [users, providersOk, providersPending, servicesPub, servicesReview, bookingsDone, leadsNew, payments, pendingList, lastPayments] =
    await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }).not('is_demo', 'is', true),
      supabase.from('provider_profiles').select('id', { count: 'exact', head: true }).eq('is_approved', true).not('is_demo', 'is', true),
      supabase.from('provider_profiles').select('id', { count: 'exact', head: true }).eq('is_approved', false).not('is_demo', 'is', true),
      supabase.from('services').select('id', { count: 'exact', head: true }).eq('status', 'published').not('is_demo', 'is', true),
      supabase.from('services').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).in('status', ['confirmed', 'completed']),
      supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('payments').select('total_cents, platform_fee_cents').eq('status', 'succeeded').limit(5000),
      supabase.from('provider_profiles').select('id, business_name, island, created_at').eq('is_approved', false).not('is_demo', 'is', true).order('created_at', { ascending: false }).limit(5),
      supabase.from('payments').select('id, total_cents, status, created_at').order('created_at', { ascending: false }).limit(5),
    ])

  // Remboursements d'annulation non partis. Si la migration 011 n'est pas encore appliquée, la section n'apparaît simplement pas.
  const { data: refundRows } = await supabase.rpc('admin_pending_refunds')
  const pendingRefunds = (Array.isArray(refundRows) ? refundRows : []) as PendingRefund[]

  const paid = (payments.data ?? []) as { total_cents: number; platform_fee_cents: number }[]
  const gmv = paid.reduce((s, p) => s + p.total_cents, 0)
  const fees = paid.reduce((s, p) => s + p.platform_fee_cents, 0)
  const pending = (pendingList.data ?? []) as { id: string; business_name: string; island: string; created_at: string }[]
  const recent = (lastPayments.data ?? []) as { id: string; total_cents: number; status: string; created_at: string }[]

  const kpis = [
    { label: 'Utilisateurs', value: String(users.count ?? 0), hint: '', Icon: Users2, color: 'text-blue-400' },
    { label: 'Prestataires approuvés', value: String(providersOk.count ?? 0), hint: `${providersPending.count ?? 0} en attente`, Icon: Briefcase, color: 'text-turquoise' },
    { label: 'Services publiés', value: String(servicesPub.count ?? 0), hint: `${servicesReview.count ?? 0} en relecture`, Icon: Briefcase, color: 'text-green-400' },
    { label: 'Réservations confirmées', value: String(bookingsDone.count ?? 0), hint: '', Icon: CalendarCheck, color: 'text-star' },
    { label: 'Volume encaissé (GMV)', value: eur(gmv), hint: `dont ${eur(fees)} de commission Ohaana`, Icon: CreditCard, color: 'text-star' },
    { label: 'Leads à traiter', value: String(leadsNew.count ?? 0), hint: '', Icon: Inbox, color: 'text-coral' },
  ]

  return (
    <div className="p-5 md:p-8 space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-display text-white">Administration Ohaana</h1>
        <p className="text-white/40 text-sm mt-0.5">Vue globale de la plateforme, chiffres réels (hors comptes de démonstration).</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map(({ label, value, hint, Icon, color }) => (
          <div key={label} className="bg-white/5 rounded-card p-4 border border-white/8">
            <Icon size={18} className={`mb-3 ${color}`} />
            <p className="text-2xl font-display text-white">{value}</p>
            <p className="text-xs text-white/40 mt-0.5">{label}</p>
            {hint && <p className="text-xs text-white/50 mt-1">{hint}</p>}
          </div>
        ))}
      </div>

      {pendingRefunds.length > 0 && <PendingRefunds rows={pendingRefunds} />}

      <div className="grid md:grid-cols-2 gap-6">
        <section aria-labelledby="todo-title" className="bg-white/5 rounded-card border border-white/8 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
            <h2 id="todo-title" className="text-sm font-semibold text-white">Prestataires à valider</h2>
            <Link href="/admin/providers" className="text-xs text-turquoise hover:underline">Tout voir</Link>
          </div>
          {pending.length === 0 ? (
            <p className="px-5 py-6 text-sm text-white/40">Aucun prestataire en attente.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {pending.map((p) => (
                <li key={p.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/admin/providers/${p.id}`} className="text-sm text-white hover:text-turquoise truncate block">{p.business_name}</Link>
                    <p className="text-xs text-white/40">{p.island} · inscrit le {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(p.created_at))}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {(servicesReview.count ?? 0) > 0 && (
            <div className="px-5 py-3 border-t border-white/8 text-xs text-white/60">
              {servicesReview.count} fiche(s) en relecture : <Link href="/admin/moderation" className="text-turquoise hover:underline">ouvrir la modération</Link>
            </div>
          )}
        </section>

        <section aria-labelledby="pay-title" className="bg-white/5 rounded-card border border-white/8 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8">
            <h2 id="pay-title" className="text-sm font-semibold text-white">Derniers paiements</h2>
          </div>
          {recent.length === 0 ? (
            <p className="px-5 py-6 text-sm text-white/40">Aucun paiement enregistré. Les paiements du mode démo ne sont pas stockés.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {recent.map((p) => (
                <li key={p.id} className="px-5 py-3.5 flex items-center justify-between text-sm">
                  <span className="text-white/70">{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(p.created_at))} · {p.status}</span>
                  <span className="font-medium text-white">{eur(p.total_cents)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
