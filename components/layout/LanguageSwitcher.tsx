'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import { Globe } from 'lucide-react'

const LOCALES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
] as const

interface LanguageSwitcherProps {
  variant?: 'header' | 'footer'
  className?: string
}

export function LanguageSwitcher({ variant = 'header', className }: LanguageSwitcherProps) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const switchLocale = (code: string) => {
    router.replace(pathname, { locale: code })
    setOpen(false)
  }

  if (variant === 'footer') {
    return (
      <select
        value={locale}
        onChange={(e) => switchLocale(e.target.value)}
        className={cn(
          'bg-white text-charcoal-soft text-xs px-3 py-1.5 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-coconut/40 border-0 appearance-none pr-6',
          className
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 6px center',
        }}
      >
        {LOCALES.map(({ code, label, flag }) => (
          <option key={code} value={code}>{flag} {label}</option>
        ))}
      </select>
    )
  }

  // Header variant — globe + dropdown compact
  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Changer de langue"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-mist/70 bg-coconut/75 text-deep-green shadow-sm backdrop-blur-sm transition-colors hover:border-deep-green/30 hover:bg-coconut"
      >
        <Globe size={15} aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[80] mt-1.5 min-w-[7rem] overflow-hidden rounded-lg border border-mist bg-coconut/95 py-0.5 shadow-elevated backdrop-blur-md">
          {LOCALES.map(({ code, label, flag }) => (
            <button
              key={code}
              type="button"
              onClick={() => switchLocale(code)}
              aria-label={`Passer en ${label}`}
              className={cn(
                'flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left text-[11px] font-medium uppercase tracking-wide transition-colors',
                locale === code
                  ? 'bg-sand text-deep-green'
                  : 'text-charcoal-soft/60 hover:bg-sand/60 hover:text-charcoal'
              )}
            >
              <span aria-hidden="true" className="text-xs leading-none">{flag}</span>
              {code}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
