'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'

const LOCALES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
] as const

interface LanguageSwitcherProps {
  variant?: 'header' | 'footer'
  className?: string
}

export function LanguageSwitcher({ variant = 'header', className }: LanguageSwitcherProps) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (code: string) => {
    router.replace(pathname, { locale: code })
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
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
      >
        {LOCALES.map(({ code, label }) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </select>
    )
  }

  // Header variant — compact "FR · EN" text toggle
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {LOCALES.map(({ code }, i) => (
        <span key={code} className="flex items-center gap-1">
          {i > 0 && <span className="text-charcoal-soft/25 text-xs">·</span>}
          <button
            onClick={() => switchLocale(code)}
            className={cn(
              'text-[11px] font-medium uppercase tracking-wide transition-colors',
              locale === code
                ? 'text-deep-green'
                : 'text-charcoal-soft/40 hover:text-charcoal-soft/70'
            )}
          >
            {code}
          </button>
        </span>
      ))}
    </div>
  )
}
