import { Link } from '@/lib/i18n/navigation'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin/context'
import { saveProviderAsAdminAction } from '@/app/actions/admin'
import { listProviderServices } from '@/lib/provider/queries'
import { ProfileForm } from '@/components/provider/ProfileForm'
import { ServiceStatusActions } from '@/components/admin/ServiceStatusActions'
import { StatusBadge, eur } from '@/components/provider/ui'
import { isUuid } from '@/lib/provider/service-input'

export default async function AdminProviderPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id } = await params
  const ctx = await getAdminContext()
  if (ctx.kind === 'demo') {
    return <div className="p-5 md:p-8 text-white/50 text-sm">Mode démo : l’édition des prestataires est désactivée.</div>
  }
  if (ctx.kind !== 'admin') return null
  if (!isUuid(id)) notFound()

  const { data: provider } = await ctx.supabase
    .from('provider_profiles')
    .select('id, business_name, bio, languages, island, phone, whatsapp, is_approved, user_id, claimed')
    .eq('id', id)
    .maybeSingle()
  if (!provider) notFound()
  const services = await listProviderServices(ctx.supabase, id)

  return (
    <div className="p-5 md:p-8 space-y-8 max-w-3xl">
      <div>
        <Link href="/admin/providers" className="text-xs text-white/40 hover:text-white/70">← Prestataires</Link>
        <h1 className="text-2xl font-display text-white mt-2">{provider.business_name}</h1>
        <p className="text-white/40 text-sm mt-0.5">
          {provider.user_id ? 'Prestataire avec compte' : 'Prestataire géré, sans compte'} ·{' '}
          {provider.is_approved ? 'approuvé' : 'non approuvé'}
        </p>
      </div>

      <section aria-labelledby="profile-title" className="space-y-3">
        <h2 id="profile-title" className="text-sm font-semibold text-white/80">Profil</h2>
        <div className="bg-sand rounded-2xl p-3 md:p-4">
          <ProfileForm
            provider={{ ...provider, languages: provider.languages ?? [] }}
            action={saveProviderAsAdminAction}
            hidden={{ provider_id: id }}
          />
        </div>
      </section>

      <section aria-labelledby="services-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="services-title" className="text-sm font-semibold text-white/80">Services ({services.length})</h2>
          <Link
            href={`/admin/providers/${id}/services/new`}
            className="text-xs bg-turquoise/20 text-turquoise border border-turquoise/30 px-3 py-1.5 rounded-lg hover:bg-turquoise/30"
          >
            Ajouter un service
          </Link>
        </div>
        {services.length === 0 ? (
          <p className="bg-white/5 border border-white/8 rounded-2xl px-5 py-6 text-sm text-white/40">Aucun service pour ce prestataire.</p>
        ) : (
          <ul className="space-y-3">
            {services.map((s) => (
              <li key={s.id} className="bg-white/5 rounded-2xl border border-white/8 p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1"><StatusBadge status={s.status} /></div>
                    <p className="text-sm font-semibold text-white">{s.title_fr}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {eur(s.price_cents)}{s.price_unit === 'per_person' ? ' / pers.' : ' (groupe)'} · {s.duration_min ?? '?'} min · {s.capacity_min}–{s.capacity_max} pers.
                    </p>
                  </div>
                  <div className="flex flex-none gap-3 text-xs">
                    <Link href={`/admin/providers/${id}/disponibilites?service=${s.id}`} className="text-turquoise hover:underline">Disponibilités</Link>
                    <Link href={`/admin/providers/${id}/services/${s.id}`} className="text-turquoise hover:underline">Modifier</Link>
                  </div>
                </div>
                <ServiceStatusActions serviceId={s.id} status={s.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
