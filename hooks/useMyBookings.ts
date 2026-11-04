'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthProvider'

export type BookingDisplayStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface BookingItem {
  id: string
  serviceId: string
  title: { fr: string; en: string; es: string }
  island: string
  providerName: string
  coverUrl: string | null
  date: string // YYYY-MM-DD in Antilles local time
  time: string // HH:MM
  guests: number
  totalCents: number
  status: BookingDisplayStatus
  rawStatus: string
  startsAt: string | null
  upcoming: boolean
}

const TZ = 'America/Guadeloupe'

function localParts(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: '', time: '' }
  // sv-SE renders "YYYY-MM-DD HH:MM:SS"
  const s = new Date(iso).toLocaleString('sv-SE', { timeZone: TZ })
  return { date: s.slice(0, 10), time: s.slice(11, 16) }
}

function displayStatus(raw: string): BookingDisplayStatus {
  if (raw === 'pending' || raw === 'confirmed' || raw === 'completed') return raw
  return 'cancelled' // cancelled_tourist, cancelled_provider, expired, disputed
}

type BookingRow = {
  id: string
  status: string
  guests_count: number
  total_cents: number
  starts_at: string | null
  service_id: string
  services: {
    id: string; title_fr: string; title_en: string | null; title_es: string | null; island: string; provider_id: string
    service_images: { url: string; is_cover: boolean; sort_order: number }[]
  } | null
}

/** The signed-in tourist's bookings (RLS: only their own). Demo mode and guests get an empty list. */
export function useMyBookings() {
  const { user, loading: authLoading, isDemo } = useAuth()
  const userId = user?.id ?? null
  const enabled = userId !== null && !isDemo
  const [state, setState] = useState<{ items: BookingItem[]; loading: boolean; error: boolean }>({ items: [], loading: true, error: false })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (authLoading) return
    let active = true

    async function load() {
      if (!enabled) {
        if (active) setState({ items: [], loading: false, error: false })
        return
      }
      const supabase = createClient()
      const { data, error } = await supabase
        .from('bookings')
        .select('id, status, guests_count, total_cents, starts_at, service_id, services ( id, title_fr, title_en, title_es, island, provider_id, service_images ( url, is_cover, sort_order ) )')
        .order('starts_at', { ascending: true })
      if (!active) return
      if (error) {
        setState({ items: [], loading: false, error: true })
        return
      }
      const rows = (data ?? []) as unknown as BookingRow[]
      const providerIds = [...new Set(rows.map((r) => r.services?.provider_id).filter((v): v is string => Boolean(v)))]
      const names = new Map<string, string>()
      if (providerIds.length > 0) {
        const { data: providers } = await supabase.from('public_provider_profiles').select('id, business_name').in('id', providerIds)
        for (const p of providers ?? []) names.set(p.id as string, p.business_name as string)
      }
      if (!active) return

      const now = Date.now()
      const items = rows.map<BookingItem>((r) => {
        const svc = r.services
        const cover = svc?.service_images?.slice().sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)[0]
        const { date, time } = localParts(r.starts_at)
        const status = displayStatus(r.status)
        return {
          id: r.id,
          serviceId: r.service_id,
          title: { fr: svc?.title_fr ?? 'Service', en: svc?.title_en ?? svc?.title_fr ?? 'Service', es: svc?.title_es ?? svc?.title_en ?? svc?.title_fr ?? 'Service' },
          island: svc?.island ?? '',
          providerName: svc ? (names.get(svc.provider_id) ?? '') : '',
          coverUrl: cover?.url ?? null,
          date, time,
          guests: r.guests_count,
          totalCents: r.total_cents,
          status,
          rawStatus: r.status,
          startsAt: r.starts_at,
          upcoming: (status === 'pending' || status === 'confirmed') && (!r.starts_at || new Date(r.starts_at).getTime() > now),
        }
      })
      setState({ items, loading: false, error: false })
    }

    void load()
    return () => { active = false }
  }, [authLoading, enabled, version])

  const cancel = useCallback(async (bookingId: string, reason?: string) => {
    const { error } = await createClient().rpc('cancel_booking', { p_booking_id: bookingId, p_reason: reason ?? null })
    if (!error) setVersion((v) => v + 1)
    return !error
  }, [])

  return { ...state, cancel }
}
