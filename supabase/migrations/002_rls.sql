-- Ohaana — Row Level Security
-- Migration 002: RLS sur toutes les tables de 001.
--
-- Règles :
--  * Postgres n'accepte qu'UNE commande par policy (select | insert | update | delete | all).
--  * Les colonnes sensibles (role, is_approved, stripe_*, prix, statuts...) ne sont PAS protégées
--    ici mais par les triggers de 004 (RLS filtre des lignes, pas des colonnes).
--  * Les écritures sensibles (réservation, avis, paiement, notification) n'ont volontairement
--    AUCUNE policy d'écriture client : elles passent par les RPC security definer de 004
--    ou par la clé service_role (webhooks).

-- ─────────────────────────────────────────────────────────────
-- HELPERS (security definer + search_path figé)
-- ─────────────────────────────────────────────────────────────
create or replace function public.current_user_role()
returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin' and is_active);
$$;

-- true quand la requête vient directement d'un client (API Supabase) et non d'une
-- fonction security definer, d'un trigger interne, de service_role ou du SQL editor.
create or replace function public.is_client_role()
returns boolean language sql stable as $$
  select current_user in ('anon', 'authenticated');
$$;

-- id du profil prestataire de l'utilisateur courant (null s'il n'en a pas)
create or replace function public.my_provider_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.provider_profiles where user_id = auth.uid() limit 1;
$$;

create or replace function public.provider_is_approved(p_provider_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_approved from public.provider_profiles where id = p_provider_id), false);
$$;

-- ─────────────────────────────────────────────────────────────
-- users
-- ─────────────────────────────────────────────────────────────
alter table public.users enable row level security;

create policy "users: select own"
  on public.users for select
  using (id = auth.uid());

create policy "users: update own"
  on public.users for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "users: admin all"
  on public.users for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- tourist_profiles
-- ─────────────────────────────────────────────────────────────
alter table public.tourist_profiles enable row level security;

create policy "tourist_profiles: own all"
  on public.tourist_profiles for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "tourist_profiles: admin all"
  on public.tourist_profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- provider_profiles — privé (contient téléphone, Stripe...).
-- La lecture publique passe par la vue public_provider_profiles (004).
-- ─────────────────────────────────────────────────────────────
alter table public.provider_profiles enable row level security;

create policy "provider_profiles: select own"
  on public.provider_profiles for select
  using (user_id = auth.uid());

create policy "provider_profiles: insert own"
  on public.provider_profiles for insert
  with check (user_id = auth.uid());

create policy "provider_profiles: update own"
  on public.provider_profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "provider_profiles: admin all"
  on public.provider_profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- concierge_profiles — la commission est confidentielle, écriture admin uniquement
-- ─────────────────────────────────────────────────────────────
alter table public.concierge_profiles enable row level security;

create policy "concierge_profiles: select own"
  on public.concierge_profiles for select
  using (user_id = auth.uid());

create policy "concierge_profiles: admin all"
  on public.concierge_profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- service_categories — lecture publique
-- ─────────────────────────────────────────────────────────────
alter table public.service_categories enable row level security;

create policy "service_categories: public read"
  on public.service_categories for select
  using (true);

create policy "service_categories: admin all"
  on public.service_categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- services (la policy de lecture publique est redéfinie en 004 avec status)
-- ─────────────────────────────────────────────────────────────
alter table public.services enable row level security;

create policy "services: public read"
  on public.services for select
  using (is_active = true and public.provider_is_approved(provider_id));

create policy "services: owner select"
  on public.services for select
  using (provider_id = public.my_provider_id());

create policy "services: owner insert"
  on public.services for insert
  with check (provider_id = public.my_provider_id());

create policy "services: owner update"
  on public.services for update
  using (provider_id = public.my_provider_id())
  with check (provider_id = public.my_provider_id());

create policy "services: owner delete"
  on public.services for delete
  using (provider_id = public.my_provider_id());

create policy "services: admin all"
  on public.services for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- service_images
-- ─────────────────────────────────────────────────────────────
alter table public.service_images enable row level security;

create policy "service_images: public read"
  on public.service_images for select
  using (true);

create policy "service_images: owner write"
  on public.service_images for all
  using (service_id in (select id from public.services where provider_id = public.my_provider_id()))
  with check (service_id in (select id from public.services where provider_id = public.my_provider_id()));

create policy "service_images: admin all"
  on public.service_images for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- availability_slots
-- ─────────────────────────────────────────────────────────────
alter table public.availability_slots enable row level security;

create policy "availability_slots: public read"
  on public.availability_slots for select
  using (true);

create policy "availability_slots: owner write"
  on public.availability_slots for all
  using (service_id in (select id from public.services where provider_id = public.my_provider_id()))
  with check (service_id in (select id from public.services where provider_id = public.my_provider_id()));

create policy "availability_slots: admin all"
  on public.availability_slots for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- bookings — LECTURE seulement côté client.
-- Création / annulation / changement de statut : RPC de 004 (prix recalculé côté serveur).
-- ─────────────────────────────────────────────────────────────
alter table public.bookings enable row level security;

create policy "bookings: tourist select"
  on public.bookings for select
  using (tourist_id = auth.uid());

create policy "bookings: concierge select"
  on public.bookings for select
  using (concierge_id = auth.uid());

create policy "bookings: provider select"
  on public.bookings for select
  using (service_id in (select id from public.services where provider_id = public.my_provider_id()));

create policy "bookings: admin all"
  on public.bookings for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- payments — lecture seulement ; écriture = service_role (webhooks Stripe)
-- ─────────────────────────────────────────────────────────────
alter table public.payments enable row level security;

create policy "payments: tourist select"
  on public.payments for select
  using (booking_id in (select id from public.bookings where tourist_id = auth.uid()));

create policy "payments: provider select"
  on public.payments for select
  using (booking_id in (
    select b.id from public.bookings b
    join public.services s on s.id = b.service_id
    where s.provider_id = public.my_provider_id()
  ));

create policy "payments: admin all"
  on public.payments for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- reviews — création via RPC create_review (004) ; le touriste édite note/texte
-- ─────────────────────────────────────────────────────────────
alter table public.reviews enable row level security;

create policy "reviews: public read published"
  on public.reviews for select
  using (is_published = true);

create policy "reviews: tourist select own"
  on public.reviews for select
  using (tourist_id = auth.uid());

create policy "reviews: provider select own"
  on public.reviews for select
  using (provider_id = public.my_provider_id());

create policy "reviews: tourist update own"
  on public.reviews for update
  using (tourist_id = auth.uid())
  with check (tourist_id = auth.uid());

create policy "reviews: admin all"
  on public.reviews for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- favorites
-- ─────────────────────────────────────────────────────────────
alter table public.favorites enable row level security;

create policy "favorites: own all"
  on public.favorites for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- notifications — créées par le serveur ; l'utilisateur lit / marque lu / supprime
-- ─────────────────────────────────────────────────────────────
alter table public.notifications enable row level security;

create policy "notifications: select own"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "notifications: update own"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications: delete own"
  on public.notifications for delete
  using (user_id = auth.uid());

create policy "notifications: admin all"
  on public.notifications for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- admin_logs
-- ─────────────────────────────────────────────────────────────
alter table public.admin_logs enable row level security;

create policy "admin_logs: admin all"
  on public.admin_logs for all
  using (public.is_admin())
  with check (public.is_admin() and admin_id = auth.uid());
