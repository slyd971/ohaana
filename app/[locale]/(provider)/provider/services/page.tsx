import { Briefcase, Plus, Star, Clock, Users } from 'lucide-react'

const SERVICES = [
  {
    title: 'Dîner de chef à domicile — Menu Créole Prestige',
    category: 'Chef privé',
    price: '180 €/pers.',
    duration: '3h',
    capacity: '2–8 pers.',
    rating: 4.9,
    reviews: 47,
    bookings: 89,
    status: 'actif',
  },
  {
    title: 'Brunch créole à domicile — Saveurs des îles',
    category: 'Chef privé',
    price: '95 €/pers.',
    duration: '2h',
    capacity: '2–10 pers.',
    rating: 4.8,
    reviews: 23,
    bookings: 34,
    status: 'actif',
  },
  {
    title: 'Cours de cuisine créole — Recettes traditionnelles',
    category: 'Atelier culinaire',
    price: '75 €/pers.',
    duration: '2h30',
    capacity: '2–6 pers.',
    rating: 0,
    reviews: 0,
    bookings: 0,
    status: 'brouillon',
  },
]

const STATUS_STYLE: Record<string, string> = {
  actif:      'bg-turquoise/10 text-turquoise',
  brouillon:  'bg-sand text-stone',
  inactif:    'bg-mist text-stone',
}

export default function ProviderServicesPage() {
  return (
    <div className="p-5 md:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-deep-green">Mes services</h1>
          <p className="text-stone text-sm mt-0.5">{SERVICES.length} services enregistrés</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 bg-deep-green text-coconut px-4 py-2.5 rounded-full text-sm font-medium hover:bg-deep-green/90 transition-colors"
        >
          <Plus size={15} />
          Ajouter un service
        </button>
      </div>

      <div className="space-y-3">
        {SERVICES.map((s) => (
          <div key={s.title} className="bg-coconut rounded-2xl border border-mist p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[s.status]}`}>
                    {s.status}
                  </span>
                  <span className="text-[10px] text-stone">{s.category}</span>
                </div>
                <h2 className="text-sm font-semibold text-charcoal leading-snug">{s.title}</h2>
              </div>
              <button type="button" className="text-xs text-deep-green hover:underline flex-none">Modifier</button>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-stone">
              <span className="font-semibold text-charcoal">{s.price}</span>
              <span className="flex items-center gap-1"><Clock size={11} />{s.duration}</span>
              <span className="flex items-center gap-1"><Users size={11} />{s.capacity}</span>
              {s.rating > 0 && (
                <span className="flex items-center gap-1"><Star size={11} className="text-amber-400" />{s.rating} ({s.reviews} avis)</span>
              )}
              {s.bookings > 0 && <span>{s.bookings} réservations</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
