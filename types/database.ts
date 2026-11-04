export type UserRole = 'tourist' | 'provider' | 'concierge' | 'partner' | 'admin'
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled_tourist'
  | 'cancelled_provider'
  | 'completed'
  | 'disputed'
  | 'expired'
export type ServiceStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived'
export type PriceUnit = 'per_person' | 'flat'
export type ApplicationStatus = 'pending' | 'needs_info' | 'approved' | 'rejected'
export type LeadStatus = 'new' | 'contacted' | 'converted' | 'discarded'
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'
export type NotificationType =
  | 'booking_new'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_completed'
  | 'review_new'
  | 'payment_received'
  | 'message_new'
  | 'promo'
export type Island =
  | 'guadeloupe'
  | 'martinique'
  | 'saint_martin'
  | 'saint_barth'
  | 'aruba'
  | 'bahamas'
  | 'republique_dominicaine'
export type TravelerType = 'couple' | 'family' | 'friends' | 'solo'

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  island: Island | null
  locale: string
  is_active: boolean
  is_demo?: boolean
  created_at: string
  updated_at: string
}

export interface TouristProfile {
  id: string
  user_id: string
  traveler_type: TravelerType | null
  interests: string[]
  island: Island | null
  onboarding_done: boolean
  created_at: string
}

export interface ProviderProfile {
  id: string
  user_id: string | null // null = fiche créée par un admin, non revendiquée
  business_name: string
  bio: string | null
  bio_en: string | null
  bio_es?: string | null
  languages: string[]
  certifications: string[]
  island: Island
  phone: string | null
  whatsapp: string | null
  stripe_account_id: string | null
  stripe_onboarded: boolean
  is_approved: boolean
  avg_rating: number
  review_count: number
  created_by_admin_id?: string | null
  claimed?: boolean
  claimed_at?: string | null
  is_demo?: boolean
  created_at: string
  updated_at: string
  // joined
  user?: User
}

export interface ServiceCategory {
  id: string
  slug: string
  name_fr: string
  name_en: string
  name_es?: string | null
  icon: string | null
  color: string | null
  sort_order: number
  is_active: boolean
}

export interface Service {
  id: string
  provider_id: string
  category_id: string
  title_fr: string
  title_en: string | null
  title_es?: string | null
  description_fr: string | null
  description_en: string | null
  description_es?: string | null
  slug_fr?: string | null
  slug_en?: string | null
  slug_es?: string | null
  island: Island
  price_cents: number
  price_unit?: PriceUnit
  duration_min: number | null
  capacity_min: number
  capacity_max: number
  address: string | null
  latitude: number | null
  longitude: number | null
  is_active: boolean
  is_featured: boolean
  status?: ServiceStatus
  min_notice_hours?: number
  cancellation_policy_id?: string | null
  created_by_admin_id?: string | null
  rejection_reason?: string | null
  is_demo?: boolean
  tags: string[]
  avg_rating: number
  review_count: number
  booking_count: number
  created_at: string
  updated_at: string
  // joined
  provider?: ProviderProfile
  category?: ServiceCategory
  images?: ServiceImage[]
}

export interface ServiceImage {
  id: string
  service_id: string
  url: string
  alt_fr: string | null
  alt_en: string | null
  alt_es?: string | null
  sort_order: number
  is_cover: boolean
  created_at: string
}

export interface AvailabilitySlot {
  id: string
  service_id: string
  date: string
  start_time: string
  end_time: string
  is_available: boolean
  created_at: string
}

export interface Booking {
  id: string
  service_id: string
  tourist_id: string
  slot_id: string | null
  concierge_id: string | null
  status: BookingStatus
  guests_count: number
  notes: string | null
  total_cents: number
  starts_at?: string | null
  expires_at?: string | null
  unit_price_cents?: number | null
  price_unit?: PriceUnit | null
  service_address?: string | null
  cancellation_policy_id?: string | null
  cancelled_at?: string | null
  cancellation_reason?: string | null
  refund_pct?: number | null
  partner_id?: string | null
  created_at: string
  updated_at: string
  // joined
  service?: Service
  tourist?: User
}

export interface Payment {
  id: string
  booking_id: string
  stripe_payment_intent_id: string | null
  stripe_charge_id: string | null
  status: PaymentStatus
  total_cents: number
  platform_fee_cents: number
  provider_amount_cents: number
  concierge_fee_cents: number
  currency: string
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  booking_id: string
  tourist_id: string
  provider_id: string
  service_id: string
  rating: number
  content: string | null
  is_published: boolean
  provider_reply?: string | null
  provider_replied_at?: string | null
  created_at: string
  // joined
  tourist?: User
}

export interface Favorite {
  user_id: string
  service_id: string
  created_at: string
  service?: Service
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title_fr: string
  title_en: string | null
  body_fr: string | null
  body_en: string | null
  payload: Record<string, unknown>
  is_read: boolean
  created_at: string
}

// ─── Supabase requires Row types to extend Record<string, unknown> ──────────
// TypeScript interfaces lack an index signature, so we intersect here.
// Application code uses the typed interfaces above; the DB layer uses these.
type R<T> = T & Record<string, unknown>

type TableDef<T> = {
  Row: R<T>
  Insert: Partial<R<T>>
  Update: Partial<R<T>>
  Relationships: []
}

// ─── DB Row shapes (strip runtime-only joined relations) ─────────────────────
type UserRow = User
type TouristProfileRow = TouristProfile
type ProviderProfileRow = Omit<ProviderProfile, 'user'>
type ServiceCategoryRow = ServiceCategory
type ServiceRow = Omit<Service, 'provider' | 'category' | 'images'>
type ServiceImageRow = ServiceImage
type AvailabilitySlotRow = AvailabilitySlot
type BookingRow = Omit<Booking, 'service' | 'tourist'>
type PaymentRow = Payment
type ReviewRow = Omit<Review, 'tourist'>
type FavoriteRow = Omit<Favorite, 'service'>
type NotificationRow = Notification

// Supabase Database type root (used with createClient<Database>)
export type Database = {
  public: {
    Tables: {
      users: TableDef<UserRow>
      tourist_profiles: TableDef<TouristProfileRow>
      provider_profiles: TableDef<ProviderProfileRow>
      service_categories: TableDef<ServiceCategoryRow>
      services: TableDef<ServiceRow>
      service_images: TableDef<ServiceImageRow>
      availability_slots: TableDef<AvailabilitySlotRow>
      bookings: TableDef<BookingRow>
      payments: TableDef<PaymentRow>
      reviews: TableDef<ReviewRow>
      favorites: TableDef<FavoriteRow>
      notifications: TableDef<NotificationRow>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    CompositeTypes: Record<string, never>
    Enums: {
      user_role: UserRole
      booking_status: BookingStatus
      payment_status: PaymentStatus
      notification_type: NotificationType
      island: Island
      traveler_type: TravelerType
    }
  }
}

// ─── Tables ajoutées par les migrations 003+ ───────────────────────────────

export interface PartnerProfile {
  id: string
  user_id: string
  referral_code: string
  company_name: string | null
  commission_pct: number
  created_at: string
}

export interface CancellationPolicy {
  id: string
  code: string
  name_fr: string
  name_en: string
  name_es: string | null
  rules: { hours_before: number; refund_pct: number }[]
  is_default: boolean
  created_at: string
}

export interface Lead {
  id: string
  email: string
  destination: string | null
  whatsapp: string | null
  locale: 'fr' | 'en' | 'es'
  source: string
  consent: boolean
  status: LeadStatus
  created_at: string
}

export interface ProviderApplication {
  id: string
  user_id: string
  provider_id: string | null
  business_name: string
  message: string | null
  documents: string[]
  status: ApplicationStatus
  review_note: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface PlatformSetting {
  key: string
  value: unknown
  updated_by: string | null
  updated_at: string
}

// ─── Vues publiques (aucune donnée de contact / Stripe) ─────────────────────

export interface PublicProviderProfile {
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
  full_name: string | null
  avatar_url: string | null
}

export interface PublicReview {
  id: string
  service_id: string
  provider_id: string
  rating: number
  content: string | null
  created_at: string
  provider_reply: string | null
  provider_replied_at: string | null
  author_first_name: string
}

// ─── Fonctions RPC (supabase.rpc) ───────────────────────────────────────────
// create_booking(p_service_id, p_slot_id, p_guests, p_notes?, p_address?) -> Booking
// cancel_booking(p_booking_id, p_reason?) -> Booking
// provider_set_booking_status(p_booking_id, p_status) -> Booking
// create_review(p_booking_id, p_rating, p_content?) -> Review
// get_provider_contact(p_booking_id) -> { phone, whatsapp }[]
// purge_demo_data() -> void   (admin ou service_role)
// NOTE : à remplacer par `supabase gen types typescript` une fois un projet Supabase lié.
