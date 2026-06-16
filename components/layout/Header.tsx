'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { Globe, Handshake, User } from 'lucide-react'
import { OhaanaLogo } from './OhaanaLogo'

interface HeaderProps {
  transparent?: boolean
}

export function Header({ transparent = false }: HeaderProps) {
  const t = useTranslations('nav')
  const tAuth = useTranslations('auth')
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
        isOpaque
          ? 'bg-coconut/95 backdrop-blur-md border-b border-mist shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="focus-visible:outline-none">
          <OhaanaLogo variant={isOpaque ? 'dark' : 'light'} size="md" />
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {['home', 'search'].map((key) => (
            <Link
              key={key}
              href={key === 'home' ? '/' : `/${key}`}
              className={cn(
                'transition-colors hover:text-deep-green',
                isOpaque ? 'text-charcoal-soft' : 'text-coconut/80 hover:text-coconut'
              )}
            >
              {t(key as 'home' | 'search')}
            </Link>
          ))}
          <Link
            href="/register?role=provider"
            className={cn(
              'inline-flex items-center gap-1.5 transition-colors hover:text-deep-green',
              isOpaque ? 'text-charcoal-soft' : 'text-coconut/80 hover:text-coconut'
            )}
          >
            <Handshake size={15} />
            Devenir partenaire
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            aria-label="Changer de langue"
            className={cn(
              'p-2 rounded-full transition-colors hover:bg-sand',
              isOpaque ? 'text-charcoal-soft' : 'text-coconut/80'
            )}
          >
            <Globe size={18} />
          </button>
          <Link href="/login">
            <Button
              variant={isOpaque ? 'ghost' : 'outline'}
              size="sm"
              className={!isOpaque ? 'border-coconut/40 text-coconut hover:bg-coconut/10' : ''}
            >
              <User size={16} />
              <span className="hidden sm:inline">{tAuth('login')}</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
