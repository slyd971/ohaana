import { Link2, CreditCard, BarChart3, TrendingUp, Copy, ExternalLink } from 'lucide-react'

const KPI = [
  { label: 'Réservations via lien', value: '34', delta: 'Ce mois', Icon: BarChart3, color: 'bg-turquoise/10 text-turquoise' },
  { label: 'Commissions générées', value: '2 890 €', delta: '+31%', Icon: TrendingUp, color: 'bg-deep-green/10 text-deep-green' },
  { label: 'Commission moyenne', value: '85 €', delta: 'par résa', Icon: CreditCard, color: 'bg-coral/10 text-coral' },
  { label: 'Clics sur le lien', value: '412', delta: 'Ce mois', Icon: Link2, color: 'bg-[#F5A623]/10 text-[#F5A623]' },
]

const PARTNER_LINK = 'https://ohaana.com/partner/la-toubana-resort'

const BOOKINGS = [
  { id: 1, guest: 'Philippe Moreau', service: 'Chef privé — 6 pers.', date: '12 juin 2026', commission: '120 €', status: 'paid' },
  { id: 2, guest: 'Anna Schmidt',    service: 'Excursion voilier', date: '10 juin 2026', commission: '95 €', status: 'paid' },
  { id: 3, guest: 'Luc Fontaine',    service: 'Massage duo · spa', date: '9 juin 2026', commission: '65 €', status: 'paid' },
  { id: 4, guest: 'Camille Roy',     service: 'Cours de surf', date: '8 juin 2026', commission: '40 €', status: 'pending' },
  { id: 5, guest: 'David Kim',       service: 'Plongée exploration', date: '7 juin 2026', commission: '55 €', status: 'pending' },
]

export default function HotelDashboard() {
  return (
    <div className="p-5 md:p-8 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-display text-deep-green">La Toubana Resort & Spa</h1>
        <p className="text-stone text-sm mt-0.5">Partenaire Ohaana depuis mars 2026 · Guadeloupe</p>
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

      {/* Partner link */}
      <div className="bg-coconut rounded-2xl border border-mist shadow-sm p-5">
        <h2 className="text-sm font-semibold text-charcoal mb-1 flex items-center gap-2">
          <Link2 size={15} className="text-deep-green" />
          Votre lien partenaire
        </h2>
        <p className="text-xs text-stone mb-3">Partagez ce lien avec vos clients pour qu'ils accèdent aux services Ohaana. Vous touchez 10 % sur chaque réservation.</p>
        <div className="flex items-center gap-2 bg-sand rounded-xl px-4 py-2.5 border border-mist">
          <span className="text-xs text-charcoal flex-1 truncate font-mono">{PARTNER_LINK}</span>
          <button className="shrink-0 p-1.5 text-stone hover:text-deep-green transition-colors" title="Copier">
            <Copy size={14} />
          </button>
          <a href={PARTNER_LINK} target="_blank" rel="noopener noreferrer" className="shrink-0 p-1.5 text-stone hover:text-deep-green transition-colors">
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Referral bookings */}
      <div className="bg-coconut rounded-2xl border border-mist shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-mist">
          <h2 className="text-sm font-semibold text-charcoal">Réservations via votre lien</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sand/60">
                <th className="text-left px-5 py-3 text-xs font-medium text-stone">Client</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-stone">Service</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-stone">Date</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-stone">Commission</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-stone">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist">
              {BOOKINGS.map(({ id, guest, service, date, commission, status }) => (
                <tr key={id} className="hover:bg-sand/40 transition-colors">
                  <td className="px-5 py-3 font-medium text-charcoal">{guest}</td>
                  <td className="px-5 py-3 text-stone">{service}</td>
                  <td className="px-5 py-3 text-stone">{date}</td>
                  <td className="px-5 py-3 text-right font-semibold text-deep-green">{commission}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${status === 'paid' ? 'bg-turquoise/10 text-turquoise' : 'bg-[#F5A623]/10 text-[#F5A623]'}`}>
                      {status === 'paid' ? 'Versée' : 'En attente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
