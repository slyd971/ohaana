'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useAuth } from '@/lib/auth/AuthProvider'
import { ROLE_HOME } from '@/lib/auth/types'
import { providerTarget } from '@/lib/auth/provider-link'

// Libellés des pages juridiques ajoutées hors des fichiers de messages (fr.json est la source de vérité, non modifiée ici).
const EXTRA_LINKS = {
  legal: { fr: 'Mentions légales', en: 'Legal notice', es: 'Aviso legal' },
  cookies: { fr: 'Cookies', en: 'Cookies', es: 'Cookies' },
} as const

export function Footer() {
  const t = useTranslations('footer')
  const current = useLocale()
  const locale = (current === 'en' || current === 'es' ? current : 'fr') as 'fr' | 'en' | 'es'
  const { isLoggedIn, isProvider, isPartner, isAdmin, isDemo } = useAuth()
  const provider = providerTarget({ isLoggedIn, isProvider, isAdmin })
  // The partner space is private: guests and other roles are sent to sign-in.
  const partnerHref = isPartner || isAdmin || isDemo ? ROLE_HOME.partner : '/login'

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
                  <span className={active ? 'text-coconut/80' : 'text-coconut/70'}>{label}</span>
                  {!active && <span className="text-xs text-coconut/70">{t('soon')}</span>}
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
                { key: 'becomeProvider', href: provider.href, external: provider.external },
                { key: 'partnerSpace',   href: partnerHref, external: false },
                { key: 'concierge',      href: '/concierge', external: false },
                { key: 'about',          href: '/about', external: false },
              ] as const).map(({ key, href, external }) => (
                <li key={key}>
                  {external ? (
                    <a href={href} className="hover:text-coconut transition-colors">{t(`links.${key}`)}</a>
                  ) : (
                    <Link href={href} className="hover:text-coconut transition-colors">{t(`links.${key}`)}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-coconut/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-coconut/70">
          <p>© {new Date().getFullYear()} Ohaana. {t('copyright')}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link href="/privacy" className="hover:text-coconut transition-colors">{t('privacy')}</Link>
            <Link href="/terms" className="hover:text-coconut transition-colors">{t('terms')}</Link>
            <Link href="/legal" className="hover:text-coconut transition-colors">{EXTRA_LINKS.legal[locale]}</Link>
            <Link href="/cookies" className="hover:text-coconut transition-colors">{EXTRA_LINKS.cookies[locale]}</Link>
            <LanguageSwitcher variant="footer" />
          </div>
        </div>
      </div>
    </footer>
  )
}
