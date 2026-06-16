import { CalendarDays, TrendingUp, Wallet, Briefcase, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const KPI = [
  { label: 'Réservations ce mois', value: '12', delta: '+3 vs mois dernier', Icon: CalendarDays, color: 'bg-turquoise/10 text-turquoise' },
  { label: 'Revenus nets', value: '4 320 €', delta: '+18%', Icon: TrendingUp, color: 'bg-coral/10 text-coral' },
  { label: 'Panier moyen', value: '360 €', delta: '+12%', Icon: Wallet, color: 'bg-sand text-deep-green' },
  { label: 'Services actifs', value: '3', delta: '', Icon: Briefcase, color: 'bg-deep-green/10 text-deep-green' },
]

const UPCOMING = [
  { id: 1, client: 'Sophie Laurent', service: 'Chef à domicile — 4 pers.', date: 'Ven 14 juin · 19 h 00', status: 'confirmed' },
  { id: 2, client: 'Marcus Williams', service: 'Cours de plongée débutant', date: 'Sam 15 juin · 09 h 00', status: 'confirmed' },
  { id: 3, client: 'Isabelle Moreau', service: 'Chef à domicile — 6 pers.', date: 'Dim 16 juin · 20 h 00', status: 'pending' },
]

const REQUESTS = [
  { id: 1, client: 'Jean-Paul Rivière', service: 'Dégustation rhum arrangé', date: 'Mer 18 juin', budget: '180 €' },
  { id: 2, client: 'Emma Dubois',      service: 'Chef fusion créole · 8 pers.', date: 'Sam 21 juin', budget: '420 €' },
]

export default function ProviderDashboard() {
  return (
    <div className="p-5 md:p-8 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-display text-deep-green">Bonjour, Jean-Marc 👋</h1>
        <p className="text-stone text-sm mt-0.5">Voici un résumé de votre activité ce mois-ci.</p>
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming */}
        <div className="bg-coconut rounded-2xl border border-mist shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-mist flex items-center gap-2">
            <Clock size={15} className="text-deep-green" />
            <h2 className="text-sm font-semibold text-charcoal">Prochaines prestations</h2>
          </div>
          <ul className="divide-y divide-mist">
            {UPCOMING.map(({ id, client, service, date, status }) => (
              <li key={id} className="px-5 py-3.5 flex items-start gap-3">
                <div className="mt-0.5">
                  {status === 'confirmed'
                    ? <CheckCircle size={15} className="text-turquoise" />
                    : <AlertCircle size={15} className="text-[#F5A623]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal truncate">{client}</p>
                  <p className="text-xs text-stone truncate">{service}</p>
                  <p className="text-xs text-deep-green/70 mt-0.5">{date}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Pending requests */}
        <div className="bg-coconut rounded-2xl border border-mist shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-mist flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-coral" />
              <h2 className="text-sm font-semibold text-charcoal">Demandes en attente</h2>
            </div>
            <span className="text-xs bg-coral/10 text-coral rounded-full px-2 py-0.5 font-medium">{REQUESTS.length} nouvelles</span>
          </div>
          <ul className="divide-y divide-mist">
            {REQUESTS.map(({ id, client, service, date, budget }) => (
              <li key={id} className="px-5 py-3.5 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal truncate">{client}</p>
                  <p className="text-xs text-stone truncate">{service}</p>
                  <p className="text-xs text-stone/60 mt-0.5">{date}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-deep-green">{budget}</p>
                  <div className="flex gap-1.5 mt-1.5">
                    <button className="text-xs bg-deep-green text-coconut px-2.5 py-1 rounded-lg hover:bg-deep-green/90 transition-colors">
                      Accepter
                    </button>
                    <button className="text-xs border border-mist text-stone px-2.5 py-1 rounded-lg hover:bg-sand transition-colors">
                      Refuser
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
