'use client'

import { useState } from 'react'
import { Link } from '@/lib/i18n/navigation'
import { ChevronLeft, CreditCard, Plus, Trash2, ShieldCheck, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const DEMO_CARDS = [
  { id: 'c-1', brand: 'Visa', last4: '4242', exp: '12/27', default: true },
  { id: 'c-2', brand: 'Mastercard', last4: '5555', exp: '08/26', default: false },
]

const DEMO_INVOICES = [
  { id: 'inv-001', date: '13 juin 2026', service: 'Dîner créole privé', amount: '380,00 €', status: 'paid' },
  { id: 'inv-002', date: '11 juin 2026', service: 'Catamaran privatif', amount: '520,00 €', status: 'paid' },
  { id: 'inv-003', date: '9 juin 2026',  service: 'Shooting couple',    amount: '240,00 €', status: 'paid' },
]

function CardBrandIcon({ brand }: { brand: string }) {
  return (
    <div className="w-10 h-7 rounded-md bg-gradient-to-br from-deep-green/20 to-turquoise/20 flex items-center justify-center">
      <span className="text-[9px] font-bold text-deep-green uppercase">{brand.slice(0, 4)}</span>
    </div>
  )
}

export default function PaiementPage() {
  const [cards, setCards] = useState(DEMO_CARDS)
  const [showAddForm, setShowAddForm] = useState(false)

  function removeCard(id: string) {
    setCards(prev => prev.filter(c => c.id !== id))
  }

  function setDefault(id: string) {
    setCards(prev => prev.map(c => ({ ...c, default: c.id === id })))
  }

  return (
    <div className="min-h-screen bg-coconut pt-16">
      <div className="max-w-xl mx-auto px-5 py-8 pb-24 space-y-8">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="p-2 rounded-full hover:bg-sand transition-colors text-stone">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-display text-charcoal">Paiement</h1>
        </div>

        {/* Cards */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-charcoal">Mes cartes</h2>
          <ul className="space-y-3">
            {cards.map(card => (
              <li key={card.id} className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-mist">
                <CardBrandIcon brand={card.brand} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-charcoal">{card.brand} •••• {card.last4}</p>
                  <p className="text-xs text-stone">Expire {card.exp}</p>
                </div>
                {card.default ? (
                  <span className="inline-flex items-center gap-1 text-xs text-deep-green bg-deep-green/10 rounded-full px-2.5 py-1">
                    <CheckCircle size={11} /> Par défaut
                  </span>
                ) : (
                  <button
                    onClick={() => setDefault(card.id)}
                    className="text-xs text-stone hover:text-charcoal transition-colors"
                  >
                    Définir par défaut
                  </button>
                )}
                <button
                  onClick={() => removeCard(card.id)}
                  className="p-1.5 text-stone hover:text-coral transition-colors rounded-lg hover:bg-coral/5"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>

          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-mist text-stone hover:border-deep-green/30 hover:text-deep-green transition-colors text-sm"
            >
              <Plus size={16} /> Ajouter une carte
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-surface border border-mist space-y-3">
              <p className="text-sm font-medium text-charcoal">Nouvelle carte</p>
              <div className="space-y-2">
                <input placeholder="Numéro de carte" className="w-full px-3 py-2.5 rounded-xl border border-mist bg-coconut text-sm text-charcoal placeholder-stone focus:outline-none focus:border-deep-green/40" />
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="MM/AA" className="px-3 py-2.5 rounded-xl border border-mist bg-coconut text-sm text-charcoal placeholder-stone focus:outline-none focus:border-deep-green/40" />
                  <input placeholder="CVC" className="px-3 py-2.5 rounded-xl border border-mist bg-coconut text-sm text-charcoal placeholder-stone focus:outline-none focus:border-deep-green/40" />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm text-stone border border-mist hover:bg-sand transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm text-coconut bg-deep-green hover:bg-deep-green/90 transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Invoices */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-charcoal">Factures</h2>
          <ul className="divide-y divide-mist rounded-2xl bg-surface border border-mist overflow-hidden">
            {DEMO_INVOICES.map(inv => (
              <li key={inv.id} className="px-4 py-3.5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-charcoal font-medium">{inv.service}</p>
                  <p className="text-xs text-stone">{inv.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-charcoal">{inv.amount}</span>
                  <button className="text-xs text-deep-green hover:underline">PDF</button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex items-center gap-2 text-xs text-stone bg-surface rounded-xl p-3.5 border border-mist">
          <ShieldCheck size={15} className="text-deep-green shrink-0" />
          <span>Paiements sécurisés par Stripe. Ohaana ne stocke jamais vos coordonnées bancaires.</span>
        </div>
      </div>
    </div>
  )
}
