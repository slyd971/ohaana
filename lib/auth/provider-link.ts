import { ROLE_HOME } from './types'

export const PARTNER_EMAIL = 'contact@ohaana.fr'

/**
 * Where "Become a provider" should lead, by session:
 *  - guest            → registration as a provider
 *  - provider / admin → their dashboard (the register page would bounce them to the home)
 *  - other signed-in  → an email to the team (switching a role is not self-service yet)
 */
export function providerTarget(state: { isLoggedIn: boolean; isProvider: boolean; isAdmin: boolean }) {
  if (!state.isLoggedIn) return { href: '/register?role=provider', external: false }
  if (state.isProvider || state.isAdmin) return { href: ROLE_HOME.provider, external: false }
  return { href: `mailto:${PARTNER_EMAIL}?subject=Devenir%20prestataire%20Ohaana`, external: true }
}
