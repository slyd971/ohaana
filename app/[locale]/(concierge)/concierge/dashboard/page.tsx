import { MessageSquare, Users2, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const KPI = [
  { label: 'Demandes actives', value: '8', delta: '3 urgentes', Icon: MessageSquare, color: 'bg-coral/10 text-coral' },
  { label: 'Clients suivis', value: '24', delta: '+4 ce mois', Icon: Users2, color: 'bg-turquoise/10 text-turquoise' },
  { label: 'Commissions du mois', value: '1 260 €', delta: '+22%', Icon: TrendingUp, color: 'bg-deep-green/10 text-deep-green' },
  { label: 'Taux de satisfaction', value: '98%', delta: '47 retours', Icon: CheckCircle, color: 'bg-[#F5A623]/10 text-[#F5A623]' },
]

const ACTIVE_REQUESTS = [
  { id: 1, client: 'Famille Bertrand', need: 'Chef privé + excursion catamaran — 6 pers.', deadline: 'Pour demain', priority: 'high' },
  { id: 2, client: 'Thomas Renaud', need: 'Transfert aéroport + villa 4 nuits', deadline: 'Dans 2 jours', priority: 'medium' },
  { id: 3, client: 'Amina Diallo', need: 'Soins spa en chambre — couple', deadline: 'Dans 3 jours', priority: 'low' },
  { id: 4, client: 'Marco & Julia', need: 'Dîner romantique sur la plage', deadline: 'Sam 15 juin', priority: 'medium' },
]

const RECENT_CLIENTS = [
  { id: 1, name: 'Sophie Laurent', stay: 'La Toubana · 7 nuits', avatar: 'SL', commission: '320 €' },
  { id: 2, name: 'Marcus Williams', stay: 'Habitation Beauséjour · 5 nuits', avatar: 'MW', commission: '215 €' },
  { id: 3, name: 'Claire Fontaine', stay: 'Cap Est · 4 nuits', avatar: 'CF', commission: '180 €' },
]

const priorityBadge: Record<string, string> = {
  high: 'bg-coral/10 text-coral',
  medium: 'bg-[#F5A623]/10 text-[#F5A623]',
  low: 'bg-turquoise/10 text-turquoise',
}
const priorityLabel: Record<string, string> = {
  high: 'Urgent',
  medium: 'Moyen',
  low: 'Normal',
}

export default function ConciergeDashboard() {
  return (
    <div className="p-5 md:p-8 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-display text-deep-green">Bonjour, Marie 👋</h1>
        <p className="text-stone text-sm mt-0.5">8 demandes en attente de traitement.</p>
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

      <div className="grid md:grid-cols-3 gap-6">
        {/* Active requests */}
        <div className="md:col-span-2 bg-coconut rounded-2xl border border-mist shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-mist flex items-center gap-2">
            <AlertCircle size={15} className="text-coral" />
            <h2 className="text-sm font-semibold text-charcoal">Demandes actives</h2>
          </div>
          <ul className="divide-y divide-mist">
            {ACTIVE_REQUESTS.map(({ id, client, need, deadline, priority }) => (
              <li key={id} className="px-5 py-3.5 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-charcoal">{client}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityBadge[priority]}`}>
                      {priorityLabel[priority]}
                    </span>
                  </div>
                  <p className="text-xs text-stone mt-0.5 truncate">{need}</p>
                  <p className="text-xs text-deep-green/60 mt-0.5 flex items-center gap-1">
                    <Clock size={11} />
                    {deadline}
                  </p>
                </div>
                <button className="shrink-0 text-xs bg-deep-green text-coconut px-3 py-1.5 rounded-lg hover:bg-deep-green/90 transition-colors mt-0.5">
                  Traiter
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent clients */}
        <div className="bg-coconut rounded-2xl border border-mist shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-mist flex items-center gap-2">
            <Users2 size={15} className="text-turquoise" />
            <h2 className="text-sm font-semibold text-charcoal">Clients récents</h2>
          </div>
          <ul className="divide-y divide-mist">
            {RECENT_CLIENTS.map(({ id, name, stay, avatar, commission }) => (
              <li key={id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-deep-green/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-deep-green">{avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal truncate">{name}</p>
                  <p className="text-xs text-stone truncate">{stay}</p>
                </div>
                <p className="text-sm font-semibold text-turquoise shrink-0">{commission}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
