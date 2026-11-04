import { notFound } from 'next/navigation'
import { ServiceDetailClient } from '../../_components/ServiceDetailClient'
import {
  getAvailability, getPublishedServices, getReviews, getServiceByIdOrSlug, safe,
} from '@/lib/data/services'
import { availabilityWindow } from '@/lib/data/dates'

const COMPLEMENT_CATEGORIES = ['chef_prive', 'photographe', 'musique', 'bar', 'evenement']

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const service = await safe(getServiceByIdOrSlug(id), null)
  if (!service) notFound()

  const { from, to } = availabilityWindow(90)
  const [slots, reviews, catalogue] = await Promise.all([
    safe(getAvailability(service.id, from, to), []),
    safe(getReviews(service.id), []),
    safe(getPublishedServices(), []),
  ])

  const related = catalogue.filter((s) => s.provider_id === service.provider_id && s.id !== service.id).slice(0, 3)
  const complements = catalogue
    .filter((s) => s.id !== service.id && COMPLEMENT_CATEGORIES.includes(s.category_slug))
    .slice(0, 5)

  return <ServiceDetailClient service={service} slots={slots} reviews={reviews} related={related} complements={complements} />
}
