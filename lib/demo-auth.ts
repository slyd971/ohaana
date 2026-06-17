export type DemoRole = 'client' | 'provider' | null

const KEY = 'ohaana_demo_role'

export function getDemoRole(): DemoRole {
  if (typeof window === 'undefined') return null
  const r = localStorage.getItem(KEY)
  return r === 'client' || r === 'provider' ? r : null
}

export function setDemoRole(role: DemoRole) {
  if (typeof window === 'undefined') return
  if (role) localStorage.setItem(KEY, role)
  else localStorage.removeItem(KEY)
}
