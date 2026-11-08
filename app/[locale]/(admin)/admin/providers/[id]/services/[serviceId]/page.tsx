import { Link } from '@/lib/i18n/navigation'
import { notFound } from 'next/navigation'
import { getAdminContext } from '@/lib/admin/context'
import { saveServiceAsAdminAction, manageServiceImageAsAdminAction } from '@/app/actions/admin'
import { getCategories } from '@/lib/data/services'
import { getCommissionPct } from '@/lib/commission'
import { getProviderService } from '@/lib/provider/queries'
import { ServiceForm } from '@/components/provider/ServiceForm'
import { ServiceImagesManager } from '@/components/provider/ServiceImagesManager'
import { listServiceImages } from '@/lib/provider/images'
import { isUuid } from '@/lib/provider/service-input'

export default async function AdminEditServicePage({ params }: { params: Promise<{ locale: string; id: string; serviceId: string }> }) {
  const { locale, id, serviceId } = await params
  const ctx = await getAdminContext()
  if (ctx.kind === 'demo') return <div className="p-5 md:p-8 text-white/50 text-sm">Mode démo : désactivé.</div>
  if (ctx.kind !== 'admin') return null
  if (!isUuid(id) || !isUuid(serviceId)) notFound()

  const { data: provider } = await ctx.supabase.from('provider_profiles').select('id, business_name, island').eq('id', id).maybeSingle()
  const service = provider ? await getProviderService(ctx.supabase, id, serviceId) : null
  if (!provider || !service) notFound()
  const categories = await getCategories().catch(() => [])
  const commissionPct = await getCommissionPct()
  const images = await listServiceImages(ctx.supabase, service.id)

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-3xl">
      <div>
        <Link href={`/admin/providers/${id}`} className="text-xs text-white/40 hover:text-white/70">← {provider.business_name}</Link>
        <h1 className="text-2xl font-display text-white mt-2">Modifier le service</h1>
        <p className="text-white/40 text-sm mt-0.5">{service.title_fr}</p>
      </div>
      <div className="bg-sand rounded-card p-3 md:p-4">
        <ServiceForm
          commissionPct={commissionPct}
          locale={locale}
          categories={categories.map((c) => ({ id: c.id, name_fr: c.name_fr }))}
          service={service}
          defaultIsland={provider.island}
          action={saveServiceAsAdminAction}
          providerId={id}
        />
      </div>
      <div className="bg-sand rounded-card p-3 md:p-4">
        <ServiceImagesManager serviceId={service.id} providerId={id} images={images} act={manageServiceImageAsAdminAction} />
      </div>
    </div>
  )
}
