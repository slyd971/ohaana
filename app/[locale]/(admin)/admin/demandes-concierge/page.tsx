import { getAdminContext } from '@/lib/admin/context'
import { LeadStatusSelect } from '@/components/admin/LeadStatusSelect'
import { LEAD_STATUSES } from '@/lib/admin/schemas'

interface ConciergeRequest {
  id: string
  message: string
  stay_dates: string | null
  location: string | null
  contact: string
  locale: string
  status: (typeof LEAD_STATUSES)[number]
  created_at: string
}

export default async function AdminConciergeRequestsPage() {
  const ctx = await getAdminContext()
  if (ctx.kind === 'demo') {
    return <div className="p-5 md:p-8 text-white/50 text-sm">Mode démo : les demandes concierge sont désactivées.</div>
  }
  if (ctx.kind !== 'admin') return null

  const { data, error } = await ctx.supabase
    .from('concierge_requests')
    .select('id, message, stay_dates, location, contact, locale, status, created_at')
    .order('created_at', { ascending: false })
    .limit(200)
  const requests = (data ?? []) as ConciergeRequest[]
  const fresh = requests.filter((r) => r.status === 'new').length

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-display text-white">Demandes concierge</h1>
        <p className="text-white/40 text-sm mt-0.5">{requests.length} demandes · {fresh} nouvelle{fresh > 1 ? 's' : ''}</p>
      </div>

      {error && <p role="alert" className="text-sm text-red-400">Impossible de charger les demandes.</p>}

      <div className="bg-white/5 rounded-card border border-white/8 overflow-hidden">
        {requests.length === 0 ? (
          <p className="px-5 py-6 text-sm text-white/40">Aucune demande pour l’instant.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {requests.map((r) => (
              <li key={r.id} className="px-5 py-4 flex flex-col md:flex-row md:items-start gap-3 md:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm text-white whitespace-pre-wrap break-words">{r.message}</p>
                  <p className="text-xs text-white/40">
                    {[r.stay_dates, r.location].filter(Boolean).join(' · ')}
                    {(r.stay_dates || r.location) && ' · '}
                    <span className="text-turquoise">{r.contact}</span> · {r.locale.toUpperCase()} ·{' '}
                    {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(r.created_at))}
                  </p>
                </div>
                <LeadStatusSelect leadId={r.id} status={r.status} email={r.contact} kind="concierge" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
