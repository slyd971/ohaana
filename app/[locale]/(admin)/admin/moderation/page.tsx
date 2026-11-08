import { getAdminContext } from '@/lib/admin/context'
import { FeatureToggle, ReviewActions } from '@/components/admin/ModerationActions'
import { eur } from '@/components/provider/ui'

interface Row {
  id: string
  title_fr: string
  description_fr: string | null
  island: string
  price_cents: number
  price_unit: 'per_person' | 'flat'
  duration_min: number | null
  capacity_min: number
  capacity_max: number
  status: string
  is_featured: boolean
  created_at: string
  provider_profiles: { business_name: string; is_approved: boolean } | null
}

const COLUMNS =
  'id, title_fr, description_fr, island, price_cents, price_unit, duration_min, capacity_min, capacity_max, status, is_featured, created_at, provider_profiles ( business_name, is_approved )'

export default async function AdminModerationPage() {
  const ctx = await getAdminContext()
  if (ctx.kind === 'demo') {
    return (
      <div className="p-5 md:p-8 max-w-4xl">
        <h1 className="text-2xl font-display text-white">Modération</h1>
        <p className="text-white/40 text-sm mt-1">Mode démo : la modération est désactivée.</p>
      </div>
    )
  }
  if (ctx.kind !== 'admin') return null

  const [pendingRes, publishedRes] = await Promise.all([
    ctx.supabase.from('services').select(COLUMNS).eq('status', 'pending_review').order('created_at'),
    ctx.supabase.from('services').select(COLUMNS).eq('status', 'published').order('created_at', { ascending: false }).limit(50),
  ])
  const pending = (pendingRes.data ?? []) as unknown as Row[]
  const published = (publishedRes.data ?? []) as unknown as Row[]
  const failed = Boolean(pendingRes.error || publishedRes.error)

  return (
    <div className="p-5 md:p-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display text-white">Modération</h1>
        <p className="text-white/40 text-sm mt-0.5">{pending.length} fiche{pending.length > 1 ? 's' : ''} en attente de relecture</p>
      </div>

      {failed && <p role="alert" className="text-sm text-red-400">Impossible de charger toutes les fiches.</p>}

      <section aria-labelledby="pending-title" className="space-y-3">
        <h2 id="pending-title" className="text-sm font-semibold text-white/80">À relire</h2>
        {pending.length === 0 ? (
          <p className="bg-white/5 border border-white/8 rounded-card px-5 py-6 text-sm text-white/40">Aucune fiche en attente.</p>
        ) : (
          pending.map((s) => {
            const provider = s.provider_profiles
            return (
              <article key={s.id} className="bg-white/5 rounded-card border border-white/8 p-5 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-white">{s.title_fr}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {provider?.business_name ?? 'Prestataire inconnu'} ·{' '}
                    {provider?.is_approved ? (
                      <span className="text-green-400">approuvé</span>
                    ) : (
                      <span className="text-star">non approuvé</span>
                    )}
                  </p>
                </div>
                <p className="text-sm text-white/70 whitespace-pre-line line-clamp-6">{s.description_fr}</p>
                <p className="text-xs text-white/50">
                  {eur(s.price_cents)}{s.price_unit === 'per_person' ? ' / pers.' : ' (groupe)'} · {s.duration_min ?? '?'} min ·{' '}
                  {s.capacity_min}–{s.capacity_max} pers. · {s.island}
                </p>
                <ReviewActions serviceId={s.id} providerApproved={Boolean(provider?.is_approved)} />
              </article>
            )
          })
        )}
      </section>

      <section aria-labelledby="published-title" className="space-y-3">
        <h2 id="published-title" className="text-sm font-semibold text-white/80">Publiées</h2>
        {published.length === 0 ? (
          <p className="bg-white/5 border border-white/8 rounded-card px-5 py-6 text-sm text-white/40">Aucune fiche publiée.</p>
        ) : (
          <ul className="bg-white/5 rounded-card border border-white/8 divide-y divide-white/5">
            {published.map((s) => (
              <li key={s.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{s.title_fr}</p>
                  <p className="text-xs text-white/40">{s.provider_profiles?.business_name} · {eur(s.price_cents)}</p>
                </div>
                <FeatureToggle serviceId={s.id} featured={s.is_featured} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
