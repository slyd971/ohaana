import { notFound } from 'next/navigation'
import { getCategories } from '@/lib/data/services'
import { getProviderContext } from '@/lib/provider/context'
import { getProviderService } from '@/lib/provider/queries'
import { PageHeader, SignInRequired, StatusBadge } from '@/components/provider/ui'
import { ServiceForm } from '@/components/provider/ServiceForm'
import { ServiceImagesManager } from '@/components/provider/ServiceImagesManager'
import { listServiceImages } from '@/lib/provider/images'
import { manageServiceImageAction } from '@/app/actions/provider'
import { DemoServices } from '../../_demo/DemoServices'

export default async function EditServicePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  const ctx = await getProviderContext()
  if (ctx.kind === 'demo') return <DemoServices />
  if (ctx.kind !== 'provider') return <SignInRequired kind={ctx.kind} />

  const service = await getProviderService(ctx.supabase, ctx.provider.id, id)
  if (!service) notFound()
  const categories = await getCategories().catch(() => [])
  const images = await listServiceImages(ctx.supabase, service.id)

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-3xl">
      <PageHeader title="Modifier le service" subtitle={service.title_fr} action={<StatusBadge status={service.status} />} />
      <ServiceForm
        locale={locale}
        categories={categories.map((c) => ({ id: c.id, name_fr: c.name_fr }))}
        service={service}
        defaultIsland={ctx.provider.island}
      />
      <ServiceImagesManager serviceId={service.id} providerId={ctx.provider.id} images={images} act={manageServiceImageAction} />
    </div>
  )
}
