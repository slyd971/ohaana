import { getProviderContext } from '@/lib/provider/context'
import { ApprovalBanner, PageHeader, SignInRequired } from '@/components/provider/ui'
import { ProfileForm } from '@/components/provider/ProfileForm'
import { AccountSecurity } from '@/components/account/AccountSecurity'
import { DemoSettings } from '../_demo/DemoSettings'

export default async function ProviderSettingsPage() {
  const ctx = await getProviderContext()
  if (ctx.kind === 'demo') return <DemoSettings />
  if (ctx.kind !== 'provider') return <SignInRequired kind={ctx.kind} />

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-3xl">
      <PageHeader title="Paramètres" subtitle="Votre profil prestataire." />
      <ApprovalBanner provider={ctx.provider} />
      <ProfileForm provider={ctx.provider} />
      <PageHeader title="Mon compte" subtitle="Identifiants de connexion." />
      <AccountSecurity returnTo="/provider/settings" />
    </div>
  )
}
