'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { Heart, User } from 'lucide-react'
import { OhaanaLogo } from './OhaanaLogo'
import { LanguageSwitcher } from './LanguageSwitcher'
import { UserMenu } from './UserMenu'
import { useAuth } from '@/lib/auth/AuthProvider'
import { providerTarget } from '@/lib/auth/provider-link'

interface HeaderProps {
  transparent?: boolean
}

export function Header({ transparent = false }: HeaderProps) {
  const t = useTranslations('nav')
  const tAuth = useTranslations('auth')
  const { isLoggedIn, loading, isProvider, isAdmin } = useAuth()
  const provider = providerTarget({ isLoggedIn, isProvider, isAdmin })
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isOpaque = !transparent || scrolled

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        !isOpaque
          ? 'bg-transparent'
          : scrolled
            ? 'bg-coconut/95 backdrop-blur-md border-b border-mist shadow-sm'
            : 'bg-coconut'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="focus-visible:outline-none">
          <OhaanaLogo variant={isOpaque ? 'dark' : 'light'} size="md" />
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {([
            { key: 'search', href: '/search', external: false },
            { key: 'concierge', href: '/concierge', external: false },
            { key: 'becomeProvider', href: provider.href, external: provider.external },
          ] as const).map(({ key, href, external }) => {
            const cls = cn(
              'transition-colors hover:text-deep-green',
              isOpaque ? 'text-charcoal-soft' : 'text-coconut/80 hover:text-coconut'
            )
            return external ? (
              <a key={key} href={href} className={cls}>{t(key)}</a>
            ) : (
              <Link key={key} href={href} className={cls}>{t(key)}</Link>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="header" />

          <Link
            href="/voyages"
            aria-label="Mes favoris"
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-sand',
              isOpaque ? 'text-charcoal-soft' : 'text-coconut/80'
            )}
          >
            <Heart size={18} />
          </Link>
          {isLoggedIn ? (
            <UserMenu opaque={isOpaque} />
          ) : (
            <Link href="/login" className={cn('ml-1', loading && 'invisible')}>
              <Button
                variant={isOpaque ? 'ghost' : 'outline'}
                size="sm"
                className={cn('min-h-11 min-w-11', !isOpaque && 'border-coconut/40 text-coconut hover:bg-coconut/10')}
              >
                <User size={16} />
                <span className="hidden sm:inline">{tAuth('login')}</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
