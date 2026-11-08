'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { LayoutDashboard, LogOut, User as UserIcon, CalendarDays } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthProvider'
import { ROLE_HOME } from '@/lib/auth/types'
import { cn } from '@/lib/utils'

interface UserMenuProps {
  opaque: boolean
}

export function UserMenu({ opaque }: UserMenuProps) {
  const t = useTranslations('nav')
  const tAuth = useTranslations('auth')
  const { user, role, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  if (!user || !role) return null

  const initial = (user.fullName ?? user.email).trim().charAt(0).toUpperCase() || '?'
  const showDashboard = role !== 'tourist'

  const itemClass = 'flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-charcoal hover:bg-sand transition-colors text-left'

  return (
    <div ref={ref} className="relative ml-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('account')}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors',
          opaque ? 'bg-deep-green text-coconut hover:bg-deep-green/90' : 'bg-coconut/20 text-coconut hover:bg-coconut/30'
        )}
      >
        {initial}
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-11 w-56 overflow-hidden rounded-card border border-mist bg-surface shadow-lg">
          <div className="border-b border-mist px-3 py-2.5">
            <p className="truncate text-sm font-medium text-charcoal">{user.fullName ?? user.email}</p>
            {user.fullName && <p className="truncate text-xs text-stone">{user.email}</p>}
          </div>
          {showDashboard && (
            <Link href={ROLE_HOME[role]} role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
              <LayoutDashboard size={15} /> {t('dashboard')}
            </Link>
          )}
          <Link href="/voyages" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
            <CalendarDays size={15} /> {t('bookings')}
          </Link>
          <Link href="/profile" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
            <UserIcon size={15} /> {t('profile')}
          </Link>
          <button type="button" role="menuitem" onClick={() => { setOpen(false); void signOut() }} className={cn(itemClass, 'border-t border-mist text-coral-text')}>
            <LogOut size={15} /> {tAuth('logout')}
          </button>
        </div>
      )}
    </div>
  )
}
