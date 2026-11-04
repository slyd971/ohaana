'use client'

import { useSyncExternalStore } from 'react'
import { getDemoRole, subscribeDemoRole } from '@/lib/demo-auth'

/** Demo mode only: role chosen on the demo login buttons (localStorage). */
export function useDemoRole() {
  return useSyncExternalStore(subscribeDemoRole, getDemoRole, () => null)
}
