'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
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
import { cn } from '@/lib/utils'
import { useFormat } from '@/hooks/useFormat'
import { toLang } from '@/lib/i18n/format'
import {
  LayoutDashboard, CalendarDays, Heart, Sparkles, CreditCard, Bell, Settings, LogOut, Menu,
  User, MessageCircle, Check, ShieldCheck,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Tab = 'apercu' | 'voyages' | 'favoris' | 'preferences' | 'paiement' | 'notifications' | 'parametres'

const NAV: { key: Tab; Icon: React.ElementType }[] = [
  { key: 'apercu',        Icon: LayoutDashboard },
  { key: 'voyages',       Icon: CalendarDays },
  { key: 'favoris',       Icon: Heart },
  { key: 'preferences',   Icon: Sparkles },
  { key: 'paiement',      Icon: CreditCard },
  { key: 'notifications', Icon: Bell },
  { key: 'parametres',    Icon: Settings },
]

const ISLANDS = [
  { id: 'guadeloupe', label: 'Guadeloupe' }, { id: 'martinique', label: 'Martinique' },
  { id: 'saint_martin', label: 'Saint-Martin' }, { id: 'saint_barth', label: 'Saint-Barth' },
]
const MOODS = ['relax', 'gourmet', 'sport', 'photo', 'party', 'culture', 'romance', 'family'] as const
const TRAVELER_TYPES = ['couple', 'family', 'friends', 'solo'] as const

const STATUS_CFG = {
  confirmed: { key: 'statusConfirmed', color: 'text-turquoise-text bg-turquoise/10' },
  pending:   { key: 'statusPending',   color: 'text-star bg-star/10' },
  completed: { key: 'statusCompleted', color: 'text-stone bg-stone/10' },
  cancelled: { key: 'statusCancelled', color: 'text-stone bg-stone/10' },
} as const

function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn('px-4 py-2 rounded-control text-sm font-medium border transition-all flex items-center gap-2', active ? 'bg-deep-green/10 border-deep-green/40 text-deep-green' : 'bg-coconut border-mist text-stone hover:border-deep-green/20 hover:text-charcoal')}>
      {active && <Check size={12} />}{children}
    </button>
  )
}

function EmptyNote({ title, sub, href, cta }: { title: string; sub: string; href: string; cta: string }) {
  return (
    <div className="rounded-card border border-dashed border-mist bg-surface p-8 text-center space-y-2">
      <p className="font-medium text-charcoal">{title}</p>
      <p className="text-sm text-stone">{sub}</p>
      <Link href={href}><Button variant="outline" className="mt-2">{cta}</Button></Link>
    </div>
  )
}

// ─── Panels ──────────────────────────────────────────────────────────────────

function AperçuPanel({ goTo }: { goTo: (t: Tab) => void }) {
  const t = useTranslations('profilePage')
  const tt = useTranslations('trips')
  const fmt = useFormat()
  const lang = toLang(useLocale())
  const { user } = useAuth()
  const { items, loading } = useMyBookings()
  const { favorites } = useFavorites()
  const upcoming = items.filter((b) => b.upcoming)
  const first = (user?.fullName ?? '').split(' ')[0]

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-display text-charcoal">{first ? t('helloNamed', { name: first }) : t('hello')}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <button type="button" onClick={() => goTo('voyages')} className="p-4 bg-surface border border-mist rounded-card text-left hover:border-deep-green/30 transition-colors">
          <CalendarDays size={18} className="text-turquoise-text mb-2" />
          <p className="text-2xl font-display text-charcoal">{loading ? '–' : upcoming.length}</p>
          <p className="text-xs text-stone mt-0.5">{t('upcomingBookings')}</p>
        </button>
        <button type="button" onClick={() => goTo('favoris')} className="p-4 bg-surface border border-mist rounded-card text-left hover:border-deep-green/30 transition-colors">
          <Heart size={18} className="text-coral-text mb-2" />
          <p className="text-2xl font-display text-charcoal">{favorites.size}</p>
          <p className="text-xs text-stone mt-0.5">{t('favorites')}</p>
        </button>
      </div>

      {upcoming.length > 0 ? (
        <div className="rounded-card border border-mist bg-surface p-4 space-y-1">
          <p className="text-xs uppercase tracking-wider text-stone">{t('nextExperience')}</p>
          <p className="font-medium text-charcoal">{upcoming[0].title[lang]}</p>
          <p className="text-sm text-stone">{fmt.date(new Date(`${upcoming[0].date}T12:00:00`), { day: 'numeric', month: 'long' })} · {upcoming[0].time} · {tt('guestsShort', { count: upcoming[0].guests })} · {fmt.price(upcoming[0].totalCents)}</p>
        </div>
      ) : (
        !loading && <EmptyNote title={tt('emptyUpcomingTitle')} sub={tt('emptyUpcomingSub')} href="/search" cta={tt('explore')} />
      )}
    </div>
  )
}

function VoyagesPanel() {
  const t = useTranslations('profilePage')
  const tt = useTranslations('trips')
  const fmt = useFormat()
  const lang = toLang(useLocale())
  const { items, loading, error } = useMyBookings()
  if (loading) return <p className="text-sm text-stone" role="status">{t('loading')}</p>
  if (error) return <p role="alert" className="text-sm text-coral-text">{t('loadBookingsError')}</p>
  if (items.length === 0) return <EmptyNote title={t('noBookingsTitle')} sub={tt('emptyPastSub')} href="/search" cta={tt('discover')} />
  return (
    <div className="space-y-3 max-w-2xl">
      <h1 className="text-2xl font-display text-charcoal">{t('nav.voyages')}</h1>
      {items.map((b) => (
        <div key={b.id} className="flex items-center gap-3 rounded-card border border-mist bg-surface p-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-charcoal">{b.title[lang]}</p>
            <p className="text-xs text-stone">{fmt.date(new Date(`${b.date}T12:00:00`), { day: 'numeric', month: 'short' })} · {b.time} · {tt('guestsShort', { count: b.guests })} · {fmt.price(b.totalCents)}</p>
          </div>
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', STATUS_CFG[b.status].color)}>{tt(STATUS_CFG[b.status].key)}</span>
        </div>
      ))}
      <Link href="/voyages"><Button variant="outline" fullWidth>{t('openCarnet')}</Button></Link>
    </div>
  )
}

function FavorisPanel() {
  const t = useTranslations('profilePage')
  const tt = useTranslations('trips')
  const { favorites, toggleFavorite } = useFavorites()
  const [services, setServices] = useState<ServiceView[]>([])
  const key = [...favorites].sort().join(',')
  useEffect(() => {
    let active = true
    loadServicesByIds(key ? key.split(',') : []).then((list) => { if (active) setServices(list) })
    return () => { active = false }
  }, [key])

  if (favorites.size === 0) return <EmptyNote title={tt('emptyFavTitle')} sub={tt('emptyFavSub')} href="/search" cta={tt('explore')} />
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display text-charcoal">{t('nav.favoris')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {services.map((s) => <ServiceCard key={s.id} service={s} isFavorite onToggleFavorite={toggleFavorite} size="lg" className="w-full" />)}
      </div>
    </div>
  )
}

function PreferencesPanel() {
  const t = useTranslations('profilePage')
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

  if (loading) return <p className="text-sm text-stone" role="status">{t('loading')}</p>

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-display text-charcoal">{t('nav.preferences')}</h1>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-charcoal">{t('stayIsland')}</h2>
        <div className="flex flex-wrap gap-2">
          {ISLANDS.map((i) => <ToggleChip key={i.id} active={prefs.island === i.id} onClick={() => update({ island: i.id })}>{i.label}</ToggleChip>)}
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-charcoal">{t('youTravel')}</h2>
        <div className="flex flex-wrap gap-2">
          {TRAVELER_TYPES.map((id) => <ToggleChip key={id} active={prefs.traveler_type === id} onClick={() => update({ traveler_type: id })}>{t(`traveler.${id}`)}</ToggleChip>)}
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-charcoal">{t('interests')}</h2>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((id) => <ToggleChip key={id} active={prefs.interests.includes(id)} onClick={() => toggleInterest(id)}>{t(`moods.${id}`)}</ToggleChip>)}
        </div>
      </section>
      {canSave ? (
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} loading={busy}>{t('save')}</Button>
          {saved === 'ok' && <span role="status" className="text-sm text-deep-green">{t('prefsSaved')}</span>}
          {saved === 'error' && <span role="alert" className="text-sm text-coral-text">{t('saveError')}</span>}
        </div>
      ) : (
        <p className="text-sm text-stone">{t('loginToSave')}</p>
      )}
    </div>
  )
}

function PaiementPanel() {
  const t = useTranslations('profilePage')
  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-display text-charcoal">{t('nav.paiement')}</h1>
      <div className="flex items-start gap-3 rounded-card border border-mist bg-surface p-5 text-sm text-stone">
        <ShieldCheck size={18} className="mt-0.5 flex-none text-deep-green" />
        <p>{t('paymentBody')}</p>
      </div>
    </div>
  )
}

function ParamètresPanel({ onLogout }: { onLogout: () => void }) {
  const t = useTranslations('profilePage')
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
      <h1 className="text-2xl font-display text-charcoal">{t('nav.parametres')}</h1>
      <form onSubmit={saveName} className="space-y-3">
        <Input label={t('fullName')} value={name} onChange={(e) => { setName(e.target.value); setState('idle') }} autoComplete="name" />
        <Input label={t('email')} value={user?.email ?? ''} readOnly disabled hint={t('emailHint')} />
        <div className="flex items-center gap-3">
          <Button type="submit" loading={busy} disabled={isDemo}>{t('save')}</Button>
          {state === 'ok' && <span role="status" className="text-sm text-deep-green">{t('saved')}</span>}
          {state === 'error' && <span role="alert" className="text-sm text-coral-text">{t('saveError')}</span>}
        </div>
      </form>
      <div className="space-y-2 border-t border-mist pt-5">
        <Link href="/settings" className="block text-sm text-deep-green hover:underline">{t('passwordAndLanguage')}</Link>
        <button type="button" onClick={onLogout} className="flex items-center gap-2 text-sm text-coral-text hover:underline"><LogOut size={15} /> {t('logout')}</button>
      </div>
    </div>
  )
}

// ─── Connected layout ─────────────────────────────────────────────────────────

function ClientSpace() {
  const t = useTranslations('profilePage')
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
          <p className="text-coconut/40 text-[11px] mt-1 uppercase tracking-widest">{t('travellerSpace')}</p>
        </div>
        <div className="px-5 py-4 border-b border-coconut/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-turquoise/30 flex items-center justify-center shrink-0">
            <span className="text-coconut text-sm font-display">{initials}</span>
          </div>
          <p className="min-w-0 truncate text-sm font-medium text-coconut">{display}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ key, Icon }) => (
            <button key={key} type="button" onClick={() => goTo(key)} className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-control text-sm font-medium transition-colors text-left', activeTab === key ? 'bg-coconut/15 text-coconut' : 'text-coconut/55 hover:text-coconut hover:bg-coconut/10')}>
              <Icon size={17} /> {t(`nav.${key}`)}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-coconut/10 space-y-0.5">
          <Link href="/concierge" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-control text-sm text-coconut/55 hover:text-coconut hover:bg-coconut/10 transition-colors">
            <MessageCircle size={17} /> {t('concierge')}
          </Link>
          <button type="button" onClick={() => void signOut()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-control text-sm text-coconut/55 hover:text-coconut hover:bg-coconut/10 transition-colors">
            <LogOut size={17} /> {t('logoutShort')}
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-coconut border-b border-mist">
          <button type="button" onClick={() => setSidebarOpen(true)} className="p-1.5 text-charcoal" aria-label={t('menu')}><Menu size={22} /></button>
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
              {activeTab === 'notifications' && <div className="max-w-2xl space-y-4"><h1 className="text-2xl font-display text-charcoal">{t('nav.notifications')}</h1><NotificationsList /></div>}
              {activeTab === 'parametres' && <ParamètresPanel onLogout={() => void signOut()} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

function GuestProfile() {
  const t = useTranslations('profilePage')
  const tt = useTranslations('trips')
  return (
    <div className="min-h-screen bg-coconut pt-16 pb-24">
      <div className="mx-auto max-w-sm px-4 py-14 space-y-6 text-center">
        <div className="w-20 h-20 rounded-full bg-mist flex items-center justify-center mx-auto"><User size={36} className="text-stone" /></div>
        <div>
          <h1 className="font-display text-2xl text-charcoal">{t('guestTitle')}</h1>
          <p className="text-sm text-stone mt-2 leading-relaxed">{t('guestBody')}</p>
        </div>
        <div className="space-y-2.5">
          <Link href="/register"><Button fullWidth>{tt('createAccount')}</Button></Link>
          <Link href="/login"><Button fullWidth variant="outline">{tt('signIn')}</Button></Link>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? <ClientSpace /> : <GuestProfile />
}
