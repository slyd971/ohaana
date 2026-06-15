import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Bell,
  ChevronRight,
  CreditCard,
  Heart,
  HelpCircle,
  LogIn,
  MapPin,
  MessageCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react'

const PROFILE_ACTIONS = [
  { label: 'Préférences de voyage', sub: 'Îles, ambiances, services favoris', Icon: Sparkles, href: '/onboarding' },
  { label: 'Favoris', sub: 'Expériences sauvegardées', Icon: Heart, href: '/voyages' },
  { label: 'Moyens de paiement', sub: 'Cartes et factures', Icon: CreditCard, href: '/profile' },
  { label: 'Notifications', sub: 'Rappels et confirmations', Icon: Bell, href: '/profile' },
  { label: 'Sécurité', sub: 'Connexion et confidentialité', Icon: ShieldCheck, href: '/profile' },
  { label: 'Paramètres', sub: 'Langue et compte', Icon: Settings, href: '/profile' },
]

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-coconut pt-16">
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        <section className="rounded-2xl border border-mist bg-surface p-5 shadow-card">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-deep-green text-xl font-semibold text-coconut">
              O
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl text-charcoal">Mon profil</h1>
                <Badge variant="green">Démo</Badge>
              </div>
              <p className="mt-1 text-sm text-stone">
                Connectez-vous pour retrouver vos informations, vos voyages et vos demandes sur mesure.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-stone">
                <MapPin size={13} />
                Guadeloupe · Martinique
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-mist pt-4 text-center">
            <div>
              <p className="text-lg font-semibold text-charcoal">2</p>
              <p className="text-[11px] text-stone">Voyages</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-charcoal">2</p>
              <p className="text-[11px] text-stone">Favoris</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-charcoal">0</p>
              <p className="text-[11px] text-stone">Demandes</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Link href="/login">
            <Button fullWidth>
              <LogIn size={16} />
              Connexion
            </Button>
          </Link>
          <Link href="/concierge">
            <Button fullWidth variant="outline">
              <MessageCircle size={16} />
              Concierge
            </Button>
          </Link>
        </section>

        <section className="overflow-hidden rounded-2xl border border-mist bg-surface shadow-card">
          {PROFILE_ACTIONS.map(({ label, sub, Icon, href }, index) => (
            <Link
              key={`${label}-${index}`}
              href={href}
              className="flex items-center gap-3 border-b border-mist px-4 py-4 last:border-b-0 hover:bg-sand/50 transition-colors"
            >
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-sand text-deep-green">
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-charcoal">{label}</p>
                <p className="text-xs text-stone">{sub}</p>
              </div>
              <ChevronRight size={16} className="text-stone" />
            </Link>
          ))}
        </section>

        <section className="rounded-2xl border border-mist bg-surface p-4 shadow-card">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-deep-green/10 text-deep-green">
              <HelpCircle size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-medium text-charcoal">Besoin d&apos;aide ?</h2>
              <p className="mt-1 text-xs leading-relaxed text-stone">
                Pour le prototype, les informations du profil sont simulées. Les données personnelles seront activées avec l&apos;authentification Supabase.
              </p>
            </div>
          </div>
        </section>

        <div className="flex justify-center pb-4">
          <User size={18} className="text-stone" />
        </div>
      </div>
    </div>
  )
}
