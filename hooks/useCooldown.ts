'use client'

import { useCallback, useEffect, useState } from 'react'

/** Client-side cooldown (UX only; real rate limiting is enforced by Supabase). */
export function useCooldown() {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (remaining <= 0) return
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [remaining])

  const start = useCallback((seconds: number) => setRemaining(seconds), [])
  return { remaining, start }
}
