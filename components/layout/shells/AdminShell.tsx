'use client'

import { useState } from 'react'
import { IconButton } from '@/components/ui/IconButton'
import { usePathname } from 'next/navigation'
import { Link } from '@/lib/i18n/navigation'
import { useAuth } from '@/lib/auth/AuthProvider'
import { OhaanaLogo } from '@/components/layout/OhaanaLogo'
import { ShellAccount } from '@/components/layout/ShellAccount'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users2, Briefcase,
  CreditCard, ShieldCheck, LogOut, ArrowLeft, Menu, BarChart3, ClipboardCheck, UserCog, Tags, Inbox, SlidersHorizontal } from 'lucide-react'

const NAV = [
  { href: '/admin/dashboard',    label: 'Vue globale',         Icon: LayoutDashboard },
  { href: '/admin/analytics',    label: 'Analytics',           Icon: BarChart3 },
  { href: '/admin/providers',    label: 'Prestataires',        Icon: Briefcase },
  { href: '/admin/moderation',   label: 'Modération',          Icon: ClipboardCheck },
  { href: '/admin/users',        label: 'Utilisateurs',        Icon: Users2 },
  { href: '/admin/categories',   label: 'Catégories',          Icon: Tags },
  { href: '/admin/leads',        label: 'Leads',               Icon: Inbox },
  { href: '/admin/demandes-concierge', label: 'Demandes concierge', Icon: Inbox },
  { href: '/admin/parametres',   label: 'Paramètres',          Icon: SlidersHorizontal },
  { href: '/admin/transactions', label: 'Transactions',        Icon: CreditCard },
  { href: '/admin/compliance',   label: 'Conformité',          Icon: ShieldCheck },
  { href: '/admin/settings',     label: 'Mon compte',          Icon: UserCog },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { signOut, isDemo } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-dvh flex bg-[#0F1923]">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-60 bg-[#0A1118] flex flex-col transition-transform duration-300',
          'md:translate-x-0 md:sticky md:top-0 md:h-dvh md:flex-none',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="px-5 py-5 border-b border-white/5">
          <OhaanaLogo variant="light" size="sm" />
          <p className="text-white/30 text-[11px] mt-1 uppercase tracking-widest">Administration</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname.includes(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-control text-sm font-medium transition-colors',
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon size={17} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-white/5 pt-3">
          <ShellAccount space="admin" />
        </div>
        <div className="px-3 pb-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-control text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={17} />
            Retour au site
          </Link>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-1 flex w-full items-center gap-3 px-3 py-2.5 rounded-control text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={17} />
            {isDemo ? 'Quitter la démo' : 'Se déconnecter'}
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0 bg-[#0F1923]">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0A1118] border-b border-white/5">
          <IconButton label="Menu" onClick={() => setOpen(true)} className="-m-1.5 text-white/60 hover:bg-white/10">
            <Menu size={22} />
          </IconButton>
          <OhaanaLogo variant="light" size="sm" />
          <div className="w-8" />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
