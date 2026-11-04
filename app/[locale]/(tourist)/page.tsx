import { HomeClient } from './_components/HomeClient'
import { EMPTY_HOME, getHomeData, safe } from '@/lib/data/services'

// Data is cached by lib/data/services.ts (tag "services", 5 min). The page itself stays dynamic: next-intl resolves
// the locale per request (no route-level `revalidate`, it would raise DYNAMIC_SERVER_USAGE).
export default async function HomePage() {
  const home = await safe(getHomeData(), EMPTY_HOME)
  return <HomeClient services={home.services} rows={home.rows} />
}
