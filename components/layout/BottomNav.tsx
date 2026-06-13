'use client'

import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Home, Search, CalendarDays, User, MessageCircle } from 'lucide-react'

const navItems = [
  { key: 'home',     href: '/',          Icon: Home },
  { key: 'search',   href: '/search',    Icon: Search },
  { key: 'bookings', href: '/trips',     Icon: CalendarDays },
  { key: 'concierge',href: '/concierge', Icon: MessageCircle },
  { key: 'profile',  href: '/profile',   Icon: User },
] as const

export function BottomNav() {
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'fixed bottom-0 inset-x-0 z-50 md:hidden',
        'bg-coconut/95 backdrop-blur-md border-t border-mist',
        'pb-safe'
      )}
      aria-label="Navigation principale"
    >
      <ul className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ key, href, Icon }) => {
          const active = pathname.endsWith(href) || (href !== '/' && pathname.includes(href))

          return (
            <li key={key} className="flex-1">
              <Link
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-colors',
                  active ? 'text-deep-green' : 'text-stone hover:text-charcoal-soft'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <div className="relative">
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 -m-1.5 rounded-xl bg-deep-green/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <Icon size={22} strokeWidth={active ? 2 : 1.5} className="relative" />
                </div>
                <span className="text-[10px] font-medium leading-none">{t(key)}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
