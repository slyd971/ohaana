import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'

export function Footer() {
  const t = useTranslations('common')

  return (
    <footer className="hidden md:block bg-deep-green text-coconut/80 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-2xl font-display text-coconut mb-3">Ohaana</p>
            <p className="text-sm leading-relaxed">
              Expériences caribéennes uniques, curatées avec soin.
            </p>
          </div>

          {/* Explorer */}
          <div>
            <h3 className="text-coconut text-sm font-semibold mb-4 uppercase tracking-widest">
              Explorer
            </h3>
            <ul className="space-y-2 text-sm">
              {['Chefs privés', 'Bien-être', 'Aventures', 'Culture'].map((item) => (
                <li key={item}>
                  <Link href="/search" className="hover:text-coconut transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Îles */}
          <div>
            <h3 className="text-coconut text-sm font-semibold mb-4 uppercase tracking-widest">
              Îles
            </h3>
            <ul className="space-y-2 text-sm">
              {['Guadeloupe', 'Martinique', 'Saint-Martin', 'Saint-Barth'].map((island) => (
                <li key={island}>
                  <span className="cursor-default">{island}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ohaana */}
          <div>
            <h3 className="text-coconut text-sm font-semibold mb-4 uppercase tracking-widest">
              Ohaana
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Devenir prestataire', href: '/register?role=provider' },
                { label: 'Partenaires hôtels', href: '/register?role=hotel' },
                { label: 'Concierge', href: '/concierge' },
                { label: 'À propos', href: '/about' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="hover:text-coconut transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-coconut/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-coconut/50">
          <p>© {new Date().getFullYear()} Ohaana. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-coconut transition-colors">Confidentialité</Link>
            <Link href="/terms" className="hover:text-coconut transition-colors">CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
