import { TrendingUp, Users2, CreditCard, Repeat2, ArrowUpRight } from 'lucide-react'

const MONTHLY = [
  { month: 'Jan', gmv: 12400, bookings: 38 },
  { month: 'Fév', gmv: 18700, bookings: 55 },
  { month: 'Mar', gmv: 24100, bookings: 71 },
  { month: 'Avr', gmv: 31500, bookings: 94 },
  { month: 'Mai', gmv: 58200, bookings: 167 },
  { month: 'Juin', gmv: 87400, bookings: 248 },
]

const BY_CAT = [
  { label: 'Chef privé',      pct: 34, color: '#E8604A', amount: '29 716 €' },
  { label: 'DJ & soirées',    pct: 24, color: '#2ABFB8', amount: '20 976 €' },
  { label: 'Massage & spa',   pct: 18, color: '#1A3D2B', amount: '15 732 €' },
  { label: 'Photographie',    pct: 11, color: '#F5A623', amount: '9 614 €'  },
  { label: 'Beauté & soins',  pct:  8, color: '#8B5CF6', amount: '6 992 €'  },
  { label: 'Autres',          pct:  5, color: '#94A3B8', amount: '4 370 €'  },
]

const BY_ISLAND = [
  { label: 'Guadeloupe',  pct: 68, bookings: 169, color: '#1A3D2B' },
  { label: 'Martinique',  pct: 25, bookings: 62,  color: '#E8604A' },
  { label: 'Saint-Martin',pct:  7, bookings: 17,  color: '#2ABFB8' },
]

const TOP_SERVICES = [
  { rank: 1, title: 'Dîner de chef en villa — Créole Prestige', provider: 'Chef Marcus',        bookings: 32, gmv: '5 760 €',  growth: '+41%' },
  { rank: 2, title: 'DJ & ambiance live en villa',              provider: 'DJ Kenzo Caraïbes',  bookings: 28, gmv: '7 000 €',  growth: '+55%' },
  { rank: 3, title: 'Décoration romantique de villa',           provider: 'Tiphanie Événements', bookings: 24, gmv: '3 600 €', growth: '+65%' },
  { rank: 4, title: 'Massage balinais en villa',                provider: 'Massage Madeleine',   bookings: 22, gmv: '2 640 €',  growth: '+19%' },
  { rank: 5, title: 'Shooting photo couple — Lever de soleil',  provider: 'Studio Camille',      bookings: 18, gmv: '3 960 €',  growth: '+33%' },
]

const maxGmv = Math.max(...MONTHLY.map((m) => m.gmv))

export default function AnalyticsPage() {
  return (
    <div className="p-5 md:p-8 space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-display text-white">Analytics</h1>
        <p className="text-white/40 text-sm mt-0.5">Données en temps réel · Juin 2026</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'GMV juin', value: '87 400 €', delta: '+50% vs mai', Icon: CreditCard, color: 'text-[#F5A623]' },
          { label: 'Réservations juin', value: '248', delta: '+49% vs mai', Icon: Repeat2, color: 'text-turquoise' },
          { label: 'Nouveaux utilisateurs', value: '312', delta: '+38%', Icon: Users2, color: 'text-green-400' },
          { label: 'Valeur moy. panier', value: '352 €', delta: '+8%', Icon: TrendingUp, color: 'text-blue-400' },
        ].map(({ label, value, delta, Icon, color }) => (
          <div key={label} className="bg-white/5 rounded-2xl p-4 border border-white/8">
            <Icon size={18} className={`mb-3 ${color}`} />
            <p className="text-2xl font-display text-white">{value}</p>
            <p className="text-xs text-white/40 mt-0.5">{label}</p>
            <p className="text-xs text-green-400/80 font-medium mt-1 flex items-center gap-1">
              <ArrowUpRight size={11} />{delta}
            </p>
          </div>
        ))}
      </div>

      {/* GMV chart */}
      <div className="bg-white/5 rounded-2xl border border-white/8 p-5">
        <h2 className="text-sm font-semibold text-white mb-5">Volume brut mensuel (GMV)</h2>
        <div className="flex items-end gap-3 h-36">
          {MONTHLY.map(({ month, gmv, bookings }) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-2">
              <p className="text-xs text-white/40 hidden sm:block">{(gmv / 1000).toFixed(0)}k€</p>
              <div className="w-full rounded-t-lg bg-gradient-to-t from-turquoise/80 to-turquoise transition-all"
                style={{ height: `${(gmv / maxGmv) * 100}%`, minHeight: '8px' }} />
              <p className="text-xs text-white/50 shrink-0">{month}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-6 border-t border-white/8 pt-4">
          <div>
            <p className="text-xs text-white/40">Total H1 2026</p>
            <p className="text-lg font-display text-white">232 300 €</p>
          </div>
          <div>
            <p className="text-xs text-white/40">Total réservations H1</p>
            <p className="text-lg font-display text-white">673</p>
          </div>
          <div>
            <p className="text-xs text-white/40">Croissance MoM (juin)</p>
            <p className="text-lg font-display text-green-400">+50%</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* By category */}
        <div className="bg-white/5 rounded-2xl border border-white/8 p-5">
          <h2 className="text-sm font-semibold text-white mb-4">GMV par catégorie</h2>
          <div className="space-y-3">
            {BY_CAT.map(({ label, pct, color, amount }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/70">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">{amount}</span>
                    <span className="text-xs font-semibold text-white">{pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By island */}
        <div className="bg-white/5 rounded-2xl border border-white/8 p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Réservations par île</h2>
          <div className="space-y-4">
            {BY_ISLAND.map(({ label, pct, bookings, color }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full shrink-0" style={{ background: `conic-gradient(${color} ${pct}%, rgba(255,255,255,0.08) 0)` }}>
                  <div className="absolute inset-2 rounded-full bg-[#0F1923] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{pct}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-white/40">{bookings} réservations ce mois</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top services */}
      <div className="bg-white/5 rounded-2xl border border-white/8 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8">
          <h2 className="text-sm font-semibold text-white">Top services ce mois</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/3">
                <th className="text-left px-5 py-3 text-xs font-medium text-white/40">#</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-white/40">Service</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-white/40 hidden md:table-cell">Prestataire</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-white/40">Résa</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-white/40">GMV</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-white/40">Croiss.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {TOP_SERVICES.map(({ rank, title, provider, bookings, gmv, growth }) => (
                <tr key={rank} className="hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3 text-white/30 font-mono text-xs">{rank}</td>
                  <td className="px-5 py-3 font-medium text-white max-w-[200px] truncate">{title}</td>
                  <td className="px-5 py-3 text-white/50 hidden md:table-cell">{provider}</td>
                  <td className="px-5 py-3 text-right text-white">{bookings}</td>
                  <td className="px-5 py-3 text-right font-semibold text-[#F5A623]">{gmv}</td>
                  <td className="px-5 py-3 text-right text-green-400 font-medium">{growth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
