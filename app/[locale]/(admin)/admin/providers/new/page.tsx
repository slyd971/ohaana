import { Link } from '@/lib/i18n/navigation'
import { getAdminContext } from '@/lib/admin/context'
import { createManagedProviderAction } from '@/app/actions/admin'
import { ProfileForm } from '@/components/provider/ProfileForm'

export default async function NewManagedProviderPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const ctx = await getAdminContext()
  if (ctx.kind === 'demo') {
    return <div className="p-5 md:p-8 text-white/50 text-sm">Mode démo : la création de prestataires est désactivée.</div>
  }
  if (ctx.kind !== 'admin') return null

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-3xl">
      <div>
        <Link href="/admin/providers" className="text-xs text-white/40 hover:text-white/70">← Prestataires</Link>
        <h1 className="text-2xl font-display text-white mt-2">Nouveau prestataire géré</h1>
        <p className="text-white/40 text-sm mt-0.5">
          Crée une fiche sans compte, approuvée d’emblée. Vous ajoutez ensuite ses services et ses créneaux.
        </p>
      </div>
      <div className="bg-sand rounded-card p-3 md:p-4">
        <ProfileForm action={createManagedProviderAction} hidden={{ locale }} submitLabel="Créer le prestataire" />
      </div>
    </div>
  )
}
