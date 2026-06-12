-- Ohaana — Row Level Security
-- Migration 002: RLS sur toutes les tables

-- ─────────────────────────────────────────────────────────────
-- HELPERS
-- ─────────────────────────────────────────────────────────────
create or replace function public.current_user_role()
returns public.user_role language sql stable security definer as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

-- ─────────────────────────────────────────────────────────────
-- users
-- ─────────────────────────────────────────────────────────────
alter table public.users enable row level security;

create policy "users: select own or admin"
  on public.users for select
  using (id = auth.uid() or public.is_admin());

create policy "users: update own"
  on public.users for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "users: admin full"
  on public.users for all
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- tourist_profiles
-- ─────────────────────────────────────────────────────────────
alter table public.tourist_profiles enable row level security;

create policy "tourist_profiles: own"
  on public.tourist_profiles for all
  using (user_id = auth.uid());

create policy "tourist_profiles: admin"
  on public.tourist_profiles for all
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- provider_profiles — lisibles par tous les connectés, éditables par le propriétaire
-- ─────────────────────────────────────────────────────────────
alter table public.provider_profiles enable row level security;

create policy "provider_profiles: read authenticated"
  on public.provider_profiles for select
  using (auth.role() = 'authenticated');

create policy "provider_profiles: own write"
  on public.provider_profiles for insert update delete
  using (user_id = auth.uid());

create policy "provider_profiles: admin"
  on public.provider_profiles for all
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- concierge_profiles
-- ─────────────────────────────────────────────────────────────
alter table public.concierge_profiles enable row level security;

create policy "concierge_profiles: read authenticated"
  on public.concierge_profiles for select
  using (auth.role() = 'authenticated');

create policy "concierge_profiles: own write"
  on public.concierge_profiles for insert update delete
  using (user_id = auth.uid());

create policy "concierge_profiles: admin"
  on public.concierge_profiles for all
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- hotel_profiles / villa_profiles
-- ─────────────────────────────────────────────────────────────
alter table public.hotel_profiles enable row level security;

create policy "hotel_profiles: read authenticated"
  on public.hotel_profiles for select
  using (auth.role() = 'authenticated');

create policy "hotel_profiles: own write"
  on public.hotel_profiles for insert update delete
  using (user_id = auth.uid());

create policy "hotel_profiles: admin"
  on public.hotel_profiles for all
  using (public.is_admin());

alter table public.villa_profiles enable row level security;

create policy "villa_profiles: read authenticated"
  on public.villa_profiles for select
  using (auth.role() = 'authenticated');

create policy "villa_profiles: own write"
  on public.villa_profiles for insert update delete
  using (user_id = auth.uid());

create policy "villa_profiles: admin"
  on public.villa_profiles for all
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- service_categories — publiques en lecture
-- ─────────────────────────────────────────────────────────────
alter table public.service_categories enable row level security;

create policy "service_categories: public read"
  on public.service_categories for select
  using (true);

create policy "service_categories: admin write"
  on public.service_categories for insert update delete
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- services — publics en lecture (actifs), écriture par le prestataire
-- ─────────────────────────────────────────────────────────────
alter table public.services enable row level security;

create policy "services: public read active"
  on public.services for select
  using (is_active = true or provider_id in (
    select id from public.provider_profiles where user_id = auth.uid()
  ) or public.is_admin());

create policy "services: provider write"
  on public.services for insert update delete
  using (provider_id in (
    select id from public.provider_profiles where user_id = auth.uid()
  ));

create policy "services: admin"
  on public.services for all
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- service_images
-- ─────────────────────────────────────────────────────────────
alter table public.service_images enable row level security;

create policy "service_images: public read"
  on public.service_images for select
  using (true);

create policy "service_images: provider write"
  on public.service_images for insert update delete
  using (service_id in (
    select id from public.services where provider_id in (
      select id from public.provider_profiles where user_id = auth.uid()
    )
  ));

create policy "service_images: admin"
  on public.service_images for all
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- availability_slots
-- ─────────────────────────────────────────────────────────────
alter table public.availability_slots enable row level security;

create policy "availability_slots: public read"
  on public.availability_slots for select
  using (true);

create policy "availability_slots: provider write"
  on public.availability_slots for insert update delete
  using (service_id in (
    select id from public.services where provider_id in (
      select id from public.provider_profiles where user_id = auth.uid()
    )
  ));

create policy "availability_slots: admin"
  on public.availability_slots for all
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- bookings
-- ─────────────────────────────────────────────────────────────
alter table public.bookings enable row level security;

create policy "bookings: tourist own"
  on public.bookings for select
  using (tourist_id = auth.uid());

create policy "bookings: provider read"
  on public.bookings for select
  using (service_id in (
    select id from public.services where provider_id in (
      select id from public.provider_profiles where user_id = auth.uid()
    )
  ));

create policy "bookings: tourist insert"
  on public.bookings for insert
  with check (tourist_id = auth.uid());

create policy "bookings: tourist cancel"
  on public.bookings for update
  using (tourist_id = auth.uid())
  with check (status in ('cancelled_tourist'));

create policy "bookings: provider update status"
  on public.bookings for update
  using (service_id in (
    select id from public.services where provider_id in (
      select id from public.provider_profiles where user_id = auth.uid()
    )
  ));

create policy "bookings: admin"
  on public.bookings for all
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- payments
-- ─────────────────────────────────────────────────────────────
alter table public.payments enable row level security;

create policy "payments: tourist read own"
  on public.payments for select
  using (booking_id in (
    select id from public.bookings where tourist_id = auth.uid()
  ));

create policy "payments: provider read own"
  on public.payments for select
  using (booking_id in (
    select id from public.bookings where service_id in (
      select id from public.services where provider_id in (
        select id from public.provider_profiles where user_id = auth.uid()
      )
    )
  ));

create policy "payments: admin"
  on public.payments for all
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- reviews
-- ─────────────────────────────────────────────────────────────
alter table public.reviews enable row level security;

create policy "reviews: public read published"
  on public.reviews for select
  using (is_published = true or tourist_id = auth.uid() or public.is_admin());

create policy "reviews: tourist insert"
  on public.reviews for insert
  with check (tourist_id = auth.uid());

create policy "reviews: admin"
  on public.reviews for all
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- favorites
-- ─────────────────────────────────────────────────────────────
alter table public.favorites enable row level security;

create policy "favorites: own"
  on public.favorites for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- notifications
-- ─────────────────────────────────────────────────────────────
alter table public.notifications enable row level security;

create policy "notifications: own"
  on public.notifications for select update
  using (user_id = auth.uid());

create policy "notifications: admin"
  on public.notifications for all
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- admin_logs
-- ─────────────────────────────────────────────────────────────
alter table public.admin_logs enable row level security;

create policy "admin_logs: admin only"
  on public.admin_logs for all
  using (public.is_admin());
