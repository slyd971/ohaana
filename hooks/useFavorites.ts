'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthProvider'

const KEY = 'ohaana_favorites'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function readLocal(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === 'string' && UUID_RE.test(v)) : []
  } catch {
    return []
  }
}

function writeLocal(ids: Iterable<string>) {
  try { localStorage.setItem(KEY, JSON.stringify([...ids])) } catch {}
}

/**
 * Favourites: stored in the `favorites` table for signed-in users, in localStorage for guests
 * (and in demo mode). Guest favourites are merged into the account on sign-in.
 */
export function useFavorites() {
  const { user, loading, isDemo } = useAuth()
  const userId = user?.id ?? null
  const remote = userId !== null && !isDemo
  const [ids, setIds] = useState<Set<string>>(new Set())
  const idsRef = useRef(ids)
  useEffect(() => { idsRef.current = ids }, [ids])

  useEffect(() => {
    if (loading) return
    let active = true

    async function init() {
      const local = readLocal()
      if (!remote || !userId) {
        if (active) setIds(new Set(local))
        return
      }
      const supabase = createClient()
      if (local.length > 0) {
        const { error } = await supabase
          .from('favorites')
          .upsert(local.map((service_id) => ({ user_id: userId, service_id })), { onConflict: 'user_id,service_id', ignoreDuplicates: true })
        if (!error) writeLocal([])
      }
      const { data } = await supabase.from('favorites').select('service_id')
      if (active) setIds(new Set((data ?? []).map((r) => r.service_id as string)))
    }

    void init()
    return () => { active = false }
  }, [remote, loading, userId])

  const toggle = useCallback(async (serviceId: string) => {
    const had = idsRef.current.has(serviceId)
    const next = new Set(idsRef.current)
    if (had) next.delete(serviceId); else next.add(serviceId)
    setIds(next)

    if (!remote || !userId) {
      writeLocal(next)
      return
    }
    const supabase = createClient()
    const { error } = had
      ? await supabase.from('favorites').delete().eq('user_id', userId).eq('service_id', serviceId)
      : await supabase.from('favorites').insert({ user_id: userId, service_id: serviceId })
    if (error) {
      // revert the optimistic update
      setIds((cur) => {
        const back = new Set(cur)
        if (had) back.add(serviceId); else back.delete(serviceId)
        return back
      })
    }
  }, [remote, userId])

  return { favorites: ids, toggleFavorite: toggle }
}
