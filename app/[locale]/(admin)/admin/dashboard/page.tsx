import { Users2, Briefcase, CreditCard, TrendingUp, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

const KPI = [
  { label: 'Utilisateurs total', value: '1 247', delta: '+48 ce mois', Icon: Users2, color: 'text-blue-400' },
  { label: 'Prestataires actifs', value: '63', delta: '5 en attente', Icon: Briefcase, color: 'text-turquoise' },
  { label: 'Volume transactions', value: '87 400 €', delta: 'Juin 2026', Icon: CreditCard, color: 'text-[#F5A623]' },
  { label: 'Croissance GMV', value: '+34%', delta: 'vs mai 2026', Icon: TrendingUp, color: 'text-green-400' },
]

const PENDING_PROVIDERS = [
  { id: 1, name: 'Christophe Belmar', category: 'Chef cuisinier', location: 'Martinique', submitted: 'Il y a 2 jours', docs: true },
  { id: 2, name: 'Sandrine Dubé', category: 'Massage & bien-être', location: 'Guadeloupe', submitted: 'Il y a 3 jours', docs: true },
  { id: 3, name: 'Yves Montrose', category: 'Guide nautique', location: 'Saint-Martin', submitted: 'Il y a 4 jours', docs: false },
  { id: 4, name: 'Lucie Cézaire', category: 'Coiffure & beauté', location: 'Martinique', submitted: 'Il y a 5 jours', docs: true },
  { id: 5, name: 'Patrick Léger', category: 'Photographie', location: 'Guadeloupe', submitted: 'Il y a 7 jours', docs: false },
]

const TRANSACTIONS = [
  { id: 1, from: 'Sophie Laurent', to: 'Jean-Marc Chef', amount: '380 €', commission: '38 €', date: '13 juin 2026', status: 'completed' },
  { id: 2, from: 'Marcus Williams', to: 'Dive Martinique', amount: '180 €', commission: '18 €', date: '12 juin 2026', status: 'completed' },
  { id: 3, from: 'Isabelle Moreau', to: 'Bella Coiffure', amount: '95 €', commission: '9.50 €', date: '12 juin 2026', status: 'pending' },
  { id: 4, from: 'Thomas Renaud', to: 'Sail Caribe', amount: '520 €', commission: '52 €', date: '11 juin 2026', status: 'completed' },
]

export default function AdminDashboard() {
  return (
    <div className="p-5 md:p-8 space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-display text-white">Administration Ohaana</h1>
        <p className="text-white/40 text-sm mt-0.5">Vue globale plateforme · Juin 2026</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI.map(({ label, value, delta, Icon, color }) => (
          <div key={label} className="bg-white/5 rounded-2xl p-4 border border-white/8 backdrop-blur-sm">
            <Icon size={18} className={`mb-3 ${color}`} />
            <p className="text-2xl font-display text-white">{value}</p>
            <p className="text-xs text-white/40 mt-0.5">{label}</p>
            {delta && <p className="text-xs text-green-400/80 font-medium mt-1">{delta}</p>}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pending provider approvals */}
        <div className="bg-white/5 rounded-2xl border border-white/8 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-[#F5A623]" />
              <h2 className="text-sm font-semibold text-white">Prestataires à valider</h2>
            </div>
            <span className="text-xs bg-[#F5A623]/15 text-[#F5A623] rounded-full px-2 py-0.5 font-medium">5 en attente</span>
          </div>
          <ul className="divide-y divide-white/5">
            {PENDING_PROVIDERS.map(({ id, name, category, location, submitted, docs }) => (
              <li key={id} className="px-5 py-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center shrink-0 text-white/60 text-xs font-semibold">
                  {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-white truncate">{name}</p>
                    {!docs && <AlertTriangle size={11} className="text-coral shrink-0" />}
                  </div>
                  <p className="text-xs text-white/40">{category} · {location}</p>
                  <p className="text-xs text-white/25 flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> {submitted}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0 mt-0.5">
                  <button className="p-1.5 bg-green-500/15 text-green-400 rounded-lg hover:bg-green-500/25 transition-colors" title="Approuver">
                    <CheckCircle size={14} />
                  </button>
                  <button className="p-1.5 bg-coral/15 text-coral rounded-lg hover:bg-coral/25 transition-colors" title="Rejeter">
                    <XCircle size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent transactions */}
        <div className="bg-white/5 rounded-2xl border border-white/8 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8 flex items-center gap-2">
            <CreditCard size={15} className="text-[#F5A623]" />
            <h2 className="text-sm font-semibold text-white">Transactions récentes</h2>
          </div>
          <ul className="divide-y divide-white/5">
            {TRANSACTIONS.map(({ id, from, to, amount, commission, date, status }) => (
              <li key={id} className="px-5 py-3.5">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-medium text-white truncate flex-1">{from} → {to}</p>
                  <p className="text-sm font-semibold text-white ml-2">{amount}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/35">{date} · Commission: {commission}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${status === 'completed' ? 'bg-green-500/15 text-green-400' : 'bg-[#F5A623]/15 text-[#F5A623]'}`}>
                    {status === 'completed' ? 'Complété' : 'En attente'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
