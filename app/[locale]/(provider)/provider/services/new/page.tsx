import { getCategories } from '@/lib/data/services'
import { getProviderContext } from '@/lib/provider/context'
import { PageHeader, SignInRequired } from '@/components/provider/ui'
import { ServiceForm } from '@/components/provider/ServiceForm'
import { DemoServices } from '../../_demo/DemoServices'

export default async function NewServicePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const ctx = await getProviderContext()
  if (ctx.kind === 'demo') return <DemoServices />
  if (ctx.kind !== 'provider') return <SignInRequired kind={ctx.kind} />

  const categories = await getCategories().catch(() => [])
  return (
    <div className="p-5 md:p-8 space-y-6 max-w-3xl">
      <PageHeader title="Nouveau service" subtitle="Enregistré en brouillon : vous le soumettrez à la relecture quand il est prêt." />
      <ServiceForm
        locale={locale}
        categories={categories.map((c) => ({ id: c.id, name_fr: c.name_fr }))}
        defaultIsland={ctx.provider.island}
      />
    </div>
  )
}
