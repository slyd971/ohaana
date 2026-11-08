import { Button } from '@/components/ui/Button'
import { Wallet, TrendingUp, ArrowDownLeft, Clock } from 'lucide-react'

const SUMMARY = [
  { label: 'Solde disponible',   value: '2 140 €', Icon: Wallet,      color: 'bg-turquoise/10 text-turquoise-text' },
  { label: 'En attente',         value: '660 €',   Icon: Clock,       color: 'bg-sand text-stone'             },
  { label: 'Total ce mois',      value: '4 320 €', Icon: TrendingUp,  color: 'bg-deep-green/10 text-deep-green'},
]

const TRANSACTIONS = [
  { label: 'Dîner de chef · Sophie Laurent',    date: '14 juin', amount: '+648 €',  status: 'versé'     },
  { label: 'Brunch créole · Marcus Williams',   date: '15 juin', amount: '+513 €',  status: 'versé'     },
  { label: 'Dîner de chef · Isabelle Moreau',   date: '16 juin', amount: '+972 €',  status: 'en attente'},
  { label: 'Virement bancaire',                 date: '10 juin', amount: '−1 800 €',status: 'virement'  },
  { label: 'Brunch créole · Julie Besson',      date: '18 juin', amount: '+342 €',  status: 'en attente'},
]

const STATUS_STYLE: Record<string, string> = {
  'versé':      'text-turquoise-text',
  'en attente': 'text-amber-500',
  'virement':   'text-stone',
}

export function DemoPaiements() {
  return (
    <div className="p-5 md:p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display text-deep-green">Paiements</h1>
        <p className="text-stone text-sm mt-0.5">Ohaana retient 10 % de commission sur chaque réservation.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SUMMARY.map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-coconut rounded-card border border-mist p-5">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-control mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-display text-charcoal">{value}</p>
            <p className="text-xs text-stone mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-coconut rounded-card border border-mist overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-mist">
          <h2 className="text-sm font-semibold text-charcoal">Historique</h2>
          <Button variant="link" size="bare" type="button" className="text-xs">
            <ArrowDownLeft size={12} />
            Demander un virement
          </Button>
        </div>
        <div className="divide-y divide-mist">
          {TRANSACTIONS.map((t) => (
            <div key={`${t.label}-${t.date}`} className="flex items-center gap-3 px-5 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-charcoal truncate">{t.label}</p>
                <p className="text-xs text-stone">{t.date}</p>
              </div>
              <div className="text-right flex-none">
                <p className="text-sm font-semibold text-charcoal">{t.amount}</p>
                <p className={`text-xs font-medium ${STATUS_STYLE[t.status]}`}>{t.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
