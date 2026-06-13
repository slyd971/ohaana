'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { OhaanaLogo } from '@/components/layout/OhaanaLogo'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users2, Briefcase,
  CreditCard, ShieldCheck, LogOut, Menu,
} from 'lucide-react'

const NAV = [
  { href: '/admin/dashboard',    label: 'Vue globale',         Icon: LayoutDashboard },
  { href: '/admin/providers',    label: 'Prestataires',        Icon: Briefcase },
  { href: '/admin/users',        label: 'Utilisateurs',        Icon: Users2 },
  { href: '/admin/transactions', label: 'Transactions',        Icon: CreditCard },
  { href: '/admin/compliance',   label: 'Conformité',          Icon: ShieldCheck },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-dvh flex bg-[#0F1923]">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-60 bg-[#0A1118] flex flex-col transition-transform duration-300',
          'md:translate-x-0 md:static',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="px-5 py-5 border-b border-white/5">
          <OhaanaLogo variant="light" size="sm" />
          <p className="text-white/30 text-[11px] mt-1 uppercase tracking-widest">Administration</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname.includes(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
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

        <div className="px-3 py-4 border-t border-white/5">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={17} />
            Retour au site
          </Link>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0 bg-[#0F1923]">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0A1118] border-b border-white/5">
          <button onClick={() => setOpen(true)} className="p-1.5 text-white/60">
            <Menu size={22} />
          </button>
          <OhaanaLogo variant="light" size="sm" />
          <div className="w-8" />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
