import { Link } from '@/lib/i18n/navigation'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin/context'
import { generateSlotsAsAdminAction, setDayBlockedAsAdminAction } from '@/app/actions/admin'
import { listProviderServices, listSlotDays } from '@/lib/provider/queries'
import { AvailabilityEditor } from '@/components/provider/AvailabilityEditor'
import { nowDate } from '@/lib/data/dates'
import { isUuid } from '@/lib/provider/service-input'

export default async function AdminAvailabilityPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>
  searchParams: Promise<{ service?: string }>
}) {
  const { id } = await params
  const { service: wanted } = await searchParams
  const ctx = await getAdminContext()
  if (ctx.kind === 'demo') return <div className="p-5 md:p-8 text-white/50 text-sm">Mode démo : désactivé.</div>
  if (ctx.kind !== 'admin') return null
  if (!isUuid(id)) notFound()

  const { data: provider } = await ctx.supabase.from('provider_profiles').select('id, business_name').eq('id', id).maybeSingle()
  if (!provider) notFound()
  const services = (await listProviderServices(ctx.supabase, id)).filter((s) => s.status !== 'archived')
  const current = services.find((s) => s.id === wanted) ?? services[0]

  const days = current ? await listSlotDays(ctx.supabase, current.id, nowDate().toISOString().slice(0, 10), 60) : []

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-3xl">
      <div>
        <Link href={`/admin/providers/${id}`} className="text-xs text-white/40 hover:text-white/70">← {provider.business_name}</Link>
        <h1 className="text-2xl font-display text-white mt-2">Disponibilités</h1>
      </div>
      {!current ? (
        <p className="bg-white/5 border border-white/8 rounded-card px-5 py-6 text-sm text-white/40">Ajoutez d’abord un service.</p>
      ) : (
        <>
          <nav aria-label="Choisir un service" className="flex flex-wrap gap-2">
            {services.map((s) => (
              <Link
                key={s.id}
                href={`/admin/providers/${id}/disponibilites?service=${s.id}`}
                aria-current={s.id === current.id ? 'page' : undefined}
                className={`px-3.5 py-1.5 rounded-full text-xs border max-w-full truncate ${
                  s.id === current.id ? 'bg-turquoise/20 text-turquoise border-turquoise/30' : 'border-white/10 text-white/50 hover:bg-white/5'
                }`}
              >
                {s.title_fr}
              </Link>
            ))}
          </nav>
          <div className="bg-sand rounded-card p-3 md:p-4">
            <AvailabilityEditor
              key={current.id}
              serviceId={current.id}
              days={days}
              generate={generateSlotsAsAdminAction}
              block={setDayBlockedAsAdminAction}
            />
          </div>
        </>
      )}
    </div>
  )
}
