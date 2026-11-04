import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { BookingClient } from '../../_components/BookingClient'
import { getAvailability, getServiceByIdOrSlug, safe } from '@/lib/data/services'
import { availabilityWindow } from '@/lib/data/dates'

export default async function BookingPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params
  const service = await safe(getServiceByIdOrSlug(serviceId), null)
  if (!service) notFound()

  const { from, to } = availabilityWindow(90)
  const slots = await safe(getAvailability(service.id, from, to), [])

  // BookingClient reads ?date=&time= (useSearchParams) → needs a Suspense boundary for static rendering.
  return (
    <Suspense>
      <BookingClient service={service} slots={slots} />
    </Suspense>
  )
}
