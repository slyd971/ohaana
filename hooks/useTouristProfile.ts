'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthProvider'

export interface TouristPrefs {
  traveler_type: 'couple' | 'family' | 'friends' | 'solo' | null
  interests: string[]
  island: string | null
}

const EMPTY: TouristPrefs = { traveler_type: null, interests: [], island: null }

/** Read / write the signed-in tourist's preferences (tourist_profiles, RLS: own row only). */
export function useTouristProfile() {
  const { user, loading: authLoading, isDemo } = useAuth()
  const userId = user?.id ?? null
  const enabled = userId !== null && !isDemo
  const [prefs, setPrefs] = useState<TouristPrefs>(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    let active = true
    async function load() {
      if (!enabled || !userId) { if (active) setLoading(false); return }
      const { data } = await createClient()
        .from('tourist_profiles').select('traveler_type, interests, island').eq('user_id', userId).maybeSingle()
      if (!active) return
      if (data) setPrefs({ traveler_type: data.traveler_type, interests: data.interests ?? [], island: data.island })
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [authLoading, enabled, userId])

  const save = useCallback(async (next: TouristPrefs) => {
    if (!enabled || !userId) return false
    const { error } = await createClient()
      .from('tourist_profiles')
      .upsert({ user_id: userId, ...next, onboarding_done: true }, { onConflict: 'user_id' })
    if (!error) setPrefs(next)
    return !error
  }, [enabled, userId])

  return { prefs, setPrefs, loading, save, canSave: enabled }
}
