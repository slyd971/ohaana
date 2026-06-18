'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="bg-deep-green text-coconut/80">
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-2xl font-display text-coconut mb-2">Ohaana</p>
            <p className="text-xs leading-relaxed mb-4">{t('tagline')}</p>
          </div>

          {/* Explorer */}
          <div>
            <h3 className="text-coconut text-xs font-semibold mb-4 uppercase tracking-widest">
              {t('exploreTitle')}
            </h3>
            <ul className="space-y-2 text-sm">
              {([
                { key: 'privateChefs', href: '/search?cat=chef_prive' },
                { key: 'wellness',     href: '/search?cat=massage' },
                { key: 'dj',          href: '/search?cat=musique' },
                { key: 'culture',     href: '/search?mood=culture' },
              ] as const).map(({ key, href }) => (
                <li key={key}>
                  <Link href={href} className="hover:text-coconut transition-colors text-xs">
                    {t(`links.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Îles */}
          <div>
            <h3 className="text-coconut text-xs font-semibold mb-4 uppercase tracking-widest">
              {t('islandsTitle')}
            </h3>
            <ul className="space-y-2 text-xs">
              {[
                { label: 'Guadeloupe',   active: true },
                { label: 'Martinique',   active: false },
                { label: 'Saint-Martin', active: false },
                { label: 'Saint-Barth',  active: false },
              ].map(({ label, active }) => (
                <li key={label} className="flex items-center gap-1.5">
                  <span className={active ? 'text-coconut/80' : 'text-coconut/40'}>{label}</span>
                  {!active && <span className="text-[9px] text-coconut/30">{t('soon')}</span>}
                </li>
              ))}
            </ul>
          </div>

          {/* Ohaana */}
          <div>
            <h3 className="text-coconut text-xs font-semibold mb-4 uppercase tracking-widest">
              Ohaana
            </h3>
            <ul className="space-y-2 text-xs">
              {([
                { key: 'becomeProvider', href: '/register?role=provider' },
                { key: 'partnerSpace',   href: '/partner/dashboard' },
                { key: 'concierge',      href: '/concierge' },
                { key: 'about',          href: '/about' },
              ] as const).map(({ key, href }) => (
                <li key={key}>
                  <Link href={href} className="hover:text-coconut transition-colors">
                    {t(`links.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-coconut/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-coconut/40">
          <p>© {new Date().getFullYear()} Ohaana. {t('copyright')}</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-coconut transition-colors">{t('privacy')}</Link>
            <Link href="/terms" className="hover:text-coconut transition-colors">{t('terms')}</Link>
            <LanguageSwitcher variant="footer" />
          </div>
        </div>
      </div>
    </footer>
  )
}
