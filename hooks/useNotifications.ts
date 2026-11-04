'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthProvider'

export interface NotificationItem {
  id: string
  type: string
  title_fr: string
  title_en: string | null
  body_fr: string | null
  body_en: string | null
  payload: Record<string, unknown>
  is_read: boolean
  created_at: string
}

/** The signed-in user's notifications (RLS: only their own). Notifications are created server-side only. */
export function useNotifications() {
  const { user, loading: authLoading, isDemo } = useAuth()
  const userId = user?.id ?? null
  const enabled = userId !== null && !isDemo
  const [state, setState] = useState<{ items: NotificationItem[]; loading: boolean; error: boolean }>({ items: [], loading: true, error: false })

  useEffect(() => {
    if (authLoading) return
    let active = true
    async function load() {
      if (!enabled) {
        if (active) setState({ items: [], loading: false, error: false })
        return
      }
      const { data, error } = await createClient()
        .from('notifications')
        .select('id, type, title_fr, title_en, body_fr, body_en, payload, is_read, created_at')
        .order('created_at', { ascending: false })
        .limit(50)
      if (!active) return
      setState({ items: (data ?? []) as NotificationItem[], loading: false, error: Boolean(error) })
    }
    void load()
    return () => { active = false }
  }, [authLoading, enabled])

  const markRead = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return
    setState((s) => ({ ...s, items: s.items.map((n) => (ids.includes(n.id) ? { ...n, is_read: true } : n)) }))
    await createClient().from('notifications').update({ is_read: true }).in('id', ids)
  }, [])

  return { ...state, unread: state.items.filter((n) => !n.is_read).length, markRead }
}
