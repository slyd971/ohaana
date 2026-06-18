'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ServiceCard } from '@/components/service/ServiceCard'
import { OhaanaLogo } from '@/components/layout/OhaanaLogo'
import { useDemoAuth } from '@/hooks/useDemoAuth'
import { setDemoRole } from '@/lib/demo-auth'
import { SERVICES } from '@/lib/data/seed'
import { formatPrice, cn } from '@/lib/utils'
import {
  LayoutDashboard, CalendarDays, Heart, Sparkles,
  CreditCard, Bell, Settings, LogOut, Menu, X,
  CheckCircle, Clock, Star, Plus, Trash2,
  ShieldCheck, Globe, Lock, User, MessageCircle,
  ChevronRight, MapPin, AlertCircle, Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

// ─── Types & data ────────────────────────────────────────────────────────────

type Tab = 'apercu' | 'voyages' | 'favoris' | 'preferences' | 'paiement' | 'notifications' | 'parametres'

const NAV: { key: Tab; label: string; Icon: React.ElementType }[] = [
  { key: 'apercu',         label: 'Aperçu',          Icon: LayoutDashboard },
  { key: 'voyages',        label: 'Mes voyages',      Icon: CalendarDays    },
  { key: 'favoris',        label: 'Mes favoris',      Icon: Heart           },
  { key: 'preferences',   label: 'Préférences',      Icon: Sparkles        },
  { key: 'paiement',      label: 'Paiement',         Icon: CreditCard      },
  { key: 'notifications', label: 'Notifications',    Icon: Bell            },
  { key: 'parametres',    label: 'Paramètres',       Icon: Settings        },
]

const DEMO_CLIENT = { name: 'Sophie Dupont', email: 'client@demo.ohaana.com', initials: 'SD', memberSince: 'Janvier 2026' }

type BookingBase = { id: string; serviceId: string; date: string; time: string; guests: number; total: number }
type ActiveBooking = BookingBase & { status: 'confirmed' | 'pending' }
type PastBooking   = BookingBase & { status: 'completed' }

const TRIP = { destination: 'Guadeloupe', start: new Date(2026, 7, 8), end: new Date(2026, 7, 15) }

const UPCOMING_BOOKINGS: ActiveBooking[] = [
  { id: 'b-1', serviceId: 's-1', date: '2026-08-09', time: '17:00', guests: 2, total: 50000, status: 'confirmed' },
  { id: 'b-2', serviceId: 's-3', date: '2026-08-11', time: '10:00', guests: 4, total: 72000, status: 'pending'   },
  { id: 'b-3', serviceId: 's-2', date: '2026-08-13', time: '11:00', guests: 2, total: 19000, status: 'confirmed' },
]
const PAST_BOOKINGS: PastBooking[] = [
  { id: 'b-4', serviceId: 's-7', date: '2026-06-20', time: '10:00', guests: 1, total: 12000, status: 'completed' },
  { id: 'b-5', serviceId: 's-4', date: '2026-06-10', time: '15:00', guests: 2, total: 19000, status: 'completed' },
]

const STATUS_CFG = {
  confirmed: { label: 'Confirmé',   color: 'text-turquoise bg-turquoise/10' },
  pending:   { label: 'En attente', color: 'text-[#F5A623] bg-[#F5A623]/10' },
  completed: { label: 'Terminé',    color: 'text-stone bg-stone/10'         },
}

const MONTHS_FR = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.']
const DAYS_FR   = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']

function parseLocalDate(iso: string) { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d) }
function fmtDate(iso: string) { const d = parseLocalDate(iso); return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}` }
function fmtShort(d: Date) { return `${d.getDate()} ${MONTHS_FR[d.getMonth()]}` }

const FAVORITE_IDS = ['s-5', 's-18', 's-17', 's-4']
const FAVORITE_SERVICES = SERVICES.filter(s => FAVORITE_IDS.includes(s.id))

const DEMO_CARDS = [
  { id: 'c-1', brand: 'Visa',       last4: '4242', exp: '12/27', default: true  },
  { id: 'c-2', brand: 'Mastercard', last4: '5555', exp: '08/26', default: false },
]
const DEMO_INVOICES = [
  { id: 'i-1', date: '13 juin 2026', service: 'Dîner créole privé',   amount: '380,00 €' },
  { id: 'i-2', date: '11 juin 2026', service: 'Catamaran privatif',   amount: '520,00 €' },
  { id: 'i-3', date: '9 juin 2026',  service: 'Shooting couple',      amount: '240,00 €' },
]

const ISLANDS = [
  { id: 'guadeloupe', label: 'Guadeloupe', emoji: '🇬🇵' },
  { id: 'martinique', label: 'Martinique', emoji: '🇲🇶' },
  { id: 'saint-martin', label: 'Saint-Martin', emoji: '🌊' },
  { id: 'saint-barth', label: 'Saint-Barth', emoji: '⛵' },
]
const MOODS = [
  { id: 'relax',   label: 'Détente & spa'    }, { id: 'gourmet', label: 'Gastronomie'     },
  { id: 'sport',   label: 'Sport & nature'   }, { id: 'photo',   label: 'Photo & souvenirs'},
  { id: 'party',   label: 'Fête & ambiance'  }, { id: 'culture', label: 'Culture locale'  },
  { id: 'romance', label: 'Romantique'       }, { id: 'family',  label: 'En famille'      },
]
const TRAVELER_TYPES = [
  { id: 'couple', label: 'En couple'  }, { id: 'family', label: 'En famille' },
  { id: 'friends',label: 'Entre amis' }, { id: 'solo',   label: 'En solo'    },
]
const NOTIF_ITEMS = [
  { id: 'confirm',    label: 'Confirmations de réservation', sub: 'Reçu dès qu\'une réservation est validée',          on: true  },
  { id: 'reminder',  label: 'Rappels de prestation',         sub: '24h avant chaque expérience',                       on: true  },
  { id: 'promo',     label: 'Offres et nouveautés',          sub: 'Les nouvelles expériences disponibles',              on: false },
  { id: 'review',    label: 'Demandes d\'avis',              sub: 'Après chaque prestation terminée',                   on: true  },
  { id: 'concierge', label: 'Messages concierge',            sub: 'Réponses et suggestions personnalisées',             on: true  },
  { id: 'news',      label: 'Newsletter Ohaana',             sub: 'Actualités et guides locaux, max 1x/semaine',        on: false },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn('px-4 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-2', active ? 'bg-deep-green/10 border-deep-green/40 text-deep-green' : 'bg-coconut border-mist text-stone hover:border-deep-green/20 hover:text-charcoal')}>
      {active && <Check size={12} />}{children}
    </button>
  )
}

function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button role="switch" aria-checked={on} onClick={onToggle} className={cn('relative w-11 h-6 rounded-full transition-colors shrink-0', on ? 'bg-deep-green' : 'bg-mist')}>
      <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-coconut shadow-sm transition-transform', on ? 'translate-x-5' : 'translate-x-0')} />
    </button>
  )
}

// ─── Tab panels ──────────────────────────────────────────────────────────────

function AperçuPanel({ goTo }: { goTo: (t: Tab) => void }) {
  const total = UPCOMING_BOOKINGS.reduce((s, b) => s + b.total, 0)
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display text-charcoal">Bonjour, Sophie 👋</h1>
        <p className="text-stone text-sm mt-0.5">Votre prochain séjour en Guadeloupe dans <span className="font-medium text-charcoal">51 jours</span>.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-surface border border-mist rounded-2xl cursor-pointer hover:border-deep-green/30 transition-colors" onClick={() => goTo('voyages')}>
          <CalendarDays size={18} className="text-turquoise mb-2" />
          <p className="text-2xl font-display text-charcoal">{UPCOMING_BOOKINGS.length}</p>
          <p className="text-xs text-stone mt-0.5">Réservations à venir</p>
        </div>
        <div className="p-4 bg-surface border border-mist rounded-2xl cursor-pointer hover:border-deep-green/30 transition-colors" onClick={() => goTo('favoris')}>
          <Heart size={18} className="text-coral mb-2" />
          <p className="text-2xl font-display text-charcoal">{FAVORITE_IDS.length}</p>
          <p className="text-xs text-stone mt-0.5">Expériences sauvegardées</p>
        </div>
        <div className="p-4 bg-surface border border-mist rounded-2xl col-span-2 sm:col-span-1">
          <CreditCard size={18} className="text-deep-green mb-2" />
          <p className="text-2xl font-display text-charcoal">{formatPrice(total)}</p>
          <p className="text-xs text-stone mt-0.5">Budget séjour</p>
        </div>
      </div>
      <div>
        <p className="text-xs text-stone uppercase tracking-wider font-medium mb-3">Prochaine expérience</p>
        {UPCOMING_BOOKINGS.slice(0, 1).map(b => {
          const svc = SERVICES.find(s => s.id === b.serviceId)!
          return (
            <div key={b.id} className="flex items-center gap-4 p-4 bg-surface border border-mist rounded-2xl">
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                <img src={svc.images[0]?.url} alt={svc.title_fr} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal truncate">{svc.title_fr}</p>
                <p className="text-xs text-stone mt-0.5">{fmtDate(b.date)} · {b.time} · {b.guests} pers.</p>
              </div>
              <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium shrink-0', STATUS_CFG[b.status].color)}>
                {STATUS_CFG[b.status].label}
              </span>
            </div>
          )
        })}
      </div>
      <button onClick={() => goTo('voyages')} className="text-sm text-deep-green hover:underline underline-offset-2 flex items-center gap-1">
        Voir toutes mes réservations <ChevronRight size={14} />
      </button>
    </div>
  )
}

function VoyagesPanel() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const nights = Math.round((TRIP.end.getTime() - TRIP.start.getTime()) / 86400000)
  const total = UPCOMING_BOOKINGS.reduce((s, b) => s + b.total, 0)

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-display text-charcoal">Mes voyages</h2>

      {/* Trip card */}
      <div className="rounded-2xl p-5 space-y-3" style={{ background: 'linear-gradient(135deg, var(--deep-green) 0%, #0F2B1D 100%)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-coconut/50 text-[10px] uppercase tracking-widest">Mon séjour</p>
            <h3 className="text-coconut font-display text-xl mt-0.5">{TRIP.destination}</h3>
            <p className="text-coconut/70 text-sm mt-1.5 flex items-center gap-1.5">
              <CalendarDays size={13} /> {fmtShort(TRIP.start)} – {fmtShort(TRIP.end)} · {nights} nuits
            </p>
          </div>
          <div className="text-right">
            <p className="text-coconut/50 text-[10px]">{UPCOMING_BOOKINGS.length} expériences</p>
            <p className="text-coconut font-semibold text-sm mt-0.5">{formatPrice(total)}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: nights }).map((_, i) => {
            const d = new Date(TRIP.start.getFullYear(), TRIP.start.getMonth(), TRIP.start.getDate() + i + 1)
            const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
            const booked = UPCOMING_BOOKINGS.some(b => b.date === iso)
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={cn('w-full h-1.5 rounded-full', booked ? 'bg-turquoise' : 'bg-coconut/20')} />
                <span className="text-[9px] text-coconut/40">{d.getDate()}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-mist/40 rounded-xl p-1">
        {(['upcoming','past'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn('flex-1 py-2 rounded-lg text-sm font-medium transition-colors', tab === t ? 'bg-coconut text-charcoal shadow-sm' : 'text-stone')}>
            {t === 'upcoming' ? 'À venir' : 'Passées'}
          </button>
        ))}
      </div>

      {tab === 'upcoming' ? (
        <ul className="space-y-3">
          {UPCOMING_BOOKINGS.map(b => {
            const svc = SERVICES.find(s => s.id === b.serviceId)!
            return (
              <li key={b.id} className="flex items-start gap-4 p-4 bg-surface border border-mist rounded-2xl">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <img src={svc.images[0]?.url} alt={svc.title_fr} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-charcoal leading-snug">{svc.title_fr}</p>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium shrink-0', STATUS_CFG[b.status].color)}>
                      {STATUS_CFG[b.status].label}
                    </span>
                  </div>
                  <p className="text-xs text-stone mt-1">{fmtDate(b.date)} · {b.time}</p>
                  <p className="text-xs text-stone flex items-center gap-1 mt-0.5"><Clock size={10} /> {b.guests} pers. · {formatPrice(b.total)}</p>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <ul className="space-y-3">
          {PAST_BOOKINGS.map(b => {
            const svc = SERVICES.find(s => s.id === b.serviceId)!
            return (
              <li key={b.id} className="flex items-start gap-4 p-4 bg-surface border border-mist rounded-2xl opacity-80">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <img src={svc.images[0]?.url} alt={svc.title_fr} className="w-full h-full object-cover grayscale" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal">{svc.title_fr}</p>
                  <p className="text-xs text-stone mt-1">{fmtDate(b.date)} · {b.time}</p>
                  <p className="text-xs text-stone mt-0.5">{formatPrice(b.total)}</p>
                  <button className="text-xs text-deep-green mt-1.5 flex items-center gap-1 hover:underline">
                    <Star size={11} /> Laisser un avis
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Link href="/search">
        <Button variant="outline" fullWidth>
          <Plus size={15} /> Ajouter une expérience
        </Button>
      </Link>
    </div>
  )
}

function FavorisPanel() {
  const [favIds, setFavIds] = useState(new Set(FAVORITE_IDS))
  const favs = SERVICES.filter(s => favIds.has(s.id))

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-xl font-display text-charcoal">Mes favoris</h2>
      {favs.length === 0 ? (
        <div className="text-center py-14 space-y-3">
          <Heart size={32} className="text-mist mx-auto" />
          <p className="text-stone text-sm">Aucun favori pour l'instant.</p>
          <Link href="/search"><Button variant="outline" size="sm">Explorer les expériences</Button></Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {favs.map(svc => (
            <li key={svc.id} className="flex items-center gap-4 p-4 bg-surface border border-mist rounded-2xl">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                <img src={svc.images[0]?.url} alt={svc.title_fr} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal truncate">{svc.title_fr}</p>
                <p className="text-xs text-stone mt-0.5">{svc.provider.user.full_name}</p>
                <p className="text-xs text-deep-green font-medium mt-1">{formatPrice(svc.price_cents)}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href={`/reserver/${svc.id}`}>
                  <Button size="sm" variant="outline">Réserver</Button>
                </Link>
                <button onClick={() => setFavIds(p => { const n = new Set(p); n.delete(svc.id); return n })} className="p-2 text-stone hover:text-coral transition-colors rounded-lg hover:bg-coral/5">
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PreferencesPanel() {
  const [islands, setIslands] = useState(new Set(['guadeloupe']))
  const [moods, setMoods]     = useState(new Set(['relax', 'gourmet']))
  const [traveler, setTraveler] = useState('couple')
  const [saved, setSaved] = useState(false)

  function toggle(set: Set<string>, setter: (s: Set<string>) => void, id: string) {
    const n = new Set(set)
    if (n.has(id)) n.delete(id); else n.add(id)
    setter(n); setSaved(false)
  }

  return (
    <div className="space-y-7 max-w-xl">
      <h2 className="text-xl font-display text-charcoal">Préférences</h2>

      <section className="space-y-3">
        <p className="text-sm font-semibold text-charcoal">Îles préférées</p>
        <div className="flex flex-wrap gap-2">
          {ISLANDS.map(({ id, label, emoji }) => (
            <ToggleChip key={id} active={islands.has(id)} onClick={() => toggle(islands, setIslands, id)}>{emoji} {label}</ToggleChip>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-semibold text-charcoal">Ambiances</p>
        <div className="flex flex-wrap gap-2">
          {MOODS.map(({ id, label }) => (
            <ToggleChip key={id} active={moods.has(id)} onClick={() => toggle(moods, setMoods, id)}>{label}</ToggleChip>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-semibold text-charcoal">Je voyage…</p>
        <div className="flex flex-wrap gap-2">
          {TRAVELER_TYPES.map(({ id, label }) => (
            <ToggleChip key={id} active={traveler === id} onClick={() => { setTraveler(id); setSaved(false) }}>{label}</ToggleChip>
          ))}
        </div>
      </section>

      <Button variant="primary" fullWidth onClick={() => setSaved(true)}>
        {saved ? '✓ Enregistré' : 'Enregistrer les préférences'}
      </Button>
    </div>
  )
}

function PaiementPanel() {
  const [cards, setCards] = useState(DEMO_CARDS)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="space-y-7 max-w-xl">
      <h2 className="text-xl font-display text-charcoal">Paiement</h2>

      <section className="space-y-3">
        <p className="text-sm font-semibold text-charcoal">Mes cartes</p>
        <ul className="space-y-2">
          {cards.map(c => (
            <li key={c.id} className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-mist">
              <div className="w-10 h-7 rounded-md bg-gradient-to-br from-deep-green/20 to-turquoise/20 flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-deep-green uppercase">{c.brand.slice(0,4)}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-charcoal">{c.brand} •••• {c.last4}</p>
                <p className="text-xs text-stone">Expire {c.exp}</p>
              </div>
              {c.default ? (
                <span className="text-xs text-deep-green bg-deep-green/10 rounded-full px-2.5 py-1 flex items-center gap-1">
                  <CheckCircle size={11} /> Par défaut
                </span>
              ) : (
                <button onClick={() => setCards(p => p.map(x => ({...x, default: x.id === c.id})))} className="text-xs text-stone hover:text-charcoal transition-colors">
                  Par défaut
                </button>
              )}
              <button onClick={() => setCards(p => p.filter(x => x.id !== c.id))} className="p-1.5 text-stone hover:text-coral transition-colors">
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
        {!showAdd ? (
          <button onClick={() => setShowAdd(true)} className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-mist text-stone hover:border-deep-green/30 hover:text-deep-green transition-colors text-sm">
            <Plus size={15} /> Ajouter une carte
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-surface border border-mist space-y-3">
            <input placeholder="Numéro de carte" className="w-full px-3 py-2.5 rounded-xl border border-mist bg-coconut text-sm placeholder-stone focus:outline-none focus:border-deep-green/40" />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="MM/AA" className="px-3 py-2.5 rounded-xl border border-mist bg-coconut text-sm placeholder-stone focus:outline-none focus:border-deep-green/40" />
              <input placeholder="CVC" className="px-3 py-2.5 rounded-xl border border-mist bg-coconut text-sm placeholder-stone focus:outline-none focus:border-deep-green/40" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl text-sm text-stone border border-mist hover:bg-sand transition-colors">Annuler</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl text-sm text-coconut bg-deep-green hover:bg-deep-green/90 transition-colors">Enregistrer</button>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <p className="text-sm font-semibold text-charcoal">Factures</p>
        <ul className="divide-y divide-mist rounded-2xl bg-surface border border-mist overflow-hidden">
          {DEMO_INVOICES.map(inv => (
            <li key={inv.id} className="px-4 py-3.5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-charcoal">{inv.service}</p>
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

      <div className="flex items-start gap-2 text-xs text-stone bg-surface rounded-xl p-3.5 border border-mist">
        <ShieldCheck size={14} className="text-deep-green mt-0.5 shrink-0" />
        Paiements sécurisés par Stripe. Ohaana ne stocke jamais vos coordonnées bancaires.
      </div>
    </div>
  )
}

function NotificationsPanel() {
  const [items, setItems] = useState(NOTIF_ITEMS)
  const [saved, setSaved] = useState(false)

  return (
    <div className="space-y-5 max-w-xl">
      <h2 className="text-xl font-display text-charcoal">Notifications</h2>
      <ul className="divide-y divide-mist rounded-2xl bg-surface border border-mist overflow-hidden">
        {items.map(({ id, label, sub, on }) => (
          <li key={id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-sm font-medium text-charcoal">{label}</p>
              <p className="text-xs text-stone mt-0.5">{sub}</p>
            </div>
            <Switch on={on} onToggle={() => { setItems(p => p.map(x => x.id === id ? {...x, on: !x.on} : x)); setSaved(false) }} />
          </li>
        ))}
      </ul>
      <Button variant="primary" fullWidth onClick={() => setSaved(true)}>
        {saved ? '✓ Préférences enregistrées' : 'Enregistrer'}
      </Button>
    </div>
  )
}

function ParamètresPanel({ onLogout }: { onLogout: () => void }) {
  const [lang, setLang] = useState('fr')
  const [showPwd, setShowPwd] = useState(false)
  const [showDel, setShowDel] = useState(false)
  const LANGS = [{ id: 'fr', label: 'Français', flag: '🇫🇷' }, { id: 'en', label: 'English', flag: '🇬🇧' }, { id: 'es', label: 'Español', flag: '🇪🇸' }]

  return (
    <div className="space-y-7 max-w-xl">
      <h2 className="text-xl font-display text-charcoal">Paramètres</h2>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-charcoal"><Globe size={15} className="text-deep-green" /> Langue</div>
        <div className="flex gap-2">
          {LANGS.map(({ id, label, flag }) => (
            <button key={id} onClick={() => setLang(id)} className={cn('flex-1 py-3 rounded-xl text-sm font-medium border transition-all', lang === id ? 'bg-deep-green/10 border-deep-green/40 text-deep-green' : 'bg-surface border-mist text-stone hover:border-deep-green/20')}>
              {flag} {label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-charcoal"><Lock size={15} className="text-deep-green" /> Sécurité</div>
        {showPwd ? (
          <div className="p-4 rounded-2xl bg-surface border border-mist space-y-3">
            <input placeholder="Mot de passe actuel" type="password" className="w-full px-3 py-2.5 rounded-xl border border-mist bg-coconut text-sm placeholder-stone focus:outline-none focus:border-deep-green/40" />
            <input placeholder="Nouveau mot de passe" type="password" className="w-full px-3 py-2.5 rounded-xl border border-mist bg-coconut text-sm placeholder-stone focus:outline-none focus:border-deep-green/40" />
            <div className="flex gap-2">
              <button onClick={() => setShowPwd(false)} className="flex-1 py-2.5 rounded-xl text-sm border border-mist text-stone hover:bg-sand transition-colors">Annuler</button>
              <button onClick={() => setShowPwd(false)} className="flex-1 py-2.5 rounded-xl text-sm bg-deep-green text-coconut hover:bg-deep-green/90 transition-colors">Modifier</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowPwd(true)} className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-surface border border-mist hover:border-deep-green/20 transition-colors">
            <span className="text-sm text-charcoal">Modifier le mot de passe</span>
            <ChevronRight size={15} className="text-stone" />
          </button>
        )}
      </section>

      <section className="space-y-3">
        <p className="text-sm font-semibold text-stone uppercase tracking-wider">Zone critique</p>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-surface border border-mist hover:border-stone/30 transition-colors">
          <LogOut size={15} className="text-stone" />
          <span className="text-sm text-charcoal">Se déconnecter</span>
        </button>
        {!showDel ? (
          <button onClick={() => setShowDel(true)} className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-coral/5 border border-coral/20 hover:border-coral/40 transition-colors">
            <Trash2 size={15} className="text-coral" />
            <span className="text-sm text-coral">Supprimer mon compte</span>
          </button>
        ) : (
          <div className="p-5 rounded-2xl bg-coral/5 border border-coral/30 space-y-3">
            <p className="text-sm font-medium text-coral">Action irréversible — confirmer ?</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDel(false)} className="flex-1 py-2.5 rounded-xl text-sm border border-mist bg-surface text-stone hover:bg-sand transition-colors">Annuler</button>
              <button className="flex-1 py-2.5 rounded-xl text-sm bg-coral text-coconut">Confirmer</button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

// ─── Connected layout ─────────────────────────────────────────────────────────

function ClientSpace() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('apercu')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleLogout() {
    setDemoRole(null)
    router.push('/')
  }

  function goTo(tab: Tab) {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-dvh flex bg-sand">
      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-60 bg-deep-green flex flex-col transition-transform duration-300',
        'md:translate-x-0 md:static',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="px-5 py-5 border-b border-coconut/10">
          <OhaanaLogo variant="light" size="sm" />
          <p className="text-coconut/40 text-[11px] mt-1 uppercase tracking-widest">Espace voyageur</p>
        </div>

        {/* Avatar */}
        <div className="px-5 py-4 border-b border-coconut/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-turquoise/30 flex items-center justify-center shrink-0">
            <span className="text-coconut text-sm font-display">{DEMO_CLIENT.initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-coconut truncate">{DEMO_CLIENT.name}</p>
            <p className="text-[10px] text-coconut/40">Membre depuis {DEMO_CLIENT.memberSince}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => goTo(key)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left',
                activeTab === key ? 'bg-coconut/15 text-coconut' : 'text-coconut/55 hover:text-coconut hover:bg-coconut/10'
              )}
            >
              <Icon size={17} /> {label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-coconut/10 space-y-0.5">
          <Link href="/concierge" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-coconut/55 hover:text-coconut hover:bg-coconut/10 transition-colors">
            <MessageCircle size={17} /> Concierge
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-coconut/55 hover:text-coconut hover:bg-coconut/10 transition-colors">
            <LogOut size={17} /> Déconnexion
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-coconut border-b border-mist">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-charcoal">
            <Menu size={22} />
          </button>
          <OhaanaLogo size="sm" />
          <div className="w-8" />
        </header>

        <main className="flex-1 p-5 md:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'apercu'         && <AperçuPanel goTo={goTo} />}
              {activeTab === 'voyages'        && <VoyagesPanel />}
              {activeTab === 'favoris'        && <FavorisPanel />}
              {activeTab === 'preferences'    && <PreferencesPanel />}
              {activeTab === 'paiement'       && <PaiementPanel />}
              {activeTab === 'notifications'  && <NotificationsPanel />}
              {activeTab === 'parametres'     && <ParamètresPanel onLogout={handleLogout} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

// ─── Guest fallback ───────────────────────────────────────────────────────────

function GuestProfile() {
  return (
    <div className="min-h-screen bg-coconut pt-16 pb-24">
      <div className="mx-auto max-w-sm px-4 py-14 space-y-6 text-center">
        <div className="w-20 h-20 rounded-full bg-mist flex items-center justify-center mx-auto">
          <User size={36} className="text-stone" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-charcoal">Votre espace Ohaana</h1>
          <p className="text-sm text-stone mt-2 leading-relaxed">Retrouvez vos réservations, favoris et préférences en un clic.</p>
        </div>
        <div className="space-y-2.5">
          <Link href="/register"><Button fullWidth>Créer un compte</Button></Link>
          <Link href="/login"><Button fullWidth variant="outline">Se connecter</Button></Link>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { isLoggedIn } = useDemoAuth()
  return isLoggedIn ? <ClientSpace /> : <GuestProfile />
}
