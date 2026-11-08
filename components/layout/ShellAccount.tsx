'use client'

import { ArrowLeftRight } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { useAuth } from '@/lib/auth/AuthProvider'

const ROLE_LABELS: Record<string, string> = {
  tourist: 'Voyageur',
  provider: 'Prestataire',
  partner: 'Partenaire',
  concierge: 'Conciergerie',
  admin: 'Administrateur',
}

/**
 * Account block at the bottom of the back-office menus: who is signed in, with which role, and — for an
 * admin — a shortcut to the other space (an admin may open the provider space of their own profile).
 */
export function ShellAccount({ space }: { space: 'admin' | 'provider' }) {
  const { user, role, isDemo } = useAuth()

  if (isDemo) {
    return (
      <div className="mx-3 mb-3 rounded-control bg-white/5 px-3 py-2.5 text-xs text-white/50">Mode démo : aucun compte connecté.</div>
    )
  }
  if (!user) return null

  const name = user.fullName?.trim() || user.email
  const initial = name.charAt(0).toUpperCase()
  const otherSpace = space === 'admin'
    ? { href: '/provider/dashboard', label: 'Espace prestataire' }
    : { href: '/admin/dashboard', label: 'Espace admin' }

  return (
    <div className="mx-3 mb-3 rounded-control bg-white/5 px-3 py-3">
      <Link href={space === 'admin' ? '/admin/settings' : '/provider/settings'} className="flex items-center gap-3" title="Gérer mon compte">
        <span
          aria-hidden
          className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white"
        >
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{name}</p>
          {user.fullName && <p className="truncate text-[11px] text-white/45">{user.email}</p>}
          <p className="mt-0.5 inline-block rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white/70">
            {ROLE_LABELS[role ?? ''] ?? role}
          </p>
        </div>
      </Link>
      {role === 'admin' && (
        <Link
          href={otherSpace.href}
          className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ArrowLeftRight size={13} />
          {otherSpace.label}
        </Link>
      )}
    </div>
  )
}
