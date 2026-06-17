import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/Button'
import {
  Bell,
  Calendar,
  ChevronRight,
  CreditCard,
  Heart,
  HelpCircle,
  Lock,
  MessageCircle,
  Settings,
  Sparkles,
  User,
} from 'lucide-react'

const LOCKED_SECTIONS = [
  { label: 'Mes voyages',   sub: 'Réservations à venir et historique',   Icon: Calendar   },
  { label: 'Mes favoris',   sub: 'Expériences sauvegardées',             Icon: Heart      },
  { label: 'Préférences',   sub: 'Îles, ambiances, services',            Icon: Sparkles   },
  { label: 'Paiement',      sub: 'Cartes et factures',                   Icon: CreditCard },
  { label: 'Notifications', sub: 'Rappels et confirmations',             Icon: Bell       },
  { label: 'Paramètres',    sub: 'Langue et compte',                     Icon: Settings   },
]

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-coconut pt-16 pb-24">
      <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">

        {/* Identity placeholder */}
        <section className="flex flex-col items-center text-center space-y-4 pt-2 pb-2">
          <div className="w-20 h-20 rounded-full bg-mist flex items-center justify-center">
            <User size={36} className="text-stone" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl text-charcoal">Votre espace Ohaana</h1>
            <p className="text-sm text-stone max-w-xs mx-auto leading-relaxed">
              Retrouvez vos réservations, favoris et préférences en un clic.
            </p>
          </div>
        </section>

        {/* CTAs */}
        <section className="space-y-2.5">
          <Link href="/register">
            <Button fullWidth>Créer un compte</Button>
          </Link>
          <Link href="/login">
            <Button fullWidth variant="outline">Se connecter</Button>
          </Link>
        </section>

        {/* Locked preview */}
        <section className="space-y-2">
          <p className="text-[11px] text-stone uppercase tracking-wider px-1">Votre espace personnel</p>
          <div className="overflow-hidden rounded-2xl border border-mist bg-surface shadow-card">
            {LOCKED_SECTIONS.map(({ label, sub, Icon }) => (
              <div
                key={label}
                className="flex items-center gap-3 border-b border-mist px-4 py-4 last:border-b-0 opacity-40 select-none cursor-default"
              >
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-sand text-stone">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-charcoal">{label}</p>
                  <p className="text-xs text-stone">{sub}</p>
                </div>
                <Lock size={14} className="text-stone flex-none" />
              </div>
            ))}
          </div>
        </section>

        {/* Free access */}
        <section className="space-y-2">
          <p className="text-[11px] text-stone uppercase tracking-wider px-1">Accessible sans compte</p>
          <div className="overflow-hidden rounded-2xl border border-mist bg-surface shadow-card">
            <a
              href="https://wa.me/0000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 border-b border-mist px-4 py-4 hover:bg-sand/50 transition-colors"
            >
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-sand text-deep-green">
                <MessageCircle size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-charcoal">Concierge Ohaana</p>
                <p className="text-xs text-stone">Parlez à un expert via WhatsApp</p>
              </div>
              <ChevronRight size={16} className="text-stone flex-none" />
            </a>
            <Link
              href="/concierge"
              className="flex items-center gap-3 px-4 py-4 hover:bg-sand/50 transition-colors"
            >
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-sand text-deep-green">
                <HelpCircle size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-charcoal">Aide & questions</p>
                <p className="text-xs text-stone">Composer un programme sur mesure</p>
              </div>
              <ChevronRight size={16} className="text-stone flex-none" />
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
