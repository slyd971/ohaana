-- Ohaana — tests de sécurité de la base (RLS, triggers, RPC).
-- Exécution locale : `npm run db:test` (PGlite).  Sur Supabase : `supabase db reset` puis coller ce fichier
-- dans le SQL editor (rôle postgres) — chaque test échoue bruyamment (exception) en cas de régression.
-- Prérequis : migrations 001-006 + seed.sql.

create schema if not exists t;
grant usage on schema t to public;
create table if not exists t.log (label text);
grant all on t.log to public;

create or replace function t.as_user(p_uid uuid) returns void language plpgsql as $$
begin
  reset role;
  perform set_config('request.jwt.claim.sub', p_uid::text, false);
  set role authenticated;
end $$;

create or replace function t.as_anon() returns void language plpgsql as $$
begin
  reset role;
  perform set_config('request.jwt.claim.sub', '', false);
  set role anon;
end $$;

create or replace function t.reset() returns void language plpgsql as $$
begin
  reset role;
  perform set_config('request.jwt.claim.sub', '', false);
end $$;

-- l'instruction doit échouer avec le SQLSTATE attendu
create or replace function t.fails(p_label text, p_sql text, p_state text) returns void language plpgsql as $$
begin
  begin
    execute p_sql;
  exception when others then
    if sqlstate = p_state then
      insert into t.log values (p_label);
      return;
    end if;
    raise exception 'FAIL %: expected SQLSTATE %, got % (%)', p_label, p_state, sqlstate, sqlerrm;
  end;
  raise exception 'FAIL %: statement succeeded but should have been rejected', p_label;
end $$;

create or replace function t.eq(p_label text, p_actual text, p_expected text) returns void language plpgsql as $$
begin
  if p_actual is distinct from p_expected then
    raise exception 'FAIL %: expected [%], got [%]', p_label, p_expected, p_actual;
  end if;
  insert into t.log values (p_label);
end $$;

create or replace function t.run(p_sql text) returns void language plpgsql as $$
begin
  execute p_sql;
end $$;

create or replace function t.scalar(p_sql text) returns text language plpgsql as $$
declare v text;
begin
  execute p_sql into v;
  return v;
end $$;

-- ─────────────────────────────────────────────────────────────
-- Fixtures
-- ─────────────────────────────────────────────────────────────
insert into auth.users (id, email, raw_user_meta_data) values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'tourist-a@test.local', '{"full_name":"Alice Martin"}'),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'tourist-b@test.local', '{"full_name":"Bob Durand"}'),
  ('aaaaaaaa-0000-4000-8000-000000000003', 'provider-new@test.local', '{"role":"provider","full_name":"Paul Nouveau","business_name":"Paul Services"}'),
  ('aaaaaaaa-0000-4000-8000-000000000004', 'admin@test.local', '{"full_name":"Admin Ohaana"}'),
  ('aaaaaaaa-0000-4000-8000-000000000005', 'sneaky@test.local', '{"role":"admin","full_name":"Sneaky"}');

update public.users set role = 'admin' where id = 'aaaaaaaa-0000-4000-8000-000000000004';

-- ─────────────────────────────────────────────────────────────
-- 1. Inscription / escalade de privilèges
-- ─────────────────────────────────────────────────────────────
do $$
declare
  A constant uuid := 'aaaaaaaa-0000-4000-8000-000000000001';
  B constant uuid := 'aaaaaaaa-0000-4000-8000-000000000002';
begin
  perform t.eq('signup with role=admin metadata becomes tourist',
    t.scalar($q$select role::text from public.users where id = 'aaaaaaaa-0000-4000-8000-000000000005'$q$), 'tourist');
  perform t.eq('tourist signup creates a tourist_profile',
    t.scalar($q$select count(*)::text from public.tourist_profiles where user_id = 'aaaaaaaa-0000-4000-8000-000000000001'$q$), '1');
  perform t.eq('provider signup creates an unapproved provider_profile',
    t.scalar($q$select is_approved::text from public.provider_profiles where user_id = 'aaaaaaaa-0000-4000-8000-000000000003'$q$), 'false');

  perform t.as_user(A);
  perform t.fails('tourist cannot promote self to admin',
    format($q$update public.users set role = 'admin' where id = %L$q$, A), '42501');
  perform t.fails('tourist cannot change own email',
    format($q$update public.users set email = 'x@x.io' where id = %L$q$, A), '42501');
  perform t.scalar(format($q$update public.users set full_name = 'Alice M.' where id = %L returning id::text$q$, A));
  perform t.eq('tourist can edit own name',
    t.scalar(format($q$select full_name from public.users where id = %L$q$, A)), 'Alice M.');
  perform t.eq('tourist cannot read other users',
    t.scalar(format($q$select count(*)::text from public.users where id = %L$q$, B)), '0');
  perform t.eq('tourist sees only self in users', t.scalar('select count(*)::text from public.users'), '1');
  perform t.reset();
end $$;

-- become_provider (inscription OAuth "prestataire") : tourist -> provider uniquement
do $$
declare
  A constant uuid := 'aaaaaaaa-0000-4000-8000-000000000001';
begin
  perform t.as_anon();
  perform t.fails('anon cannot call become_provider', 'select public.become_provider()', '42501');
  perform t.as_user('aaaaaaaa-0000-4000-8000-000000000004');   -- admin
  perform t.fails('an admin cannot be downgraded through become_provider', 'select public.become_provider()', '42501');
  perform t.reset();

  insert into auth.users (id, email, raw_user_meta_data)
  values ('aaaaaaaa-0000-4000-8000-000000000006', 'oauth-pro@test.local', '{"full_name":"Olivia Pro"}');
  perform t.as_user('aaaaaaaa-0000-4000-8000-000000000006');
  perform t.run($q$select public.become_provider('Olivia Services')$q$);
  perform t.run($q$select public.become_provider('Olivia Services')$q$);   -- idempotent
  perform t.reset();
  perform t.eq('tourist became provider',
    t.scalar($q$select role::text from public.users where id = 'aaaaaaaa-0000-4000-8000-000000000006'$q$), 'provider');
  perform t.eq('provider profile created, unapproved',
    t.scalar($q$select business_name || '/' || is_approved::text from public.provider_profiles where user_id = 'aaaaaaaa-0000-4000-8000-000000000006'$q$), 'Olivia Services/false');
end $$;

-- ─────────────────────────────────────────────────────────────
-- 2. Prestataire : auto-approbation / publication interdites
-- ─────────────────────────────────────────────────────────────
do $$
declare
  P constant uuid := 'aaaaaaaa-0000-4000-8000-000000000003';
  v_pid uuid;
  v_sid uuid;
begin
  select id into v_pid from public.provider_profiles where user_id = P;

  perform t.as_user(P);
  perform t.fails('provider cannot self-approve',
    format($q$update public.provider_profiles set is_approved = true where id = %L$q$, v_pid), '42501');
  perform t.fails('provider cannot set own stripe account',
    format($q$update public.provider_profiles set stripe_account_id = 'acct_x' where id = %L$q$, v_pid), '42501');
  perform t.fails('provider cannot fake rating',
    format($q$update public.provider_profiles set avg_rating = 5 where id = %L$q$, v_pid), '42501');
  perform t.scalar(format($q$update public.provider_profiles set bio = 'Bio test' where id = %L returning id::text$q$, v_pid));
  perform t.eq('provider can edit own bio',
    t.scalar(format($q$select bio from public.provider_profiles where id = %L$q$, v_pid)), 'Bio test');

  -- insertion d'un service : "published" est ramené à "draft"
  v_sid := t.scalar(format($q$insert into public.services (provider_id, category_id, title_fr, price_cents, status, is_featured)
    values (%L, '00000000-0000-4000-8000-000000000c01', 'Service test', 5000, 'published', true) returning id::text$q$, v_pid))::uuid;
  perform t.eq('inserted service is forced to draft',
    t.scalar(format($q$select status::text from public.services where id = %L$q$, v_sid)), 'draft');
  perform t.eq('inserted service cannot be featured',
    t.scalar(format($q$select is_featured::text from public.services where id = %L$q$, v_sid)), 'false');
  perform t.fails('provider cannot publish',
    format($q$update public.services set status = 'published' where id = %L$q$, v_sid), '42501');
  perform t.fails('provider cannot feature a service',
    format($q$update public.services set is_featured = true where id = %L$q$, v_sid), '42501');
  perform t.scalar(format($q$update public.services set status = 'pending_review' where id = %L returning id::text$q$, v_sid));
  perform t.eq('provider can submit for review',
    t.scalar(format($q$select status::text from public.services where id = %L$q$, v_sid)), 'pending_review');

  -- disponibilités : génération idempotente (on conflict do nothing) puis blocage d'un jour, sous RLS
  perform t.scalar(format($q$with ins as (insert into public.availability_slots (service_id, date, start_time, end_time)
    values (%L, current_date + 40, '09:00', '11:00'), (%L, current_date + 40, '14:00', '16:00')
    on conflict (service_id, date, start_time) do nothing returning 1) select count(*)::text from ins$q$, v_sid, v_sid));
  perform t.eq('provider re-generating slots creates no duplicate',
    t.scalar(format($q$with ins as (insert into public.availability_slots (service_id, date, start_time, end_time)
      values (%L, current_date + 40, '09:00', '11:00') on conflict (service_id, date, start_time) do nothing returning 1)
      select count(*)::text from ins$q$, v_sid)), '0');
  perform t.scalar(format($q$with u as (update public.availability_slots set is_available = false
    where service_id = %L and date = current_date + 40 returning 1) select count(*)::text from u$q$, v_sid));
  perform t.eq('provider can block a whole day',
    t.scalar(format($q$select count(*)::text from public.availability_slots
      where service_id = %L and date = current_date + 40 and not is_available$q$, v_sid)), '2');
  perform t.reset();

  -- le brouillon n'est pas public
  perform t.as_anon();
  perform t.eq('anon cannot see non-published service',
    t.scalar(format($q$select count(*)::text from public.services where id = %L$q$, v_sid)), '0');
  perform t.reset();

  -- l'admin ne peut pas publier pour un prestataire non approuvé (invariant)
  perform t.as_user('aaaaaaaa-0000-4000-8000-000000000004');
  perform t.fails('cannot publish for a non-approved provider',
    format($q$update public.services set status = 'published' where id = %L$q$, v_sid), '23514');
  perform t.scalar(format($q$update public.provider_profiles set is_approved = true where id = %L returning id::text$q$, v_pid));
  perform t.scalar(format($q$update public.services set status = 'published' where id = %L returning id::text$q$, v_sid));
  perform t.eq('admin can approve provider and publish',
    t.scalar(format($q$select status::text from public.services where id = %L$q$, v_sid)), 'published');

  -- modération : refus avec motif, journal d'audit, suspension qui dépublie
  perform t.scalar(format($q$update public.services set status = 'pending_review' where id = %L returning id::text$q$, v_sid));
  perform t.scalar(format($q$update public.services set status = 'rejected', rejection_reason = 'Photos manquantes' where id = %L returning id::text$q$, v_sid));
  perform t.eq('admin can reject with a reason',
    t.scalar(format($q$select rejection_reason from public.services where id = %L$q$, v_sid)), 'Photos manquantes');
  perform t.scalar($q$insert into public.admin_logs (admin_id, action, target_type) values (auth.uid(), 'service.reject', 'service') returning id::text$q$);
  perform t.fails('admin cannot log as another admin',
    $q$insert into public.admin_logs (admin_id, action) values ('aaaaaaaa-0000-4000-8000-000000000001', 'x')$q$, '42501');
  perform t.reset();

  -- le prestataire voit le motif de refus mais ne peut ni le modifier ni lire le journal admin
  perform t.as_user(P);
  perform t.eq('provider sees the rejection reason',
    t.scalar(format($q$select rejection_reason from public.services where id = %L$q$, v_sid)), 'Photos manquantes');
  perform t.fails('provider cannot edit the rejection reason',
    format($q$update public.services set rejection_reason = null where id = %L$q$, v_sid), '42501');
  perform t.eq('provider cannot read admin logs',
    t.scalar('select count(*)::text from public.admin_logs'), '0');
  perform t.reset();
end $$;

-- ─────────────────────────────────────────────────────────────
-- 2b. Prestataire « géré » créé par l'admin (sans compte)
-- ─────────────────────────────────────────────────────────────
do $$
declare
  v_pid uuid;
  v_sid uuid;
begin
  perform t.as_user('aaaaaaaa-0000-4000-8000-000000000004');
  v_pid := t.scalar($q$insert into public.provider_profiles (user_id, business_name, island, is_approved, claimed, created_by_admin_id)
    values (null, 'Géré test', 'guadeloupe', true, false, auth.uid()) returning id::text$q$)::uuid;
  v_sid := t.scalar(format($q$insert into public.services (provider_id, category_id, title_fr, price_cents, duration_min, capacity_min, capacity_max, status, created_by_admin_id)
    values (%L, '00000000-0000-4000-8000-000000000c01', 'Service géré test', 8000, 90, 1, 4, 'draft', auth.uid()) returning id::text$q$, v_pid))::uuid;
  perform t.scalar(format($q$update public.services set status = 'published' where id = %L returning id::text$q$, v_sid));
  perform t.eq('admin-created provider has no account',
    t.scalar(format($q$select (user_id is null)::text from public.provider_profiles where id = %L$q$, v_pid)), 'true');
  perform t.reset();

  perform t.as_anon();
  perform t.eq('managed provider is visible in the public view',
    t.scalar(format($q$select count(*)::text from public.public_provider_profiles where id = %L$q$, v_pid)), '1');
  perform t.eq('managed provider service is publicly readable once published',
    t.scalar(format($q$select count(*)::text from public.services where id = %L$q$, v_sid)), '1');
  perform t.reset();

  -- un prestataire ordinaire ne peut pas se fabriquer une fiche approuvée sans compte
  perform t.as_user('aaaaaaaa-0000-4000-8000-000000000003');
  perform t.eq('provider cannot even see a managed profile row',
    t.scalar(format($q$select count(*)::text from public.provider_profiles where id = %L$q$, v_pid)), '0');
  perform t.scalar(format($q$with u as (update public.provider_profiles set user_id = auth.uid() where id = %L returning 1) select count(*)::text from u$q$, v_pid));
  perform t.reset();
  perform t.eq('managed profile is still unclaimed after a takeover attempt',
    t.scalar(format($q$select (user_id is null)::text from public.provider_profiles where id = %L$q$, v_pid)), 'true');
end $$;

-- ─────────────────────────────────────────────────────────────
-- 2c. Administration : utilisateurs, catégories, leads
-- ─────────────────────────────────────────────────────────────
do $$
declare
  v_cat uuid;
  v_lead uuid;
begin
  -- un admin change un rôle et désactive un compte ; un voyageur ne peut ni l'un ni l'autre
  perform t.as_user('aaaaaaaa-0000-4000-8000-000000000004');
  perform t.scalar($q$update public.users set role = 'concierge' where id = 'aaaaaaaa-0000-4000-8000-000000000002' returning id::text$q$);
  perform t.eq('admin can change a user role',
    t.scalar($q$select role::text from public.users where id = 'aaaaaaaa-0000-4000-8000-000000000002'$q$), 'concierge');
  perform t.scalar($q$update public.users set is_active = false where id = 'aaaaaaaa-0000-4000-8000-000000000002' returning id::text$q$);
  perform t.eq('admin can deactivate a user',
    t.scalar($q$select is_active::text from public.users where id = 'aaaaaaaa-0000-4000-8000-000000000002'$q$), 'false');
  perform t.scalar($q$update public.users set role = 'tourist', is_active = true where id = 'aaaaaaaa-0000-4000-8000-000000000002' returning id::text$q$);

  -- catégories : l'admin écrit, personne d'autre
  v_cat := t.scalar($q$insert into public.service_categories (slug, name_fr, name_en, name_es, sort_order)
    values ('e2e_test_cat', 'Test', 'Test', 'Prueba', 99) returning id::text$q$)::uuid;
  perform t.scalar(format($q$update public.service_categories set name_fr = 'Test 2' where id = %L returning id::text$q$, v_cat));
  perform t.eq('admin can create and edit a category',
    t.scalar(format($q$select name_fr from public.service_categories where id = %L$q$, v_cat)), 'Test 2');

  -- leads : l'admin les lit et change leur statut
  v_lead := t.scalar($q$insert into public.leads (email, consent) values ('admin-lead@test.local', true) returning id::text$q$)::uuid;
  perform t.scalar(format($q$update public.leads set status = 'contacted' where id = %L returning id::text$q$, v_lead));
  perform t.eq('admin can read leads and change their status',
    t.scalar(format($q$select status::text from public.leads where id = %L$q$, v_lead)), 'contacted');
  perform t.scalar(format($q$delete from public.leads where id = %L returning id::text$q$, v_lead));  -- ne pas fausser les comptes plus bas
  perform t.reset();

  perform t.as_user('aaaaaaaa-0000-4000-8000-000000000003');
  perform t.scalar(format($q$with u as (update public.service_categories set name_fr = 'Piraté' where id = %L returning 1) select count(*)::text from u$q$, v_cat));
  perform t.eq('provider cannot edit a category',
    t.scalar(format($q$select name_fr from public.service_categories where id = %L$q$, v_cat)), 'Test 2');
  perform t.eq('provider cannot read leads', t.scalar('select count(*)::text from public.leads'), '0');
  perform t.reset();
end $$;

-- ─────────────────────────────────────────────────────────────
-- 2d. Commission (migration 009) : lecture publique bornée, écriture admin validée
-- ─────────────────────────────────────────────────────────────
do $$
begin
  perform t.as_anon();
  perform t.eq('anyone can read the commission rate (default 20)', t.scalar('select public.get_commission_pct()::text'), '20');
  perform t.fails('anon cannot read platform_settings itself',
    $q$select count(*) from public.platform_settings$q$, '42501');
  perform t.reset();

  perform t.as_user('aaaaaaaa-0000-4000-8000-000000000004');
  perform t.scalar($q$update public.platform_settings set value = '15'::jsonb where key = 'commission_pct' returning key$q$);
  perform t.eq('admin can change the commission rate', t.scalar('select public.get_commission_pct()::text'), '15');
  perform t.fails('a rate above 50 is refused',
    $q$update public.platform_settings set value = '60'::jsonb where key = 'commission_pct'$q$, '23514');
  perform t.fails('a negative rate is refused',
    $q$update public.platform_settings set value = '-1'::jsonb where key = 'commission_pct'$q$, '23514');
  perform t.fails('a non-numeric rate is refused',
    $q$update public.platform_settings set value = '"abc"'::jsonb where key = 'commission_pct'$q$, '23514');
  perform t.scalar($q$update public.platform_settings set value = '20'::jsonb where key = 'commission_pct' returning key$q$);
  perform t.reset();

  perform t.as_user('aaaaaaaa-0000-4000-8000-000000000003');
  perform t.scalar($q$with u as (update public.platform_settings set value = '0'::jsonb where key = 'commission_pct' returning 1) select count(*)::text from u$q$);
  perform t.eq('a provider cannot lower the commission', t.scalar('select public.get_commission_pct()::text'), '20');
  perform t.reset();
end $$;

-- ─────────────────────────────────────────────────────────────
-- 3. Lecture publique : pas de fuite de données de contact
-- ─────────────────────────────────────────────────────────────
do $$
begin
  perform t.as_anon();
  perform t.eq('anon reads published demo services',
    t.scalar($q$select (count(*) >= 10)::text from public.services where is_demo$q$), 'true');
  perform t.eq('anon cannot read provider_profiles table',
    t.scalar('select count(*)::text from public.provider_profiles'), '0');
  perform t.eq('anon reads approved providers via the public view',
    t.scalar('select (count(*) >= 10)::text from public.public_provider_profiles'), 'true');
  perform t.eq('public view exposes no phone / whatsapp / stripe column',
    t.scalar($q$select count(*)::text from information_schema.columns
                where table_name = 'public_provider_profiles' and column_name in ('phone','whatsapp','stripe_account_id')$q$), '0');
  perform t.reset();
end $$;



-- ─────────────────────────────────────────────────────────────
-- 4. Réservation : prix serveur, anti double réservation, annulation
-- ─────────────────────────────────────────────────────────────
do $$
declare
  A constant uuid := 'aaaaaaaa-0000-4000-8000-000000000001';
  B constant uuid := 'aaaaaaaa-0000-4000-8000-000000000002';
  v_service uuid; v_price int; v_slot10 uuid; v_slot11 uuid; v_slot15 uuid;
  v_booking uuid; v_pro_user uuid;
begin
  select s.id, s.price_cents into v_service, v_price from public.services s where s.title_fr like 'Dîner de chef%' limit 1;
  select id into v_slot10 from public.availability_slots where service_id = v_service and date = current_date + 10 and start_time = '10:00';
  select id into v_slot11 from public.availability_slots where service_id = v_service and date = current_date + 10 and start_time = '11:00';
  select id into v_slot15 from public.availability_slots where service_id = v_service and date = current_date + 10 and start_time = '15:00';
  select pp.user_id into v_pro_user from public.services s join public.provider_profiles pp on pp.id = s.provider_id where s.id = v_service;

  perform t.as_user(A);
  perform t.fails('tourist cannot insert a booking directly (even at 0 EUR / confirmed)',
    format($q$insert into public.bookings (service_id, tourist_id, slot_id, status, guests_count, total_cents)
              values (%L, %L, %L, 'confirmed', 2, 0)$q$, v_service, A, v_slot10), '42501');
  perform t.fails('guests above capacity are rejected',
    format($q$select public.create_booking(%L, %L, 99)$q$, v_service, v_slot10), '22023');

  v_booking := t.scalar(format($q$select (public.create_booking(%L, %L, 2, 'note', 'Villa Test')).id::text$q$, v_service, v_slot10))::uuid;
  perform t.eq('create_booking computes total server-side (price x guests)',
    t.scalar(format($q$select total_cents::text from public.bookings where id = %L$q$, v_booking)), (v_price * 2)::text);
  perform t.eq('new booking is pending', t.scalar(format($q$select status::text from public.bookings where id = %L$q$, v_booking)), 'pending');
  perform t.eq('new booking has a hold expiry', t.scalar(format($q$select (expires_at > now())::text from public.bookings where id = %L$q$, v_booking)), 'true');

  -- le client ne peut pas réécrire sa réservation
  perform t.eq('tourist update on bookings affects 0 rows (no update policy)',
    t.scalar(format($q$with u as (update public.bookings set total_cents = 1, status = 'confirmed' where id = %L returning 1) select count(*)::text from u$q$, v_booking)), '0');
  perform t.reset();

  -- le prestataire reçoit une notification
  perform t.eq('provider is notified of the new booking',
    t.scalar(format($q$select count(*)::text from public.notifications where user_id = %L and type = 'booking_new'$q$, v_pro_user)), '1');

  -- vue publique des disponibilités : le créneau pris et ceux qui le chevauchent disparaissent
  perform t.as_anon();
  perform t.eq('booked slot disappears from public availability',
    t.scalar(format($q$select count(*)::text from public.public_slot_availability where id = %L$q$, v_slot10)), '0');
  perform t.eq('overlapping slot of the same provider disappears too',
    t.scalar(format($q$select count(*)::text from public.public_slot_availability where id = %L$q$, v_slot11)), '0');
  perform t.eq('a later slot stays available',
    t.scalar(format($q$select count(*)::text from public.public_slot_availability where id = %L$q$, v_slot15)), '1');
  perform t.fails('public availability exposes no booking column',
    $q$select tourist_id from public.public_slot_availability$q$, '42703');
  perform t.reset();

  -- double réservation / chevauchement
  perform t.as_user(B);
  perform t.fails('same slot cannot be booked twice',
    format($q$select public.create_booking(%L, %L, 2)$q$, v_service, v_slot10), '23505');
  perform t.fails('provider cannot be double-booked on an overlapping slot',
    format($q$select public.create_booking(%L, %L, 2)$q$, v_service, v_slot11), '23505');
  perform t.eq('tourist B cannot read tourist A booking',
    t.scalar(format($q$select count(*)::text from public.bookings where id = %L$q$, v_booking)), '0');
  perform t.fails('tourist B cannot cancel tourist A booking',
    format($q$select public.cancel_booking(%L)$q$, v_booking), 'P0002');
  perform t.reset();

  -- anon
  perform t.as_anon();
  perform t.fails('anon cannot call create_booking',
    format($q$select public.create_booking(%L, %L, 2)$q$, v_service, v_slot15), '42501');
  perform t.eq('anon cannot read bookings', t.scalar('select count(*)::text from public.bookings'), '0');
  perform t.reset();

  -- annulation puis libération du créneau
  perform t.as_user(A);
  perform t.eq('tourist cancels own pending booking',
    t.scalar(format($q$select (public.cancel_booking(%L, 'change of plans')).status::text$q$, v_booking)), 'cancelled_tourist');
  perform t.fails('a cancelled booking cannot be cancelled again',
    format($q$select public.cancel_booking(%L)$q$, v_booking), '22023');
  perform t.reset();

  perform t.as_user(B);
  perform t.eq('slot is free again after cancellation',
    t.scalar(format($q$select (public.create_booking(%L, %L, 2)).status::text$q$, v_service, v_slot10)), 'pending');
  perform t.reset();
end $$;

-- ─────────────────────────────────────────────────────────────
-- 5. Prestataire propriétaire : statuts autorisés, avis
-- ─────────────────────────────────────────────────────────────
do $$
declare
  A constant uuid := 'aaaaaaaa-0000-4000-8000-000000000001';
  B constant uuid := 'aaaaaaaa-0000-4000-8000-000000000002';
  P constant uuid := 'aaaaaaaa-0000-4000-8000-000000000003';
  v_service uuid; v_slot uuid; v_booking uuid; v_pro_user uuid; v_review uuid;
begin
  select s.id into v_service from public.services s where s.title_fr like 'Dîner de chef%' limit 1;
  select pp.user_id into v_pro_user from public.services s join public.provider_profiles pp on pp.id = s.provider_id where s.id = v_service;
  select id into v_slot from public.availability_slots where service_id = v_service and date = current_date + 12 and start_time = '18:00';

  perform t.as_user(A);
  v_booking := t.scalar(format($q$select (public.create_booking(%L, %L, 2)).id::text$q$, v_service, v_slot))::uuid;
  perform t.fails('cannot review a booking that is not completed',
    format($q$select public.create_review(%L, 5, 'super')$q$, v_booking), '22023');
  perform t.fails('tourist cannot insert a review directly',
    format($q$insert into public.reviews (booking_id, tourist_id, provider_id, service_id, rating)
              select b.id, b.tourist_id, s.provider_id, s.id, 5
                from public.bookings b join public.services s on s.id = b.service_id where b.id = %L$q$, v_booking), '42501');
  perform t.reset();

  -- un autre prestataire ne voit rien et ne peut rien changer
  perform t.as_user(P);
  perform t.eq('unrelated provider cannot read the booking',
    t.scalar(format($q$select count(*)::text from public.bookings where id = %L$q$, v_booking)), '0');
  perform t.fails('unrelated provider cannot change the booking',
    format($q$select public.provider_set_booking_status(%L, 'cancelled_provider')$q$, v_booking), 'P0002');
  perform t.reset();

  -- prestataire propriétaire
  perform t.as_user(v_pro_user);
  perform t.eq('owner provider reads its bookings', t.scalar(format($q$select count(*)::text from public.bookings where id = %L$q$, v_booking)), '1');
  perform t.eq('owner provider sees only the tourist first name',
    t.scalar(format($q$select tourist_first_name from public.provider_booking_details where id = %L$q$, v_booking)), 'Alice');
  perform t.fails('provider cannot confirm a booking (payment-driven)',
    format($q$select public.provider_set_booking_status(%L, 'confirmed')$q$, v_booking), '22023');
  perform t.fails('provider cannot complete a booking before it happens',
    format($q$select public.provider_set_booking_status(%L, 'completed')$q$, v_booking), '22023');
  perform t.reset();

  -- paiement validé côté serveur (webhook, service_role / postgres) puis prestation passée
  update public.bookings set status = 'confirmed', expires_at = null where id = v_booking;

  perform t.as_user(A);
  perform t.eq('tourist gets provider contact once confirmed',
    t.scalar(format($q$select count(*)::text from public.get_provider_contact(%L)$q$, v_booking)), '1');
  perform t.reset();
  perform t.as_user(B);
  perform t.eq('another tourist gets no contact',
    t.scalar(format($q$select count(*)::text from public.get_provider_contact(%L)$q$, v_booking)), '0');
  perform t.reset();

  update public.bookings set starts_at = now() - interval '1 day' where id = v_booking;

  perform t.as_user(v_pro_user);
  perform t.eq('provider completes a past confirmed booking',
    t.scalar(format($q$select (public.provider_set_booking_status(%L, 'completed')).status::text$q$, v_booking)), 'completed');
  perform t.reset();

  -- avis
  perform t.as_user(B);
  perform t.fails('another tourist cannot review the booking',
    format($q$select public.create_review(%L, 5)$q$, v_booking), 'P0002');
  perform t.reset();

  perform t.as_user(A);
  perform t.fails('rating out of range', format($q$select public.create_review(%L, 9)$q$, v_booking), '22023');
  v_review := t.scalar(format($q$select (public.create_review(%L, 4, 'Très bien')).id::text$q$, v_booking))::uuid;
  perform t.fails('only one review per booking',
    format($q$select public.create_review(%L, 5)$q$, v_booking), '23505');
  perform t.fails('tourist cannot unpublish / republish own review',
    format($q$update public.reviews set is_published = false where id = %L$q$, v_review), '42501');
  perform t.scalar(format($q$update public.reviews set content = 'Excellent' where id = %L returning id::text$q$, v_review));
  perform t.reset();

  perform t.eq('service rating is recomputed from real reviews',
    t.scalar(format($q$select avg_rating::text || '/' || review_count::text from public.services where id = %L$q$, v_service)), '4.00/1');
  perform t.eq('service booking_count incremented on completion',
    t.scalar(format($q$select (booking_count >= 1)::text from public.services where id = %L$q$, v_service)), 'true');

  perform t.as_anon();
  perform t.eq('anon reads the published review with first name only',
    t.scalar(format($q$select author_first_name from public.public_reviews where id = %L$q$, v_review)), 'Alice');
  perform t.reset();
end $$;

-- ─────────────────────────────────────────────────────────────
-- 6. Leads, notifications, réglages, candidatures
-- ─────────────────────────────────────────────────────────────
do $$
declare
  A constant uuid := 'aaaaaaaa-0000-4000-8000-000000000001';
  v_notif uuid;
begin
  perform t.as_anon();
  -- (pas de RETURNING : anon n'a volontairement aucune policy SELECT sur leads)
  perform t.run($q$insert into public.leads (email, destination, consent) values ('lead@test.local', 'guadeloupe', true)$q$);
  perform t.fails('lead without consent is rejected',
    $q$insert into public.leads (email, consent) values ('lead2@test.local', false)$q$, '42501');
  perform t.fails('invalid email is rejected',
    $q$insert into public.leads (email, consent) values ('not-an-email', true)$q$, '23514');
  perform t.fails('same email cannot create two leads on the same day',
    $q$insert into public.leads (email, consent) values ('LEAD@test.local', true)$q$, '23505');
  perform t.fails('anon cannot set a lead status',
    $q$insert into public.leads (email, consent, status) values ('lead3@test.local', true, 'converted')$q$, '42501');
  perform t.eq('anon cannot read leads', t.scalar('select count(*)::text from public.leads'), '0');
  perform t.reset();

  perform t.as_user(A);
  perform t.eq('tourist cannot read leads', t.scalar('select count(*)::text from public.leads'), '0');
  perform t.eq('tourist cannot read platform_settings', t.scalar('select count(*)::text from public.platform_settings'), '0');
  perform t.fails('tourist cannot read webhook_events', 'select count(*) from public.webhook_events', '42501');
  perform t.fails('tourist cannot forge a notification',
    format($q$insert into public.notifications (user_id, type, title_fr) values (%L, 'promo', 'x')$q$, A), '42501');
  perform t.reset();

  perform public.notify(A, 'promo', 'Titre', 'Title', null, null);
  perform t.as_user(A);
  v_notif := t.scalar(format($q$select id::text from public.notifications where user_id = %L limit 1$q$, A))::uuid;
  perform t.fails('tourist cannot rewrite a notification',
    format($q$update public.notifications set title_fr = 'hack' where id = %L$q$, v_notif), '42501');
  perform t.scalar(format($q$update public.notifications set is_read = true where id = %L returning id::text$q$, v_notif));
  perform t.fails('tourist cannot call notify()', format($q$select public.notify(%L, 'promo', 'a', 'b', null, null)$q$, A), '42501');
  perform t.fails('tourist cannot call purge_demo_data', 'select public.purge_demo_data()', '42501');
  perform t.reset();

  perform t.as_user('aaaaaaaa-0000-4000-8000-000000000004');
  perform t.eq('admin reads leads', t.scalar('select count(*)::text from public.leads'), '1');
  perform t.eq('admin reads platform_settings', t.scalar('select count(*)::text from public.platform_settings'), '2');
  perform t.reset();
end $$;

-- ─────────────────────────────────────────────────────────────
-- 7. Storage
-- ─────────────────────────────────────────────────────────────
do $$
declare
  P constant uuid := 'aaaaaaaa-0000-4000-8000-000000000003';
  v_pid uuid;
begin
  select id into v_pid from public.provider_profiles where user_id = P;

  perform t.as_user(P);
  perform t.scalar(format($q$insert into storage.objects (bucket_id, name) values ('service-images', %L) returning id::text$q$, v_pid || '/cover.jpg'));
  perform t.fails('provider cannot write in another provider folder',
    $q$insert into storage.objects (bucket_id, name) values ('service-images', 'someone-else/cover.jpg')$q$, '42501');
  perform t.fails('provider cannot write in the root',
    $q$insert into storage.objects (bucket_id, name) values ('service-images', 'cover.jpg')$q$, '42501');
  perform t.scalar(format($q$insert into storage.objects (bucket_id, name) values ('provider-docs', %L) returning id::text$q$, v_pid || '/kbis.pdf'));
  perform t.reset();

  perform t.as_anon();
  perform t.eq('anyone can read a public service image',
    t.scalar($q$select count(*)::text from storage.objects where bucket_id = 'service-images'$q$), '1');
  perform t.eq('private documents are not readable by anon',
    t.scalar($q$select count(*)::text from storage.objects where bucket_id = 'provider-docs'$q$), '0');
  perform t.reset();

  perform t.as_user('aaaaaaaa-0000-4000-8000-000000000001');
  perform t.eq('another user cannot read provider documents',
    t.scalar($q$select count(*)::text from storage.objects where bucket_id = 'provider-docs'$q$), '0');
  perform t.reset();

  perform t.as_user('aaaaaaaa-0000-4000-8000-000000000004');
  perform t.eq('admin reads provider documents',
    t.scalar($q$select count(*)::text from storage.objects where bucket_id = 'provider-docs'$q$), '1');
  perform t.reset();
end $$;

-- ─────────────────────────────────────────────────────────────
-- 8. Purge des données de démo
-- ─────────────────────────────────────────────────────────────
do $$
begin
  perform t.as_user('aaaaaaaa-0000-4000-8000-000000000004');
  perform public.purge_demo_data();
  perform t.reset();
  perform t.eq('purge removes demo services', t.scalar('select count(*)::text from public.services where is_demo'), '0');
  perform t.eq('purge removes demo users', t.scalar('select count(*)::text from public.users where is_demo'), '0');
  perform t.eq('purge keeps real users', t.scalar($q$select count(*)::text from public.users where email like '%@test.local'$q$), '6');
  perform t.eq('purge keeps real services', t.scalar($q$select count(*)::text from public.services where title_fr = 'Service test'$q$), '1');
end $$;

select t.reset();
