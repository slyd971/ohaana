'use client'

import { useState, useEffect } from 'react'
import { getDemoRole, type DemoRole } from '@/lib/demo-auth'

export function useDemoAuth() {
  const [role, setRole] = useState<DemoRole>(null)

  useEffect(() => {
    setRole(getDemoRole())
    function onStorage(e: StorageEvent) {
      if (e.key === 'ohaana_demo_role') setRole(getDemoRole())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return {
    role,
    isLoggedIn: role !== null,
    isClient: role === 'client',
    isProvider: role === 'provider',
    isGuest: role === null,
  }
}
