import type { SupabaseClient } from '@supabase/supabase-js'

// Lectures du back-office prestataire. Le client Supabase est celui de l'utilisateur : la RLS limite déjà
// chaque requête aux lignes du prestataire connecté.

export interface ProviderService {
  id: string
  title_fr: string
  description_fr: string | null
  title_en: string | null
  description_en: string | null
  category_id: string
  island: string
  price_cents: number
  price_unit: 'per_person' | 'flat'
  duration_min: number | null
  capacity_min: number
  capacity_max: number
  address: string | null
  tags: string[]
  min_notice_hours: number
  status: 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived'
  rejection_reason: string | null
  avg_rating: number
  review_count: number
  booking_count: number
}

const SERVICE_COLUMNS =
  'id, title_fr, description_fr, title_en, description_en, category_id, island, price_cents, price_unit, duration_min, capacity_min, capacity_max, address, tags, min_notice_hours, status, rejection_reason, avg_rating, review_count, booking_count'

export async function listProviderServices(supabase: SupabaseClient): Promise<ProviderService[]> {
  const { data, error } = await supabase
    .from('services')
    .select(SERVICE_COLUMNS)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as ProviderService[]
}

export async function getProviderService(supabase: SupabaseClient, id: string): Promise<ProviderService | null> {
  const { data } = await supabase.from('services').select(SERVICE_COLUMNS).eq('id', id).maybeSingle()
  return (data as ProviderService | null) ?? null
}

export interface ProviderBooking {
  id: string
  service_id: string
  status: 'pending' | 'confirmed' | 'cancelled_tourist' | 'cancelled_provider' | 'completed' | 'disputed' | 'expired'
  guests_count: number
  notes: string | null
  total_cents: number
  starts_at: string | null
  service_address: string | null
  created_at: string
  title_fr: string
  tourist_first_name: string
}

export async function listProviderBookings(supabase: SupabaseClient, limit = 100): Promise<ProviderBooking[]> {
  const { data, error } = await supabase
    .from('provider_booking_details')
    .select('id, service_id, status, guests_count, notes, total_cents, starts_at, service_address, created_at, title_fr, tourist_first_name')
    .order('starts_at', { ascending: false, nullsFirst: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return (data ?? []) as ProviderBooking[]
}

export interface ProviderPayment {
  booking_id: string
  status: 'pending' | 'succeeded' | 'failed' | 'refunded'
  total_cents: number
  platform_fee_cents: number
  provider_amount_cents: number
  created_at: string
}

export async function listProviderPayments(supabase: SupabaseClient, limit = 100): Promise<ProviderPayment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('booking_id, status, total_cents, platform_fee_cents, provider_amount_cents, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return (data ?? []) as ProviderPayment[]
}

export interface DashboardStats {
  bookingsThisMonth: number
  netRevenueThisMonthCents: number
  netRevenueTotalCents: number
  publishedServices: number
  pendingServices: number
  honouredRate: number | null
  upcoming: ProviderBooking[]
  awaitingPayment: ProviderBooking[]
}

/** Début du mois courant (UTC) — calculé à l'appel pour rester pur côté rendu. */
export function startOfMonthIso(now: Date): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
}

export async function getDashboardStats(supabase: SupabaseClient, now: Date): Promise<DashboardStats> {
  const monthStart = startOfMonthIso(now)
  const [bookings, payments, services] = await Promise.all([
    listProviderBookings(supabase, 200),
    listProviderPayments(supabase, 500),
    listProviderServices(supabase),
  ])

  const paid = payments.filter((p) => p.status === 'succeeded')
  const bookingsThisMonth = bookings.filter(
    (b) => b.created_at >= monthStart && (b.status === 'confirmed' || b.status === 'completed'),
  ).length
  const netRevenueTotalCents = paid.reduce((sum, p) => sum + p.provider_amount_cents, 0)
  const netRevenueThisMonthCents = paid
    .filter((p) => p.created_at >= monthStart)
    .reduce((sum, p) => sum + p.provider_amount_cents, 0)

  const completed = bookings.filter((b) => b.status === 'completed').length
  const cancelledByMe = bookings.filter((b) => b.status === 'cancelled_provider').length
  const honouredRate = completed + cancelledByMe > 0 ? completed / (completed + cancelledByMe) : null

  const nowIso = now.toISOString()
  return {
    bookingsThisMonth,
    netRevenueThisMonthCents,
    netRevenueTotalCents,
    publishedServices: services.filter((s) => s.status === 'published').length,
    pendingServices: services.filter((s) => s.status === 'pending_review').length,
    honouredRate,
    upcoming: bookings
      .filter((b) => b.status === 'confirmed' && (b.starts_at ?? '') >= nowIso)
      .sort((a, b) => (a.starts_at ?? '').localeCompare(b.starts_at ?? ''))
      .slice(0, 5),
    awaitingPayment: bookings.filter((b) => b.status === 'pending').slice(0, 5),
  }
}

export interface SlotDay {
  date: string
  total: number
  free: number
  blocked: number
}

/** Créneaux à venir d'un service, regroupés par jour. */
export async function listSlotDays(supabase: SupabaseClient, serviceId: string, fromDate: string, days = 60): Promise<SlotDay[]> {
  const to = new Date(`${fromDate}T00:00:00Z`)
  to.setUTCDate(to.getUTCDate() + days)
  const { data } = await supabase
    .from('availability_slots')
    .select('date, is_available')
    .eq('service_id', serviceId)
    .gte('date', fromDate)
    .lte('date', to.toISOString().slice(0, 10))
    .order('date')
    .limit(2000)

  const byDay = new Map<string, SlotDay>()
  for (const row of (data ?? []) as { date: string; is_available: boolean }[]) {
    const d = byDay.get(row.date) ?? { date: row.date, total: 0, free: 0, blocked: 0 }
    d.total += 1
    if (row.is_available) d.free += 1
    else d.blocked += 1
    byDay.set(row.date, d)
  }
  return [...byDay.values()]
}
