export type UserRole = 'tourist' | 'provider' | 'concierge' | 'admin'
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled_tourist'
  | 'cancelled_provider'
  | 'completed'
  | 'disputed'
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
  user_id: string
  business_name: string
  bio: string | null
  bio_en: string | null
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
  description_fr: string | null
  description_en: string | null
  island: Island
  price_cents: number
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
