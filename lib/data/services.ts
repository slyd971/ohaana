import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import type {
  CategoryView, HomeRow, ProviderView, ReviewView, SearchFilters, SearchResult,
  ServiceImageView, ServiceView, SlotView,
} from './types'

// Server-side read API for the PUBLIC catalogue. Every function is cached (tag "services"; availability
// and reviews have their own tags) and revalidated by `revalidateTag` from the back-office actions.
// Errors are thrown (never cached); pages wrap calls with `safe()` to degrade gracefully.

export const CACHE_TAGS = { services: 'services', availability: 'availability', reviews: 'reviews' } as const
const REVALIDATE_SECONDS = 300

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Log and fall back instead of failing a prerender when the database is unreachable. */
export async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise
  } catch (error) {
    console.error('[data] query failed:', error instanceof Error ? error.message : error)
    return fallback
  }
}

const SERVICE_SELECT = `
  id, slug_fr, slug_en, slug_es, provider_id, category_id,
  title_fr, title_en, title_es, description_fr, description_en, description_es,
  island, price_cents, price_unit, duration_min, capacity_min, capacity_max,
  address, latitude, longitude, is_active, is_featured, tags,
  avg_rating, review_count, booking_count, created_at, updated_at,
  service_images ( id, url, alt_fr, alt_en, alt_es, sort_order, is_cover ),
  service_categories ( slug )
`

type Row = Record<string, unknown>

function num(v: unknown, fallback = 0): number {
  const n = typeof v === 'string' ? Number(v) : (v as number)
  return Number.isFinite(n) ? n : fallback
}

function mapProvider(row: Row): ProviderView {
  return {
    id: row.id as string,
    business_name: row.business_name as string,
    bio: (row.bio as string | null) ?? null,
    bio_en: (row.bio_en as string | null) ?? null,
    bio_es: (row.bio_es as string | null) ?? null,
    languages: (row.languages as string[] | null) ?? [],
    certifications: (row.certifications as string[] | null) ?? [],
    island: row.island as ProviderView['island'],
    avg_rating: num(row.avg_rating),
    review_count: num(row.review_count),
    is_approved: true,
    user: { full_name: (row.full_name as string | null) ?? null, avatar_url: (row.avatar_url as string | null) ?? null },
  }
}

function mapService(row: Row, providers: Map<string, ProviderView>): ServiceView | null {
  const provider = providers.get(row.provider_id as string)
  if (!provider) return null // provider not public (not approved) → the service is not public either
  const real = ((row.service_images as ServiceImageView[] | null) ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
  // Une fiche créée dans le back-office peut ne pas avoir de photo : le catalogue suppose au moins une image.
  const images: ServiceImageView[] = real.length
    ? real
    : [{ id: 'placeholder', url: '/placeholder-service.svg', alt_fr: 'Photo à venir', alt_en: 'Photo coming soon', alt_es: 'Foto próximamente', sort_order: 0, is_cover: true }]
  const cat = row.service_categories as { slug: string } | null
  const fr = row.title_fr as string
  const descFr = (row.description_fr as string | null) ?? ''
  return {
    id: row.id as string,
    slug_fr: (row.slug_fr as string | null) ?? null,
    slug_en: (row.slug_en as string | null) ?? null,
    slug_es: (row.slug_es as string | null) ?? null,
    provider_id: row.provider_id as string,
    category_id: row.category_id as string,
    category_slug: cat?.slug ?? '',
    title_fr: fr,
    title_en: (row.title_en as string | null) ?? fr,
    title_es: (row.title_es as string | null) ?? (row.title_en as string | null) ?? fr,
    description_fr: descFr,
    description_en: (row.description_en as string | null) ?? descFr,
    description_es: (row.description_es as string | null) ?? (row.description_en as string | null) ?? descFr,
    island: row.island as ServiceView['island'],
    price_cents: num(row.price_cents),
    price_unit: (row.price_unit as ServiceView['price_unit']) ?? 'per_person',
    duration_min: row.duration_min === null ? null : num(row.duration_min),
    capacity_min: num(row.capacity_min, 1),
    capacity_max: num(row.capacity_max, 1),
    address: (row.address as string | null) ?? null,
    latitude: row.latitude === null ? null : num(row.latitude),
    longitude: row.longitude === null ? null : num(row.longitude),
    is_active: Boolean(row.is_active),
    is_featured: Boolean(row.is_featured),
    tags: (row.tags as string[] | null) ?? [],
    avg_rating: num(row.avg_rating),
    review_count: num(row.review_count),
    booking_count: num(row.booking_count),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    provider,
    images,
    free_cancellation_hours: null,
  }
}

async function loadProviders(ids: string[]): Promise<Map<string, ProviderView>> {
  const map = new Map<string, ProviderView>()
  const unique = [...new Set(ids)]
  if (unique.length === 0) return map
  const { data, error } = await createPublicClient()
    .from('public_provider_profiles').select('*').in('id', unique)
  if (error) throw new Error(`providers: ${error.message}`)
  for (const row of data ?? []) map.set(row.id as string, mapProvider(row as Row))
  return map
}

async function hydrate(rows: Row[]): Promise<ServiceView[]> {
  const providers = await loadProviders(rows.map((r) => r.provider_id as string))
  const services = rows.map((r) => mapService(r, providers)).filter((s): s is ServiceView => s !== null)
  const hours = await loadFreeCancellation(services.map((s) => s.id))
  return services.map((s) => ({ ...s, free_cancellation_hours: hours.get(s.id) ?? null }))
}

/**
 * Délai de remboursement intégral de chaque service, lu dans la vue publique (migration 015). Si la vue n'existe pas
 * encore ou échoue, on renvoie « inconnu » : l'interface n'affiche alors aucune promesse d'annulation chiffrée.
 */
async function loadFreeCancellation(ids: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>()
  if (ids.length === 0) return map
  try {
    const { data, error } = await createPublicClient().from('public_service_cancellation').select('service_id, free_hours').in('service_id', ids)
    if (error) return map
    for (const row of data ?? []) {
      const h = Number((row as { free_hours: number | null }).free_hours)
      if (Number.isFinite(h) && h > 0) map.set((row as { service_id: string }).service_id, h)
    }
  } catch {
    /* repli : inconnu */
  }
  return map
}

// ── Categories ────────────────────────────────────────────────────────────────
export const getCategories = unstable_cache(
  async (): Promise<CategoryView[]> => {
    const { data, error } = await createPublicClient()
      .from('service_categories')
      .select('id, slug, name_fr, name_en, name_es, icon, color, sort_order')
      .eq('is_active', true)
      .order('sort_order')
    if (error) throw new Error(`categories: ${error.message}`)
    return (data ?? []).map((c) => ({ ...c, name_es: c.name_es ?? c.name_en })) as CategoryView[]
  },
  ['categories'],
  { tags: [CACHE_TAGS.services], revalidate: REVALIDATE_SECONDS },
)

// ── Catalogue ─────────────────────────────────────────────────────────────────
/** All published services (catalogue is small at launch; switch the home to paginated queries when it grows). */
export const getPublishedServices = unstable_cache(
  async (limit = 100): Promise<ServiceView[]> => {
    const { data, error } = await createPublicClient()
      .from('services')
      .select(SERVICE_SELECT)
      .eq('status', 'published')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('booking_count', { ascending: false })
      .limit(limit)
    if (error) throw new Error(`services: ${error.message}`)
    return hydrate((data ?? []) as unknown as Row[])
  },
  ['published-services'],
  { tags: [CACHE_TAGS.services], revalidate: REVALIDATE_SECONDS },
)

/** Strip characters that have a meaning in PostgREST filter syntax. */
function sanitizeQuery(q: string): string {
  return q.replace(/[%*,()\\:"'{}]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)
}

export const searchServices = unstable_cache(
  async (filters: SearchFilters = {}): Promise<SearchResult> => {
    const page = Math.max(1, Math.floor(filters.page ?? 1))
    const pageSize = Math.min(48, Math.max(1, Math.floor(filters.pageSize ?? 12)))
    const client = createPublicClient()

    let categoryId: string | null = null
    if (filters.category) {
      const { data } = await client.from('service_categories').select('id').eq('slug', filters.category).maybeSingle()
      if (!data) return { items: [], total: 0, page, pageSize }
      categoryId = data.id as string
    }

    let query = client
      .from('services')
      .select(SERVICE_SELECT, { count: 'exact' })
      .eq('status', 'published')
      .eq('is_active', true)

    if (filters.island) query = query.eq('island', filters.island)
    if (categoryId) query = query.eq('category_id', categoryId)
    if (filters.minPriceCents !== undefined) query = query.gte('price_cents', filters.minPriceCents)
    if (filters.maxPriceCents !== undefined) query = query.lt('price_cents', filters.maxPriceCents)

    const q = filters.q ? sanitizeQuery(filters.q) : ''
    if (q) {
      const like = `%${q}%`
      query = query.or(
        [`title_fr.ilike.${like}`, `title_en.ilike.${like}`, `title_es.ilike.${like}`,
         `description_fr.ilike.${like}`, `description_en.ilike.${like}`, `tags.cs.{${q.toLowerCase().split(' ')[0]}}`].join(','),
      )
    }

    switch (filters.sort) {
      case 'price_asc': query = query.order('price_cents', { ascending: true }); break
      case 'price_desc': query = query.order('price_cents', { ascending: false }); break
      default:
        query = query.order('is_featured', { ascending: false }).order('booking_count', { ascending: false })
    }
    query = query.order('id') // stable pagination

    const from = (page - 1) * pageSize
    const { data, error, count } = await query.range(from, from + pageSize - 1)
    if (error) throw new Error(`search: ${error.message}`)

    return { items: await hydrate((data ?? []) as unknown as Row[]), total: count ?? 0, page, pageSize }
  },
  ['search-services'],
  { tags: [CACHE_TAGS.services], revalidate: REVALIDATE_SECONDS },
)

// ── Single service ────────────────────────────────────────────────────────────
/** Look a service up by UUID or by one of its localized slugs. */
export const getServiceByIdOrSlug = unstable_cache(
  async (idOrSlug: string): Promise<ServiceView | null> => {
    const client = createPublicClient()
    let query = client.from('services').select(SERVICE_SELECT).eq('status', 'published').eq('is_active', true)
    if (UUID_RE.test(idOrSlug)) {
      query = query.eq('id', idOrSlug)
    } else {
      const slug = idOrSlug.toLowerCase().replace(/[^a-z0-9-]/g, '')
      if (!slug) return null
      query = query.or(`slug_fr.eq.${slug},slug_en.eq.${slug},slug_es.eq.${slug}`)
    }
    const { data, error } = await query.limit(1)
    if (error) throw new Error(`service: ${error.message}`)
    const [service] = await hydrate((data ?? []) as unknown as Row[])
    return service ?? null
  },
  ['service'],
  { tags: [CACHE_TAGS.services], revalidate: REVALIDATE_SECONDS },
)

export const getServicesByIds = unstable_cache(
  async (ids: string[]): Promise<ServiceView[]> => {
    const valid = ids.filter((id) => UUID_RE.test(id))
    if (valid.length === 0) return []
    const { data, error } = await createPublicClient()
      .from('services').select(SERVICE_SELECT).eq('status', 'published').eq('is_active', true).in('id', valid)
    if (error) throw new Error(`services by ids: ${error.message}`)
    const services = await hydrate((data ?? []) as unknown as Row[])
    return valid.map((id) => services.find((s) => s.id === id)).filter((s): s is ServiceView => Boolean(s))
  },
  ['services-by-ids'],
  { tags: [CACHE_TAGS.services], revalidate: REVALIDATE_SECONDS },
)

/** ids + slugs for generateStaticParams and the sitemap. */
export const getPublishedServiceIndex = unstable_cache(
  async (): Promise<{ id: string; slug_fr: string | null; slug_en: string | null; slug_es: string | null; updated_at: string }[]> => {
    const { data, error } = await createPublicClient()
      .from('services')
      .select('id, slug_fr, slug_en, slug_es, updated_at, provider_id')
      .eq('status', 'published').eq('is_active', true)
      .limit(1000)
    if (error) throw new Error(`service index: ${error.message}`)
    const providers = await loadProviders((data ?? []).map((r) => r.provider_id as string))
    return (data ?? [])
      .filter((r) => providers.has(r.provider_id as string))
      .map((r) => ({ id: r.id as string, slug_fr: r.slug_fr as string | null, slug_en: r.slug_en as string | null, slug_es: r.slug_es as string | null, updated_at: r.updated_at as string }))
  },
  ['service-index'],
  { tags: [CACHE_TAGS.services], revalidate: 3600 },
)

// ── Availability / reviews ────────────────────────────────────────────────────
export const getAvailability = unstable_cache(
  async (serviceId: string, from: string, to: string): Promise<SlotView[]> => {
    if (!UUID_RE.test(serviceId)) return []
    const { data, error } = await createPublicClient()
      .from('public_slot_availability')
      .select('id, service_id, date, start_time, end_time')
      .eq('service_id', serviceId)
      .gte('date', from).lte('date', to)
      .order('date').order('start_time')
      .limit(500)
    if (error) throw new Error(`availability: ${error.message}`)
    return (data ?? []) as SlotView[]
  },
  ['availability'],
  { tags: [CACHE_TAGS.availability], revalidate: 60 },
)

export const getReviews = unstable_cache(
  async (serviceId: string, limit = 20): Promise<ReviewView[]> => {
    if (!UUID_RE.test(serviceId)) return []
    const { data, error } = await createPublicClient()
      .from('public_reviews')
      .select('id, service_id, rating, content, created_at, author_first_name, provider_reply')
      .eq('service_id', serviceId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw new Error(`reviews: ${error.message}`)
    return (data ?? []) as ReviewView[]
  },
  ['reviews'],
  { tags: [CACHE_TAGS.reviews], revalidate: REVALIDATE_SECONDS },
)

// ── Home rows ─────────────────────────────────────────────────────────────────
const ROW_SIZE = 8

interface RowDef {
  key: string
  label: { fr: string; en: string; es: string }
  pick: (s: ServiceView) => boolean
}

const ROW_DEFS: RowDef[] = [
  { key: 'popular', label: { fr: 'Incontournables', en: 'Must-haves', es: 'Imprescindibles' }, pick: (s) => s.is_featured || s.booking_count > 0 },
  { key: 'privateChefs', label: { fr: 'Chefs privés', en: 'Private Chefs', es: 'Chefs privados' }, pick: (s) => s.category_slug === 'chef_prive' },
  { key: 'wellness', label: { fr: 'Bien-être & beauté', en: 'Wellness & Beauty', es: 'Bienestar y belleza' }, pick: (s) => ['massage', 'fitness', 'coiffure', 'maquillage'].includes(s.category_slug) },
  { key: 'couplesFav', label: { fr: 'Idées pour les couples', en: "Couples' Ideas", es: 'Ideas para parejas' }, pick: (s) => s.tags.includes('couple') },
  { key: 'soiree', label: { fr: 'Soirée mémorable', en: 'Memorable Evening', es: 'Noche memorable' }, pick: (s) => ['musique', 'bar', 'evenement'].includes(s.category_slug) },
  { key: 'beaute', label: { fr: 'Beauté à domicile', en: 'Home Beauty', es: 'Belleza a domicilio' }, pick: (s) => ['coiffure', 'maquillage'].includes(s.category_slug) },
  { key: 'family', label: { fr: 'En famille', en: 'Family Fun', es: 'En familia' }, pick: (s) => s.tags.includes('famille') || s.category_slug === 'babysitter' },
  { key: 'martinique', label: { fr: 'Services en Martinique', en: 'Martinique Services', es: 'Servicios en Martinica' }, pick: (s) => s.island === 'martinique' },
  { key: 'culture', label: { fr: 'Culture & art de vivre', en: 'Culture & Lifestyle', es: 'Cultura y estilo de vida' }, pick: (s) => s.category_slug === 'danse' || s.tags.includes('culture') },
]

export interface HomeData {
  services: ServiceView[]
  rows: HomeRow[]
  categories: CategoryView[]
}

export const EMPTY_HOME: HomeData = { services: [], rows: [], categories: [] }

export const getHomeData = unstable_cache(
  async (): Promise<HomeData> => {
    const [services, categories] = await Promise.all([getPublishedServices(), getCategories()])
    const rows: HomeRow[] = ROW_DEFS
      .map((def) => ({
        key: def.key,
        label_fr: def.label.fr, label_en: def.label.en, label_es: def.label.es,
        ids: services.filter(def.pick).slice(0, ROW_SIZE).map((s) => s.id),
      }))
      .filter((row) => row.ids.length > 0)

    // "Available soon": services with a really free slot in the next two days.
    const today = new Date().toISOString().slice(0, 10)
    const in2days = new Date(Date.now() + 2 * 86_400_000).toISOString().slice(0, 10)
    const { data } = await createPublicClient()
      .from('public_slot_availability').select('service_id').gte('date', today).lte('date', in2days).limit(500)
    const soon = new Set((data ?? []).map((r) => r.service_id as string))
    const tonightIds = services.filter((s) => soon.has(s.id)).slice(0, ROW_SIZE).map((s) => s.id)
    if (tonightIds.length > 0) {
      rows.splice(1, 0, {
        key: 'tonight', label_fr: 'Disponible bientôt', label_en: 'Available Soon', label_es: 'Disponible pronto', ids: tonightIds,
      })
    }
    return { services, rows, categories }
  },
  ['home-data'],
  { tags: [CACHE_TAGS.services, CACHE_TAGS.availability], revalidate: REVALIDATE_SECONDS },
)
