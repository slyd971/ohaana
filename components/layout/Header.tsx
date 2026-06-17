'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link, useRouter, usePathname } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { Globe, Heart, User, Check } from 'lucide-react'
import { OhaanaLogo } from './OhaanaLogo'

interface HeaderProps {
  transparent?: boolean
}

const LOCALES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
] as const

export function Header({ transparent = false }: HeaderProps) {
  const t = useTranslations('nav')
  const tAuth = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const [scrolled, setScrolled] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const switchLocale = (code: string) => {
    router.replace(pathname, { locale: code })
    setLangOpen(false)
  }

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
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Language switcher */}
          <div ref={langRef} className="relative">
            <button
              aria-label="Changer de langue"
              onClick={() => setLangOpen((v) => !v)}
              className={cn(
                'p-1.5 rounded-full transition-colors hover:bg-sand',
                isOpaque ? 'text-charcoal-soft' : 'text-coconut/80'
              )}
            >
              <Globe size={18} />
            </button>

            {langOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-coconut border border-mist rounded-xl shadow-lg py-1 z-50">
                {LOCALES.map(({ code, label, flag }) => (
                  <button
                    key={code}
                    onClick={() => switchLocale(code)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-charcoal-soft hover:bg-sand transition-colors"
                  >
                    <span>{flag}</span>
                    <span className="flex-1 text-left">{label}</span>
                    {locale === code && <Check size={14} className="text-deep-green" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/voyages"
            aria-label="Mes favoris"
            className={cn(
              'p-1.5 rounded-full transition-colors hover:bg-sand',
              isOpaque ? 'text-charcoal-soft' : 'text-coconut/80'
            )}
          >
            <Heart size={18} />
          </Link>
          <Link href="/login" className="ml-1">
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
