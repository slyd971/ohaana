import { getAdminContext } from '@/lib/admin/context'
import { CommissionForm } from '@/components/admin/CommissionForm'
import { DEFAULT_COMMISSION_PCT } from '@/lib/utils'

export default async function AdminSettingsPage() {
  const ctx = await getAdminContext()
  if (ctx.kind === 'demo') {
    return <div className="p-5 md:p-8 text-white/50 text-sm">Mode démo : les paramètres sont désactivés.</div>
  }
  if (ctx.kind !== 'admin') return null

  // Lu avec la session de l'admin (la table est réservée à l'admin) ; repli sur le défaut si absente.
  const { data } = await ctx.supabase.from('platform_settings').select('value').eq('key', 'commission_pct').maybeSingle()
  const current = typeof data?.value === 'number' ? data.value : DEFAULT_COMMISSION_PCT

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display text-white">Paramètres</h1>
        <p className="text-white/40 text-sm mt-0.5">Réglages de la plateforme. Chaque changement est journalisé.</p>
      </div>
      <div className="bg-sand rounded-2xl p-3 md:p-4">
        <CommissionForm current={current} />
      </div>
    </div>
  )
}
