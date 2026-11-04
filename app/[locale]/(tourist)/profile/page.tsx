'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { OhaanaLogo } from '@/components/layout/OhaanaLogo'
import { ServiceCard } from '@/components/service/ServiceCard'
import { NotificationsList } from '@/components/account/NotificationsList'
import { useAuth } from '@/lib/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { loadServicesByIds } from '@/app/actions/catalogue'
import { useFavorites } from '@/hooks/useFavorites'
import { useMyBookings } from '@/hooks/useMyBookings'
import { useTouristProfile, type TouristPrefs } from '@/hooks/useTouristProfile'
import type { ServiceView } from '@/lib/data/types'
import { formatPrice, cn } from '@/lib/utils'
import {
  LayoutDashboard, CalendarDays, Heart, Sparkles, CreditCard, Bell, Settings, LogOut, Menu,
  User, MessageCircle, Check, ShieldCheck,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Tab = 'apercu' | 'voyages' | 'favoris' | 'preferences' | 'paiement' | 'notifications' | 'parametres'

const NAV: { key: Tab; label: string; Icon: React.ElementType }[] = [
  { key: 'apercu',        label: 'Aperçu',       Icon: LayoutDashboard },
  { key: 'voyages',       label: 'Mes voyages',  Icon: CalendarDays },
  { key: 'favoris',       label: 'Mes favoris',  Icon: Heart },
  { key: 'preferences',   label: 'Préférences',  Icon: Sparkles },
  { key: 'paiement',      label: 'Paiement',     Icon: CreditCard },
  { key: 'notifications', label: 'Notifications', Icon: Bell },
  { key: 'parametres',    label: 'Paramètres',   Icon: Settings },
]

const ISLANDS = [
  { id: 'guadeloupe', label: 'Guadeloupe' }, { id: 'martinique', label: 'Martinique' },
  { id: 'saint_martin', label: 'Saint-Martin' }, { id: 'saint_barth', label: 'Saint-Barth' },
]
const MOODS = [
  { id: 'relax', label: 'Détente & spa' }, { id: 'gourmet', label: 'Gastronomie' }, { id: 'sport', label: 'Sport & nature' },
  { id: 'photo', label: 'Photo & souvenirs' }, { id: 'party', label: 'Fête & ambiance' }, { id: 'culture', label: 'Culture locale' },
  { id: 'romance', label: 'Romantique' }, { id: 'family', label: 'En famille' },
]
const TRAVELER_TYPES = [
  { id: 'couple', label: 'En couple' }, { id: 'family', label: 'En famille' }, { id: 'friends', label: 'Entre amis' }, { id: 'solo', label: 'En solo' },
] as const

const STATUS_CFG = {
  confirmed: { label: 'Confirmé',   color: 'text-turquoise bg-turquoise/10' },
  pending:   { label: 'En attente', color: 'text-[#F5A623] bg-[#F5A623]/10' },
  completed: { label: 'Terminé',    color: 'text-stone bg-stone/10' },
  cancelled: { label: 'Annulé',     color: 'text-stone bg-stone/10' },
}

function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn('px-4 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-2', active ? 'bg-deep-green/10 border-deep-green/40 text-deep-green' : 'bg-coconut border-mist text-stone hover:border-deep-green/20 hover:text-charcoal')}>
      {active && <Check size={12} />}{children}
    </button>
  )
}

function EmptyNote({ title, sub, href, cta }: { title: string; sub: string; href: string; cta: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-mist bg-surface p-8 text-center space-y-2">
      <p className="font-medium text-charcoal">{title}</p>
      <p className="text-sm text-stone">{sub}</p>
      <Link href={href}><Button variant="outline" className="mt-2">{cta}</Button></Link>
    </div>
  )
}

// ─── Panels ──────────────────────────────────────────────────────────────────

function AperçuPanel({ goTo }: { goTo: (t: Tab) => void }) {
  const { user } = useAuth()
  const { items, loading } = useMyBookings()
  const { favorites } = useFavorites()
  const upcoming = items.filter((b) => b.upcoming)
  const first = (user?.fullName ?? '').split(' ')[0]

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-display text-charcoal">Bonjour{first ? `, ${first}` : ''} 👋</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <button type="button" onClick={() => goTo('voyages')} className="p-4 bg-surface border border-mist rounded-2xl text-left hover:border-deep-green/30 transition-colors">
          <CalendarDays size={18} className="text-turquoise mb-2" />
          <p className="text-2xl font-display text-charcoal">{loading ? '–' : upcoming.length}</p>
          <p className="text-xs text-stone mt-0.5">Réservations à venir</p>
        </button>
        <button type="button" onClick={() => goTo('favoris')} className="p-4 bg-surface border border-mist rounded-2xl text-left hover:border-deep-green/30 transition-colors">
          <Heart size={18} className="text-coral mb-2" />
          <p className="text-2xl font-display text-charcoal">{favorites.size}</p>
          <p className="text-xs text-stone mt-0.5">Favoris</p>
        </button>
      </div>

      {upcoming.length > 0 ? (
        <div className="rounded-2xl border border-mist bg-surface p-4 space-y-1">
          <p className="text-xs uppercase tracking-wider text-stone">Prochaine expérience</p>
          <p className="font-medium text-charcoal">{upcoming[0].title.fr}</p>
          <p className="text-sm text-stone">{upcoming[0].date} · {upcoming[0].time} · {upcoming[0].guests} pers. · {formatPrice(upcoming[0].totalCents)}</p>
        </div>
      ) : (
        !loading && <EmptyNote title="Aucune expérience prévue" sub="Composez votre programme de séjour" href="/search" cta="Explorer" />
      )}
    </div>
  )
}

function VoyagesPanel() {
  const { items, loading, error } = useMyBookings()
  if (loading) return <p className="text-sm text-stone" role="status">Chargement…</p>
  if (error) return <p role="alert" className="text-sm text-coral">Impossible de charger vos réservations.</p>
  if (items.length === 0) return <EmptyNote title="Aucune réservation" sub="Votre prochain souvenir vous attend" href="/search" cta="Découvrir" />
  return (
    <div className="space-y-3 max-w-2xl">
      <h1 className="text-2xl font-display text-charcoal">Mes voyages</h1>
      {items.map((b) => (
        <div key={b.id} className="flex items-center gap-3 rounded-2xl border border-mist bg-surface p-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-charcoal">{b.title.fr}</p>
            <p className="text-xs text-stone">{b.date} · {b.time} · {b.guests} pers. · {formatPrice(b.totalCents)}</p>
          </div>
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', STATUS_CFG[b.status].color)}>{STATUS_CFG[b.status].label}</span>
        </div>
      ))}
      <Link href="/voyages"><Button variant="outline" fullWidth>Ouvrir mon carnet de voyage</Button></Link>
    </div>
  )
}

function FavorisPanel() {
  const { favorites, toggleFavorite } = useFavorites()
  const [services, setServices] = useState<ServiceView[]>([])
  const key = [...favorites].sort().join(',')
  useEffect(() => {
    let active = true
    loadServicesByIds(key ? key.split(',') : []).then((list) => { if (active) setServices(list) })
    return () => { active = false }
  }, [key])

  if (favorites.size === 0) return <EmptyNote title="Aucun favori pour l'instant" sub="Appuyez sur ♡ pour sauvegarder des expériences" href="/search" cta="Explorer" />
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display text-charcoal">Mes favoris</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {services.map((s) => <ServiceCard key={s.id} service={s} isFavorite onToggleFavorite={toggleFavorite} size="lg" className="w-full" />)}
      </div>
    </div>
  )
}

function PreferencesPanel() {
  const { prefs, setPrefs, loading, save, canSave } = useTouristProfile()
  const [saved, setSaved] = useState<'idle' | 'ok' | 'error'>('idle')
  const [busy, setBusy] = useState(false)

  const update = (patch: Partial<TouristPrefs>) => { setPrefs({ ...prefs, ...patch }); setSaved('idle') }
  const toggleInterest = (id: string) =>
    update({ interests: prefs.interests.includes(id) ? prefs.interests.filter((i) => i !== id) : [...prefs.interests, id] })

  async function handleSave() {
    setBusy(true)
    setSaved((await save(prefs)) ? 'ok' : 'error')
    setBusy(false)
  }

  if (loading) return <p className="text-sm text-stone" role="status">Chargement…</p>

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-display text-charcoal">Préférences</h1>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-charcoal">Île de séjour</h2>
        <div className="flex flex-wrap gap-2">
          {ISLANDS.map((i) => <ToggleChip key={i.id} active={prefs.island === i.id} onClick={() => update({ island: i.id })}>{i.label}</ToggleChip>)}
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-charcoal">Vous voyagez</h2>
        <div className="flex flex-wrap gap-2">
          {TRAVELER_TYPES.map((t) => <ToggleChip key={t.id} active={prefs.traveler_type === t.id} onClick={() => update({ traveler_type: t.id })}>{t.label}</ToggleChip>)}
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-charcoal">Centres d’intérêt</h2>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => <ToggleChip key={m.id} active={prefs.interests.includes(m.id)} onClick={() => toggleInterest(m.id)}>{m.label}</ToggleChip>)}
        </div>
      </section>
      {canSave ? (
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} loading={busy}>Enregistrer</Button>
          {saved === 'ok' && <span role="status" className="text-sm text-deep-green">Préférences enregistrées</span>}
          {saved === 'error' && <span role="alert" className="text-sm text-coral">Enregistrement impossible</span>}
        </div>
      ) : (
        <p className="text-sm text-stone">Connectez-vous avec un compte pour enregistrer vos préférences.</p>
      )}
    </div>
  )
}

function PaiementPanel() {
  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-display text-charcoal">Paiement</h1>
      <div className="flex items-start gap-3 rounded-2xl border border-mist bg-surface p-5 text-sm text-stone">
        <ShieldCheck size={18} className="mt-0.5 flex-none text-deep-green" />
        <p>
          Vous réglez chaque réservation au moment de la commande, avec un paiement sécurisé par Stripe.
          Ohaana ne stocke jamais vos coordonnées bancaires. Vos reçus seront disponibles ici dès l’ouverture des paiements.
        </p>
      </div>
    </div>
  )
}

function ParamètresPanel({ onLogout }: { onLogout: () => void }) {
  const { user, isDemo } = useAuth()
  const [name, setName] = useState(user?.fullName ?? '')
  const [state, setState] = useState<'idle' | 'ok' | 'error'>('idle')
  const [busy, setBusy] = useState(false)

  async function saveName(e: React.FormEvent) {
    e.preventDefault()
    if (!user || isDemo || name.trim().length < 2) return
    setBusy(true)
    const { error } = await createClient().from('users').update({ full_name: name.trim() }).eq('id', user.id)
    setState(error ? 'error' : 'ok')
    setBusy(false)
  }

  return (
    <div className="space-y-6 max-w-md">
      <h1 className="text-2xl font-display text-charcoal">Paramètres</h1>
      <form onSubmit={saveName} className="space-y-3">
        <Input label="Nom complet" value={name} onChange={(e) => { setName(e.target.value); setState('idle') }} autoComplete="name" />
        <Input label="Adresse email" value={user?.email ?? ''} readOnly disabled hint="Pour changer d’adresse email, contactez-nous." />
        <div className="flex items-center gap-3">
          <Button type="submit" loading={busy} disabled={isDemo}>Enregistrer</Button>
          {state === 'ok' && <span role="status" className="text-sm text-deep-green">Enregistré</span>}
          {state === 'error' && <span role="alert" className="text-sm text-coral">Enregistrement impossible</span>}
        </div>
      </form>
      <div className="space-y-2 border-t border-mist pt-5">
        <Link href="/settings" className="block text-sm text-deep-green hover:underline">Mot de passe et langue</Link>
        <button type="button" onClick={onLogout} className="flex items-center gap-2 text-sm text-coral hover:underline"><LogOut size={15} /> Se déconnecter</button>
      </div>
    </div>
  )
}

// ─── Connected layout ─────────────────────────────────────────────────────────

function ClientSpace() {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('apercu')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const display = user?.fullName ?? user?.email ?? ''
  const initials = display.split(/[\s@]/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?'

  function goTo(tab: Tab) { setActiveTab(tab); setSidebarOpen(false) }

  return (
    <div className="min-h-dvh flex bg-sand">
      <aside className={cn('fixed inset-y-0 left-0 z-40 w-60 bg-deep-green flex flex-col transition-transform duration-300', 'md:translate-x-0 md:static', sidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="px-5 py-5 border-b border-coconut/10">
          <OhaanaLogo variant="light" size="sm" />
          <p className="text-coconut/40 text-[11px] mt-1 uppercase tracking-widest">Espace voyageur</p>
        </div>
        <div className="px-5 py-4 border-b border-coconut/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-turquoise/30 flex items-center justify-center shrink-0">
            <span className="text-coconut text-sm font-display">{initials}</span>
          </div>
          <p className="min-w-0 truncate text-sm font-medium text-coconut">{display}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ key, label, Icon }) => (
            <button key={key} type="button" onClick={() => goTo(key)} className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left', activeTab === key ? 'bg-coconut/15 text-coconut' : 'text-coconut/55 hover:text-coconut hover:bg-coconut/10')}>
              <Icon size={17} /> {label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-coconut/10 space-y-0.5">
          <Link href="/concierge" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-coconut/55 hover:text-coconut hover:bg-coconut/10 transition-colors">
            <MessageCircle size={17} /> Concierge
          </Link>
          <button type="button" onClick={() => void signOut()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-coconut/55 hover:text-coconut hover:bg-coconut/10 transition-colors">
            <LogOut size={17} /> Déconnexion
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-coconut border-b border-mist">
          <button type="button" onClick={() => setSidebarOpen(true)} className="p-1.5 text-charcoal" aria-label="Menu"><Menu size={22} /></button>
          <OhaanaLogo size="sm" />
          <div className="w-8" />
        </header>
        <main className="flex-1 p-5 md:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>
              {activeTab === 'apercu' && <AperçuPanel goTo={goTo} />}
              {activeTab === 'voyages' && <VoyagesPanel />}
              {activeTab === 'favoris' && <FavorisPanel />}
              {activeTab === 'preferences' && <PreferencesPanel />}
              {activeTab === 'paiement' && <PaiementPanel />}
              {activeTab === 'notifications' && <div className="max-w-2xl space-y-4"><h1 className="text-2xl font-display text-charcoal">Notifications</h1><NotificationsList /></div>}
              {activeTab === 'parametres' && <ParamètresPanel onLogout={() => void signOut()} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

function GuestProfile() {
  return (
    <div className="min-h-screen bg-coconut pt-16 pb-24">
      <div className="mx-auto max-w-sm px-4 py-14 space-y-6 text-center">
        <div className="w-20 h-20 rounded-full bg-mist flex items-center justify-center mx-auto"><User size={36} className="text-stone" /></div>
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

export default function ProfilePage() {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? <ClientSpace /> : <GuestProfile />
}
