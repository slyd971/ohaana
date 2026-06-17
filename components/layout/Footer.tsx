import { Link } from '@/lib/i18n/navigation'

export function Footer() {
  return (
    <footer className="bg-deep-green text-coconut/80">
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-2xl font-display text-coconut mb-2">Ohaana</p>
            <p className="text-xs leading-relaxed mb-4">
              Expériences caribéennes authentiques,<br />
              curatées avec soin par des locaux.
            </p>
          </div>

          {/* Explorer */}
          <div>
            <h3 className="text-coconut text-xs font-semibold mb-4 uppercase tracking-widest">
              Explorer
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Chefs privés',    href: '/search?cat=chef_prive' },
                { label: 'Bien-être',       href: '/search?cat=massage' },
                { label: 'DJ & soirées',    href: '/search?cat=musique' },
                { label: 'Culture créole',  href: '/search?mood=culture' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="hover:text-coconut transition-colors text-xs">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Îles */}
          <div>
            <h3 className="text-coconut text-xs font-semibold mb-4 uppercase tracking-widest">
              Îles
            </h3>
            <ul className="space-y-2 text-xs">
              {[
                { label: 'Guadeloupe',  active: true },
                { label: 'Martinique',  active: false },
                { label: 'Saint-Martin',active: false },
                { label: 'Saint-Barth', active: false },
              ].map(({ label, active }) => (
                <li key={label} className="flex items-center gap-1.5">
                  <span className={active ? 'text-coconut/80' : 'text-coconut/40'}>{label}</span>
                  {!active && <span className="text-[9px] text-coconut/30">bientôt</span>}
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
              {[
                { label: 'Devenir prestataire', href: '/register?role=provider' },
                { label: 'Espace partenaire',   href: '/partner/dashboard' },
                { label: 'Concierge',           href: '/concierge' },
                { label: 'À propos',            href: '/about' },
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

        <div className="mt-8 pt-6 border-t border-coconut/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-coconut/40">
          <p>© {new Date().getFullYear()} Ohaana. Expériences privées dans les Caraïbes.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-coconut transition-colors">Confidentialité</Link>
            <Link href="/terms" className="hover:text-coconut transition-colors">CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
