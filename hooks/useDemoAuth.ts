'use client'

import { useSyncExternalStore } from 'react'
import { getDemoRole, subscribeDemoRole } from '@/lib/demo-auth'

export function useDemoRole() {
  return useSyncExternalStore(subscribeDemoRole, getDemoRole, () => null)
}

export function useDemoAuth() {
  const role = useDemoRole()

  return {
    role,
    isLoggedIn: role !== null,
    isClient: role === 'client',
    isProvider: role === 'provider',
    isPartner: role === 'partner',
    isGuest: role === null,
  }
}
