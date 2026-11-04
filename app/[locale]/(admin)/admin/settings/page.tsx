import { AccountSecurity } from '@/components/account/AccountSecurity'

export default function AdminAccountPage() {
  return (
    <div className="p-5 md:p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display text-white">Mon compte</h1>
        <p className="text-white/40 text-sm mt-0.5">Identifiants de connexion de votre compte administrateur.</p>
      </div>
      <div className="bg-sand rounded-2xl p-3 md:p-4">
        <AccountSecurity returnTo="/admin/settings" />
      </div>
    </div>
  )
}
