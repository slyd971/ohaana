import { CalendarDays, Clock, Users, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

const RESERVATIONS = [
  { client: 'Sophie Laurent',  service: 'Dîner de chef — 4 pers.',   date: 'Ven 14 juin', time: '19h00', guests: 4, total: '720 €', status: 'confirmed' },
  { client: 'Marcus Williams', service: 'Brunch créole — 6 pers.',    date: 'Sam 15 juin', time: '10h00', guests: 6, total: '570 €', status: 'confirmed' },
  { client: 'Isabelle Moreau', service: 'Dîner de chef — 6 pers.',   date: 'Dim 16 juin', time: '20h00', guests: 6, total: '1 080 €', status: 'pending'   },
  { client: 'Julie Besson',    service: 'Dîner de chef — 2 pers.',   date: 'Mar 18 juin', time: '19h30', guests: 2, total: '360 €', status: 'confirmed' },
  { client: 'Marc Dufresne',   service: 'Brunch créole — 4 pers.',   date: 'Mer 19 juin', time: '09h30', guests: 4, total: '380 €', status: 'pending'   },
]

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmé',   Icon: CheckCircle, style: 'text-turquoise' },
  pending:   { label: 'En attente', Icon: AlertCircle, style: 'text-amber-500'  },
  cancelled: { label: 'Annulé',     Icon: XCircle,     style: 'text-coral'      },
}

export default function ProviderReservationsPage() {
  return (
    <div className="p-5 md:p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display text-deep-green">Réservations</h1>
        <p className="text-stone text-sm mt-0.5">5 réservations à venir</p>
      </div>

      <div className="bg-coconut rounded-2xl border border-mist overflow-hidden">
        <div className="divide-y divide-mist">
          {RESERVATIONS.map((r) => {
            const { label, Icon, style } = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG]
            return (
              <div key={`${r.client}-${r.date}`} className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sand flex items-center justify-center flex-none">
                  <CalendarDays size={17} className="text-deep-green" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-charcoal">{r.client}</p>
                    <span className={`flex items-center gap-1 text-xs font-medium ${style}`}>
                      <Icon size={12} />
                      {label}
                    </span>
                  </div>
                  <p className="text-xs text-stone truncate">{r.service}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-stone">
                    <span className="flex items-center gap-1"><CalendarDays size={11} />{r.date}</span>
                    <span className="flex items-center gap-1"><Clock size={11} />{r.time}</span>
                    <span className="flex items-center gap-1"><Users size={11} />{r.guests} pers.</span>
                    <span className="font-semibold text-charcoal">{r.total}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
