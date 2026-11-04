// View models consumed by the UI. Built from the public Supabase views/tables (never from private columns).
import type { Island, PriceUnit } from '@/types/database'

export interface ServiceImageView {
  id: string
  url: string
  alt_fr: string | null
  alt_en: string | null
  alt_es: string | null
  sort_order: number
  is_cover: boolean
}

export interface ProviderView {
  id: string
  business_name: string
  bio: string | null
  bio_en: string | null
  bio_es: string | null
  languages: string[]
  certifications: string[]
  island: Island
  avg_rating: number
  review_count: number
  /** Only approved providers are exposed by public_provider_profiles. */
  is_approved: boolean
  // Contact details are NOT public: they are only released after a confirmed booking (get_provider_contact).
  phone?: string | null
  whatsapp?: string | null
  user: { full_name: string | null; avatar_url: string | null }
}

export interface ServiceView {
  id: string
  slug_fr: string | null
  slug_en: string | null
  slug_es: string | null
  provider_id: string
  category_id: string
  category_slug: string
  title_fr: string
  title_en: string
  title_es: string
  description_fr: string
  description_en: string
  description_es: string
  island: Island
  price_cents: number
  price_unit: PriceUnit
  duration_min: number | null
  capacity_min: number
  capacity_max: number
  address: string | null
  latitude: number | null
  longitude: number | null
  is_active: boolean
  is_featured: boolean
  tags: string[]
  avg_rating: number
  review_count: number
  booking_count: number
  created_at: string
  updated_at: string
  provider: ProviderView
  images: ServiceImageView[]
}

export interface CategoryView {
  id: string
  slug: string
  name_fr: string
  name_en: string
  name_es: string
  icon: string | null
  color: string | null
  sort_order: number
}

export interface SlotView {
  id: string
  service_id: string
  date: string        // YYYY-MM-DD (local time of the Antilles)
  start_time: string  // HH:MM:SS
  end_time: string
}

export interface ReviewView {
  id: string
  service_id: string
  rating: number
  content: string | null
  created_at: string
  author_first_name: string
  provider_reply: string | null
}

export interface HomeRow {
  key: string
  label_fr: string
  label_en: string
  label_es: string
  ids: string[]
}

export interface SearchFilters {
  q?: string
  island?: Island
  category?: string          // category slug
  minPriceCents?: number
  maxPriceCents?: number
  sort?: 'popular' | 'price_asc' | 'price_desc'
  page?: number
  pageSize?: number
}

export interface SearchResult {
  items: ServiceView[]
  total: number
  page: number
  pageSize: number
}
