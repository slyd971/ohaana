import { CalendarDays, Clock, TrendingUp } from 'lucide-react'

const RESERVATIONS = [
  { client: 'Marie Fontaine',     service: 'Dîner de chef — 4 pers.',      date: '14 juin', time: '19h00', commission: '54 €',  status: 'payé'      },
  { client: 'Thomas Baudoin',     service: 'Massage balinais couple',       date: '15 juin', time: '16h00', commission: '24 €',  status: 'payé'      },
  { client: 'Laura & Jim Baker',  service: 'Cours de cocktails créoles',    date: '15 juin', time: '18h30', commission: '16 €',  status: 'en attente'},
  { client: 'Nathalie Girard',    service: 'Shooting photo coucher soleil', date: '17 juin', time: '17h00', commission: '44 €',  status: 'en attente'},
  { client: 'Pierre-Antoine Rey', service: 'Massage balinais — 1 pers.',    date: '18 juin', time: '10h00', commission: '14 €',  status: 'en attente'},
]

const STATUS_STYLE: Record<string, string> = {
  'payé':       'bg-turquoise/10 text-turquoise',
  'en attente': 'bg-sand text-stone',
}

export default function PartnerReservationsPage() {
  return (
    <div className="p-5 md:p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display text-deep-green">Réservations</h1>
        <p className="text-stone text-sm mt-0.5">Réservations générées via votre lien affilié</p>
      </div>

      <div className="bg-coconut rounded-2xl border border-mist overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-mist text-xs text-stone">
          <TrendingUp size={12} />
          34 réservations générées au total · 1 870 € de commissions perçues
        </div>
        <div className="divide-y divide-mist">
          {RESERVATIONS.map((r) => (
            <div key={`${r.client}-${r.date}`} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal">{r.client}</p>
                <p className="text-xs text-stone truncate">{r.service}</p>
                <div className="flex items-center gap-3 text-xs text-stone mt-1">
                  <span className="flex items-center gap-1"><CalendarDays size={10} />{r.date}</span>
                  <span className="flex items-center gap-1"><Clock size={10} />{r.time}</span>
                </div>
              </div>
              <div className="text-right flex-none space-y-1.5">
                <p className="text-sm font-semibold text-charcoal">{r.commission}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[r.status]}`}>
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
