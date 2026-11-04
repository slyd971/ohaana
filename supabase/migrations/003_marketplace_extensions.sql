-- Ohaana — Migration 003 : extensions du schéma marketplace
-- (colonnes, enums, nouvelles tables). Les policies/triggers/RPC associés sont en 004.

-- ─────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────
create type public.service_status as enum (
  'draft', 'pending_review', 'published', 'rejected', 'archived'
);

create type public.price_unit as enum ('per_person', 'flat');

create type public.application_status as enum (
  'pending', 'needs_info', 'approved', 'rejected'
);

create type public.lead_status as enum ('new', 'contacted', 'converted', 'discarded');

-- ─────────────────────────────────────────────────────────────
-- users
-- ─────────────────────────────────────────────────────────────
alter table public.users
  add column is_demo boolean not null default false;

-- ─────────────────────────────────────────────────────────────
-- partner_profiles (programme d'affiliation : espace /partner)
-- ─────────────────────────────────────────────────────────────
create table public.partner_profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references public.users(id) on delete cascade,
  referral_code   text not null unique check (referral_code ~ '^[a-z0-9-]{3,40}$'),
  company_name    text,
  commission_pct  numeric(5,2) not null default 10.00 check (commission_pct between 0 and 50),
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- provider_profiles : prestataires "gérés" par l'admin (sans compte) + traductions
-- ─────────────────────────────────────────────────────────────
alter table public.provider_profiles
  alter column user_id drop not null;            -- NULL = fiche créée par l'admin, pas encore revendiquée

alter table public.provider_profiles
  add column bio_es              text,
  add column created_by_admin_id uuid references public.users(id) on delete set null,
  add column claimed             boolean not null default true,   -- false = fiche admin non revendiquée
  add column claim_token_hash    text,
  add column claimed_at          timestamptz,
  add column is_demo             boolean not null default false,
  add constraint provider_claim_consistency
    check (user_id is not null or claimed = false);

-- ─────────────────────────────────────────────────────────────
-- service_categories / service_images : espagnol
-- ─────────────────────────────────────────────────────────────
alter table public.service_categories add column name_es text;
alter table public.service_images     add column alt_es  text;

-- ─────────────────────────────────────────────────────────────
-- cancellation_policies
-- rules : tableau JSON [{hours_before, refund_pct}], évalué du seuil le plus grand au plus petit
-- ─────────────────────────────────────────────────────────────
create table public.cancellation_policies (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name_fr     text not null,
  name_en     text not null,
  name_es     text,
  rules       jsonb not null,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

create unique index cancellation_policies_one_default_idx
  on public.cancellation_policies (is_default) where is_default;

-- ─────────────────────────────────────────────────────────────
-- services
-- ─────────────────────────────────────────────────────────────
alter table public.services
  add column status                  public.service_status not null default 'draft',
  add column price_unit              public.price_unit not null default 'per_person',
  add column title_es                text,
  add column description_es          text,
  add column slug_fr                 text unique,
  add column slug_en                 text unique,
  add column slug_es                 text unique,
  add column min_notice_hours        integer not null default 12 check (min_notice_hours >= 0),
  add column cancellation_policy_id  uuid references public.cancellation_policies(id),
  add column created_by_admin_id     uuid references public.users(id) on delete set null,
  add column rejection_reason        text,
  add column is_demo                 boolean not null default false,
  add constraint services_price_positive check (price_cents > 0),
  add constraint services_capacity_valid check (capacity_min >= 1 and capacity_max >= capacity_min);

-- reprise des services existants : is_active => published
update public.services set status = 'published' where is_active;

-- ─────────────────────────────────────────────────────────────
-- availability_slots
-- ─────────────────────────────────────────────────────────────
alter table public.availability_slots
  add constraint availability_time_order check (end_time > start_time),
  add constraint availability_unique_slot unique (service_id, date, start_time);

-- ─────────────────────────────────────────────────────────────
-- bookings
-- ─────────────────────────────────────────────────────────────
alter table public.bookings
  add column starts_at               timestamptz,
  add column expires_at              timestamptz,        -- fin de la réservation de créneau tant que 'pending'
  add column unit_price_cents        integer,
  add column price_unit              public.price_unit,
  add column service_address         text,
  add column cancellation_policy_id  uuid references public.cancellation_policies(id),
  add column cancelled_at            timestamptz,
  add column cancellation_reason     text,
  add column refund_pct              integer check (refund_pct between 0 and 100),
  add column partner_id              uuid references public.partner_profiles(id),
  add constraint bookings_guests_positive check (guests_count >= 1),
  add constraint bookings_total_nonnegative check (total_cents >= 0);

-- ─────────────────────────────────────────────────────────────
-- reviews : ne compter que les avis publiés
-- ─────────────────────────────────────────────────────────────
alter table public.reviews
  add column provider_reply     text,
  add column provider_replied_at timestamptz;

-- ─────────────────────────────────────────────────────────────
-- leads (formulaire de capture de la home)
-- ─────────────────────────────────────────────────────────────
create table public.leads (
  id           uuid primary key default gen_random_uuid(),
  email        text not null
               check (length(email) <= 254 and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  destination  text check (destination is null or length(destination) <= 100),
  whatsapp     text check (whatsapp is null or length(whatsapp) <= 30),
  locale       text not null default 'fr' check (locale in ('fr', 'en', 'es')),
  source       text not null default 'home' check (length(source) <= 50),
  consent      boolean not null check (consent),     -- consentement RGPD obligatoire
  status       public.lead_status not null default 'new',
  created_at   timestamptz not null default now()
);

-- un même email ne peut créer qu'un lead par jour (anti-spam de base ; limite par IP côté app)
create unique index leads_email_day_uidx
  on public.leads (lower(email), ((created_at at time zone 'utc')::date));

-- ─────────────────────────────────────────────────────────────
-- webhook_events (idempotence des webhooks Stripe)
-- ─────────────────────────────────────────────────────────────
create table public.webhook_events (
  stripe_event_id  text primary key,
  type             text not null,
  payload          jsonb,
  received_at      timestamptz not null default now(),
  processed_at     timestamptz,
  error            text
);

-- ─────────────────────────────────────────────────────────────
-- provider_applications (candidatures prestataires)
-- ─────────────────────────────────────────────────────────────
create table public.provider_applications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  provider_id   uuid references public.provider_profiles(id) on delete set null,
  business_name text not null check (length(business_name) between 2 and 120),
  message       text check (message is null or length(message) <= 2000),
  documents     jsonb not null default '[]',      -- chemins Storage (bucket provider-docs)
  status        public.application_status not null default 'pending',
  review_note   text,
  reviewed_by   uuid references public.users(id),
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index provider_applications_status_idx on public.provider_applications (status, created_at);

create trigger trg_provider_applications_updated_at
  before update on public.provider_applications
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- platform_settings (commission, politiques par défaut...) — jamais codés en dur
-- ─────────────────────────────────────────────────────────────
create table public.platform_settings (
  key         text primary key,
  value       jsonb not null,
  updated_by  uuid references public.users(id),
  updated_at  timestamptz not null default now()
);

insert into public.platform_settings (key, value) values
  ('commission_pct', '20'::jsonb),
  ('booking_hold_minutes', '15'::jsonb);

-- ─────────────────────────────────────────────────────────────
-- INDEX
-- ─────────────────────────────────────────────────────────────
-- anti double-réservation : un créneau ne peut être tenu que par une réservation active
create unique index bookings_active_slot_uidx
  on public.bookings (slot_id)
  where slot_id is not null and status in ('pending', 'confirmed');

create index bookings_service_status_idx on public.bookings (service_id, status);
create index bookings_pending_expiry_idx on public.bookings (expires_at) where status = 'pending';
create index bookings_starts_at_idx      on public.bookings (starts_at);
create index bookings_partner_idx        on public.bookings (partner_id) where partner_id is not null;
create index bookings_concierge_idx      on public.bookings (concierge_id) where concierge_id is not null;

create index availability_service_date_time_idx
  on public.availability_slots (service_id, date, start_time) where is_available;

create index services_listing_idx on public.services (status, island, category_id);
create index services_featured_idx on public.services (is_featured) where is_featured and status = 'published';
create index services_tags_gin_idx on public.services using gin (tags);
create index services_title_fr_trgm_idx on public.services using gin (title_fr gin_trgm_ops);
create index services_title_en_trgm_idx on public.services using gin (title_en gin_trgm_ops);

create index provider_profiles_approved_idx on public.provider_profiles (island) where is_approved;
create index provider_profiles_admin_idx    on public.provider_profiles (created_by_admin_id) where created_by_admin_id is not null;
create index reviews_published_idx on public.reviews (service_id, created_at desc) where is_published;
create index leads_status_idx on public.leads (status, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- RLS : activer sur les nouvelles tables (policies détaillées en 004)
-- ─────────────────────────────────────────────────────────────
alter table public.partner_profiles      enable row level security;
alter table public.cancellation_policies enable row level security;
alter table public.leads                 enable row level security;
alter table public.webhook_events        enable row level security;   -- aucune policy : service_role uniquement
alter table public.provider_applications enable row level security;
alter table public.platform_settings     enable row level security;   -- admin / service_role uniquement
