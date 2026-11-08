import { getAdminContext } from '@/lib/admin/context'
import { LeadStatusSelect } from '@/components/admin/LeadStatusSelect'
import { LEAD_STATUSES } from '@/lib/admin/schemas'

interface Lead {
  id: string
  email: string
  destination: string | null
  whatsapp: string | null
  locale: string
  source: string
  status: (typeof LEAD_STATUSES)[number]
  created_at: string
}

export default async function AdminLeadsPage() {
  const ctx = await getAdminContext()
  if (ctx.kind === 'demo') {
    return <div className="p-5 md:p-8 text-white/50 text-sm">Mode démo : les leads sont désactivés.</div>
  }
  if (ctx.kind !== 'admin') return null

  const { data, error } = await ctx.supabase
    .from('leads')
    .select('id, email, destination, whatsapp, locale, source, status, created_at')
    .order('created_at', { ascending: false })
    .limit(200)
  const leads = (data ?? []) as Lead[]
  const fresh = leads.filter((l) => l.status === 'new').length

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display text-white">Leads</h1>
          <p className="text-white/40 text-sm mt-0.5">{leads.length} contacts · {fresh} nouveau{fresh > 1 ? 'x' : ''}</p>
        </div>
        {/* Téléchargement d'un fichier (route handler) : un <a> classique, pas une navigation de page. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/admin/leads"
          className="flex-none text-xs bg-turquoise/20 text-turquoise border border-turquoise/30 px-4 py-2 rounded-control hover:bg-turquoise/30"
        >
          Exporter en CSV
        </a>
      </div>

      {error && <p role="alert" className="text-sm text-red-400">Impossible de charger les leads.</p>}

      <div className="bg-white/5 rounded-card border border-white/8 overflow-hidden">
        {leads.length === 0 ? (
          <p className="px-5 py-6 text-sm text-white/40">Aucun lead pour l’instant.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {leads.map((l) => (
              <li key={l.id} className="px-5 py-4 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{l.email}</p>
                  <p className="text-xs text-white/40">
                    {[l.destination, l.whatsapp, l.locale.toUpperCase(), l.source].filter(Boolean).join(' · ')} ·{' '}
                    {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(l.created_at))}
                  </p>
                </div>
                <LeadStatusSelect leadId={l.id} status={l.status} email={l.email} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
