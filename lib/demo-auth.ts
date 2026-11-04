export type DemoRole = 'client' | 'provider' | 'partner' | null

const KEY = 'ohaana_demo_role'
const EVENT = 'ohaana-demo-role-change'

export function getDemoRole(): DemoRole {
  if (typeof window === 'undefined') return null
  try {
    const r = localStorage.getItem(KEY)
    return r === 'client' || r === 'provider' || r === 'partner' ? r : null
  } catch {
    return null
  }
}

export function setDemoRole(role: DemoRole) {
  if (typeof window === 'undefined') return
  try {
    if (role) localStorage.setItem(KEY, role)
    else localStorage.removeItem(KEY)
  } catch {}
  window.dispatchEvent(new Event(EVENT))
}

// External-store API (useSyncExternalStore): same-tab changes + cross-tab "storage" events.
export function subscribeDemoRole(callback: () => void) {
  function onStorage(e: StorageEvent) {
    if (e.key === KEY) callback()
  }
  window.addEventListener('storage', onStorage)
  window.addEventListener(EVENT, callback)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(EVENT, callback)
  }
}
