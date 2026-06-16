-- Ohaana — Schema initial
-- Migration 001: tables principales

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- Enum types
create type public.user_role as enum (
  'tourist', 'provider', 'concierge', 'admin'
);

create type public.booking_status as enum (
  'pending', 'confirmed', 'cancelled_tourist', 'cancelled_provider',
  'completed', 'disputed'
);

create type public.payment_status as enum (
  'pending', 'succeeded', 'failed', 'refunded'
);

create type public.notification_type as enum (
  'booking_new', 'booking_confirmed', 'booking_cancelled', 'booking_completed',
  'review_new', 'payment_received', 'message_new', 'promo'
);

create type public.island as enum (
  'guadeloupe', 'martinique', 'saint_martin', 'saint_barth',
  'aruba', 'bahamas', 'republique_dominicaine'
);

create type public.traveler_type as enum (
  'couple', 'family', 'friends', 'solo'
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: users (extension de auth.users)
-- ─────────────────────────────────────────────────────────────
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  role        public.user_role not null default 'tourist',
  island      public.island default 'guadeloupe',
  locale      text not null default 'fr',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: tourist_profiles
-- ─────────────────────────────────────────────────────────────
create table public.tourist_profiles (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null unique references public.users(id) on delete cascade,
  traveler_type   public.traveler_type,
  interests       text[] default '{}',    -- ['luxury','wellness','adventure','food','culture','relax']
  island          public.island default 'guadeloupe',
  onboarding_done boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: provider_profiles
-- ─────────────────────────────────────────────────────────────
create table public.provider_profiles (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null unique references public.users(id) on delete cascade,
  business_name       text not null,
  bio                 text,
  bio_en              text,
  languages           text[] default '{}',
  certifications      text[] default '{}',
  island              public.island not null default 'guadeloupe',
  phone               text,
  whatsapp            text,
  stripe_account_id   text,
  stripe_onboarded    boolean not null default false,
  is_approved         boolean not null default false,
  avg_rating          numeric(3,2) default 0,
  review_count        integer default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: concierge_profiles
-- ─────────────────────────────────────────────────────────────
create table public.concierge_profiles (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null unique references public.users(id) on delete cascade,
  commission_pct  numeric(5,2) not null default 5.00,
  island          public.island not null default 'guadeloupe',
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: service_categories
-- ─────────────────────────────────────────────────────────────
create table public.service_categories (
  id          uuid primary key default uuid_generate_v4(),
  slug        text not null unique,
  name_fr     text not null,
  name_en     text not null,
  icon        text,
  color       text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: services
-- ─────────────────────────────────────────────────────────────
create table public.services (
  id              uuid primary key default uuid_generate_v4(),
  provider_id     uuid not null references public.provider_profiles(id) on delete cascade,
  category_id     uuid not null references public.service_categories(id),
  title_fr        text not null,
  title_en        text,
  description_fr  text,
  description_en  text,
  island          public.island not null default 'guadeloupe',
  price_cents     integer not null,            -- prix en centimes EUR
  duration_min    integer,                      -- durée en minutes
  capacity_min    integer not null default 1,
  capacity_max    integer not null default 1,
  address         text,
  latitude        numeric(10,7),
  longitude       numeric(10,7),
  is_active       boolean not null default true,
  is_featured     boolean not null default false,
  tags            text[] default '{}',
  avg_rating      numeric(3,2) default 0,
  review_count    integer default 0,
  booking_count   integer default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index services_island_idx on public.services(island);
create index services_category_idx on public.services(category_id);
create index services_provider_idx on public.services(provider_id);
create index services_price_idx on public.services(price_cents);
create index services_rating_idx on public.services(avg_rating desc);

-- ─────────────────────────────────────────────────────────────
-- TABLE: service_images
-- ─────────────────────────────────────────────────────────────
create table public.service_images (
  id          uuid primary key default uuid_generate_v4(),
  service_id  uuid not null references public.services(id) on delete cascade,
  url         text not null,
  alt_fr      text,
  alt_en      text,
  sort_order  integer not null default 0,
  is_cover    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index service_images_service_idx on public.service_images(service_id, sort_order);

-- ─────────────────────────────────────────────────────────────
-- TABLE: availability_slots
-- ─────────────────────────────────────────────────────────────
create table public.availability_slots (
  id            uuid primary key default uuid_generate_v4(),
  service_id    uuid not null references public.services(id) on delete cascade,
  date          date not null,
  start_time    time not null,
  end_time      time not null,
  is_available  boolean not null default true,
  created_at    timestamptz not null default now()
);

create index availability_service_date_idx on public.availability_slots(service_id, date, is_available);

-- ─────────────────────────────────────────────────────────────
-- TABLE: bookings
-- ─────────────────────────────────────────────────────────────
create table public.bookings (
  id              uuid primary key default uuid_generate_v4(),
  service_id      uuid not null references public.services(id),
  tourist_id      uuid not null references public.users(id),
  slot_id         uuid references public.availability_slots(id),
  concierge_id    uuid references public.users(id),   -- si réservé via concierge
  status          public.booking_status not null default 'pending',
  guests_count    integer not null default 1,
  notes           text,
  total_cents     integer not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index bookings_tourist_idx on public.bookings(tourist_id, created_at desc);
create index bookings_service_idx on public.bookings(service_id);

-- ─────────────────────────────────────────────────────────────
-- TABLE: payments
-- ─────────────────────────────────────────────────────────────
create table public.payments (
  id                        uuid primary key default uuid_generate_v4(),
  booking_id                uuid not null unique references public.bookings(id),
  stripe_payment_intent_id  text unique,
  stripe_charge_id          text,
  status                    public.payment_status not null default 'pending',
  total_cents               integer not null,
  platform_fee_cents        integer not null,   -- 20 %
  provider_amount_cents     integer not null,   -- 80 %
  concierge_fee_cents       integer default 0,
  currency                  text not null default 'eur',
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: reviews
-- ─────────────────────────────────────────────────────────────
create table public.reviews (
  id              uuid primary key default uuid_generate_v4(),
  booking_id      uuid not null unique references public.bookings(id),
  tourist_id      uuid not null references public.users(id),
  provider_id     uuid not null references public.provider_profiles(id),
  service_id      uuid not null references public.services(id),
  rating          integer not null check (rating between 1 and 5),
  content         text,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now()
);

create index reviews_service_idx on public.reviews(service_id, created_at desc);
create index reviews_provider_idx on public.reviews(provider_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- TABLE: favorites
-- ─────────────────────────────────────────────────────────────
create table public.favorites (
  user_id     uuid not null references public.users(id) on delete cascade,
  service_id  uuid not null references public.services(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, service_id)
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: notifications
-- ─────────────────────────────────────────────────────────────
create table public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  type        public.notification_type not null,
  title_fr    text not null,
  title_en    text,
  body_fr     text,
  body_en     text,
  payload     jsonb default '{}',
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index notifications_user_idx on public.notifications(user_id, is_read, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- TABLE: admin_logs
-- ─────────────────────────────────────────────────────────────
create table public.admin_logs (
  id          uuid primary key default uuid_generate_v4(),
  admin_id    uuid not null references public.users(id),
  action      text not null,
  target_type text,
  target_id   uuid,
  details     jsonb default '{}',
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- TRIGGERS: updated_at auto-refresh
-- ─────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated_at
  before update on public.users
  for each row execute procedure public.set_updated_at();

create trigger trg_provider_updated_at
  before update on public.provider_profiles
  for each row execute procedure public.set_updated_at();

create trigger trg_services_updated_at
  before update on public.services
  for each row execute procedure public.set_updated_at();

create trigger trg_bookings_updated_at
  before update on public.bookings
  for each row execute procedure public.set_updated_at();

create trigger trg_payments_updated_at
  before update on public.payments
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- TRIGGER: sync auth.users → public.users
-- ─────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- FUNCTION: update avg_rating on reviews insert
-- ─────────────────────────────────────────────────────────────
create or replace function public.refresh_ratings()
returns trigger language plpgsql as $$
begin
  update public.services
  set
    avg_rating   = (select avg(rating) from public.reviews where service_id = new.service_id),
    review_count = (select count(*) from public.reviews where service_id = new.service_id)
  where id = new.service_id;

  update public.provider_profiles
  set
    avg_rating   = (select avg(rating) from public.reviews where provider_id = new.provider_id),
    review_count = (select count(*) from public.reviews where provider_id = new.provider_id)
  where id = new.provider_id;

  return new;
end;
$$;

create trigger trg_review_ratings
  after insert or update on public.reviews
  for each row execute procedure public.refresh_ratings();
