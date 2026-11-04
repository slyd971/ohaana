import { ConciergeClient } from '../_components/ConciergeClient'
import { getPublishedServices, safe } from '@/lib/data/services'

export default async function ConciergePage() {
  const services = await safe(getPublishedServices(), [])
  return <ConciergeClient recommendations={services.slice(0, 6)} />
}
