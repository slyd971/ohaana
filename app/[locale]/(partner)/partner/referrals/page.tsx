import { Users, CalendarDays, TrendingUp } from 'lucide-react'

const CLIENTS = [
  { name: 'Marie Fontaine',    bookings: 3, total: '162 €', lastBooking: '14 juin', source: 'Lien affilié'  },
  { name: 'Thomas Baudoin',    bookings: 2, total: '80 €',  lastBooking: '15 juin', source: 'Lien affilié'  },
  { name: 'Laura & Jim Baker', bookings: 1, total: '56 €',  lastBooking: '15 juin', source: 'QR code'       },
  { name: 'Nathalie Girard',   bookings: 2, total: '132 €', lastBooking: '17 juin', source: 'Lien affilié'  },
  { name: 'Pierre-Antoine Rey', bookings: 1, total: '24 €', lastBooking: '18 juin', source: 'Widget'        },
]

export default function PartnerReferralsPage() {
  return (
    <div className="p-5 md:p-8 space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display text-deep-green">Mes apports</h1>
          <p className="text-stone text-sm mt-0.5">21 clients référencés · 34 réservations générées</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone bg-coconut border border-mist rounded-full px-3 py-1.5">
          <TrendingUp size={12} />
          +5 ce mois
        </div>
      </div>

      <div className="bg-coconut rounded-2xl border border-mist overflow-hidden">
        <div className="px-5 py-3.5 border-b border-mist grid grid-cols-4 gap-3 text-[11px] font-semibold text-stone uppercase tracking-wider">
          <span className="col-span-2">Client</span>
          <span>Réservations</span>
          <span className="text-right">Commission</span>
        </div>
        <div className="divide-y divide-mist">
          {CLIENTS.map((c) => (
            <div key={c.name} className="px-5 py-4 grid grid-cols-4 gap-3 items-center">
              <div className="col-span-2 min-w-0">
                <p className="text-sm font-medium text-charcoal truncate">{c.name}</p>
                <div className="flex items-center gap-2 text-xs text-stone mt-0.5">
                  <CalendarDays size={10} />
                  {c.lastBooking} · {c.source}
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-charcoal">
                <Users size={12} className="text-stone" />
                {c.bookings}
              </div>
              <p className="text-sm font-semibold text-turquoise text-right">{c.total}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
