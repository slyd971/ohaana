import { Link } from '@/lib/i18n/navigation'
import { getProviderContext } from '@/lib/provider/context'
import { listProviderServices, listSlotDays } from '@/lib/provider/queries'
import { nowDate } from '@/lib/data/dates'
import { AvailabilityEditor } from '@/components/provider/AvailabilityEditor'
import { EmptyState, PageHeader, SignInRequired } from '@/components/provider/ui'

export default async function AvailabilityPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const ctx = await getProviderContext()
  if (ctx.kind === 'demo') {
    return (
      <div className="p-5 md:p-8 max-w-3xl">
        <PageHeader title="Disponibilités" subtitle="Mode démo : la gestion des créneaux est désactivée." />
      </div>
    )
  }
  if (ctx.kind !== 'provider') return <SignInRequired kind={ctx.kind} />

  const services = (await listProviderServices(ctx.supabase)).filter((s) => s.status !== 'archived')
  const { service: wanted } = await searchParams
  const current = services.find((s) => s.id === wanted) ?? services[0]

  if (!current) {
    return (
      <div className="p-5 md:p-8 space-y-6 max-w-3xl">
        <PageHeader title="Disponibilités" />
        <EmptyState title="Créez d’abord un service">
          Les disponibilités se gèrent service par service. <Link href="/provider/services/new" className="text-deep-green underline">Ajouter un service</Link>
        </EmptyState>
      </div>
    )
  }

  const from = nowDate().toISOString().slice(0, 10)
  const days = await listSlotDays(ctx.supabase, current.id, from, 60)

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-3xl">
      <PageHeader title="Disponibilités" subtitle="Définissez quand vos services peuvent être réservés." />

      <nav aria-label="Choisir un service" className="flex flex-wrap gap-2">
        {services.map((s) => (
          <Link
            key={s.id}
            href={`/provider/disponibilites?service=${s.id}`}
            aria-current={s.id === current.id ? 'page' : undefined}
            className={`px-3.5 py-1.5 rounded-full text-xs border max-w-full truncate transition-colors ${
              s.id === current.id ? 'bg-deep-green text-coconut border-deep-green' : 'border-mist text-stone hover:bg-sand'
            }`}
          >
            {s.title_fr}
          </Link>
        ))}
      </nav>

      <AvailabilityEditor key={current.id} serviceId={current.id} days={days} />
    </div>
  )
}
