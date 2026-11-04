'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Link } from '@/lib/i18n/navigation'
import { useAuth } from '@/lib/auth/AuthProvider'
import { OhaanaLogo } from '@/components/layout/OhaanaLogo'
import { DemoBadge } from '@/components/layout/DemoBadge'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Link2, CalendarDays,
  CreditCard, Settings, LogOut, ArrowLeft, Menu, Users,
} from 'lucide-react'

const NAV = [
  { href: '/partner/dashboard',    label: 'Tableau de bord', Icon: LayoutDashboard },
  { href: '/partner/referrals',    label: 'Mes apports',     Icon: Users           },
  { href: '/partner/reservations', label: 'Réservations',    Icon: CalendarDays    },
  { href: '/partner/commissions',  label: 'Commissions',     Icon: CreditCard      },
  { href: '/partner/link',         label: 'Mon lien affilié', Icon: Link2          },
  { href: '/partner/settings',     label: 'Paramètres',      Icon: Settings        },
]

export function PartnerShell({ children }: { children: React.ReactNode }) {
  const { signOut, isDemo } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-dvh flex bg-sand">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-60 flex flex-col transition-transform duration-300',
          'md:translate-x-0 md:sticky md:top-0 md:h-dvh md:flex-none',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ background: 'linear-gradient(160deg, #1a3a5c 0%, #0f2233 100%)' }}
      >
        <div className="px-5 py-5 border-b border-coconut/10">
          <OhaanaLogo variant="light" size="sm" />
          <p className="text-coconut/40 text-[11px] mt-1 uppercase tracking-widest">Espace partenaire</p>
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
                    ? 'bg-coconut/15 text-coconut'
                    : 'text-coconut/55 hover:text-coconut hover:bg-coconut/10'
                )}
              >
                <Icon size={17} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-coconut/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-coconut/55 hover:text-coconut hover:bg-coconut/10 transition-colors"
          >
            <ArrowLeft size={17} />
            Retour au site
          </Link>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-1 flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={17} />
            {isDemo ? 'Quitter la démo' : 'Se déconnecter'}
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-coconut border-b border-mist">
          <button onClick={() => setOpen(true)} className="p-1.5 text-charcoal">
            <Menu size={22} />
          </button>
          <OhaanaLogo size="sm" />
          <div className="w-8" />
        </header>
        <main className="flex-1">{children}</main>
      </div>

      <DemoBadge />
    </div>
  )
}
