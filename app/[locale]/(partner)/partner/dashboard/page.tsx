import { Link2, TrendingUp, Wallet, Users, CalendarDays, ChevronRight, ExternalLink } from 'lucide-react'

const KPI = [
  { label: 'Réservations générées',  value: '34',       delta: '+8 ce mois',  Icon: CalendarDays, color: 'bg-turquoise/10 text-turquoise' },
  { label: 'Commissions perçues',    value: '1 870 €',  delta: '+22%',        Icon: Wallet,       color: 'bg-coral/10 text-coral'         },
  { label: 'Clients référencés',     value: '21',       delta: '+5 ce mois',  Icon: Users,        color: 'bg-sand text-deep-green'        },
  { label: 'Taux de conversion',     value: '18 %',     delta: '+3 pts',      Icon: TrendingUp,   color: 'bg-deep-green/10 text-deep-green'},
]

const RECENT = [
  { client: 'Marie Fontaine',    service: 'Dîner de chef — 4 pers.',      date: 'Ven 13 juin', commission: '54 €',  status: 'payé'      },
  { client: 'Thomas Baudoin',    service: 'Massage balinais couple',       date: 'Sam 14 juin', commission: '24 €',  status: 'payé'      },
  { client: 'Laura & Jim Baker', service: 'Cours de cocktails créoles',    date: 'Dim 15 juin', commission: '16 €',  status: 'en attente'},
  { client: 'Nathalie Girard',   service: 'Shooting photo coucher soleil', date: 'Mar 17 juin', commission: '44 €',  status: 'en attente'},
]

const STATUS_STYLE: Record<string, string> = {
  'payé':       'bg-turquoise/10 text-turquoise',
  'en attente': 'bg-sand text-stone',
}

export default function PartnerDashboard() {
  return (
    <div className="p-5 md:p-8 space-y-8 max-w-5xl">

      <div>
        <h1 className="text-2xl font-display text-deep-green">Bonjour, Isabelle 👋</h1>
        <p className="text-stone text-sm mt-0.5">Conciergerie Les Îles Dorées — Guadeloupe</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI.map(({ label, value, delta, Icon, color }) => (
          <div key={label} className="bg-coconut rounded-2xl p-4 border border-mist shadow-sm">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-display text-charcoal">{value}</p>
            <p className="text-xs text-stone mt-0.5">{label}</p>
            {delta && <p className="text-xs text-turquoise font-medium mt-1">{delta}</p>}
          </div>
        ))}
      </div>

      {/* Lien affilié */}
      <div className="bg-coconut rounded-2xl border border-mist p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Link2 size={16} className="text-deep-green" />
          <h2 className="text-sm font-semibold text-charcoal">Mon lien affilié</h2>
        </div>
        <div className="flex items-center gap-2 bg-sand rounded-xl px-4 py-3">
          <span className="text-sm text-stone flex-1 truncate font-mono">ohaana.com/?ref=iles-dorees</span>
          <button
            type="button"
            className="text-xs bg-deep-green text-coconut px-3 py-1.5 rounded-full font-medium hover:bg-deep-green/90 transition-colors flex-none"
          >
            Copier
          </button>
        </div>
        <p className="text-xs text-stone">
          Partagez ce lien à vos clients. Vous touchez <span className="font-semibold text-charcoal">12 %</span> de commission sur chaque réservation générée.
        </p>
      </div>

      {/* Dernières réservations générées */}
      <div className="bg-coconut rounded-2xl border border-mist overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-mist">
          <h2 className="text-sm font-semibold text-charcoal">Réservations récentes</h2>
          <a href="#" className="text-xs text-deep-green flex items-center gap-1 hover:underline">
            Tout voir <ExternalLink size={11} />
          </a>
        </div>
        <div className="divide-y divide-mist">
          {RECENT.map((r) => (
            <div key={r.client} className="flex items-center gap-3 px-5 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal truncate">{r.client}</p>
                <p className="text-xs text-stone truncate">{r.service} · {r.date}</p>
              </div>
              <div className="text-right flex-none space-y-1">
                <p className="text-sm font-semibold text-charcoal">{r.commission}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[r.status]}`}>
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA programme partenaire */}
      <div
        className="rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-5"
        style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #0f2233 100%)' }}
      >
        <div className="flex-1 space-y-1">
          <p className="text-coconut font-semibold">Programme partenaire Ohaana</p>
          <p className="text-coconut/60 text-sm">
            Accédez aux offres exclusives, aux supports de vente et à votre gestionnaire de compte dédié.
          </p>
        </div>
        <a
          href="mailto:partenaires@ohaana.com"
          className="flex-none inline-flex items-center gap-2 bg-coconut text-deep-green px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-sand transition-colors"
        >
          Contacter mon gestionnaire
          <ChevronRight size={14} />
        </a>
      </div>

    </div>
  )
}
