-- Ohaana — Migration 004 : sécurité (triggers de protection de colonnes), RPC métier,
-- vues publiques, policies des tables de 003.
--
-- Modèle de confiance : le code exécuté par un client (rôles anon / authenticated) est
-- contraint ; le code exécuté dans une fonction security definer, par service_role ou par
-- l'éditeur SQL (current_user = postgres) est de confiance. Voir public.is_client_role().

-- ─────────────────────────────────────────────────────────────
-- 1. handle_new_user v2 : rôle tourist|provider uniquement + profil associé
-- ─────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role public.user_role;
  v_name text := nullif(trim(new.raw_user_meta_data ->> 'full_name'), '');
begin
  -- Le rôle vient de métadonnées contrôlées par l'utilisateur : jamais admin/concierge/partner.
  v_role := case new.raw_user_meta_data ->> 'role'
              when 'provider' then 'provider'::public.user_role
              else 'tourist'::public.user_role
            end;

  insert into public.users (id, email, full_name, avatar_url, role, locale)
  values (
    new.id,
    new.email,
    v_name,
    new.raw_user_meta_data ->> 'avatar_url',
    v_role,
    case when new.raw_user_meta_data ->> 'locale' in ('fr', 'en', 'es')
         then new.raw_user_meta_data ->> 'locale' else 'fr' end
  );

  if v_role = 'provider' then
    insert into public.provider_profiles (user_id, business_name)
    values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'business_name'), ''), v_name, split_part(new.email, '@', 1)));
  else
    insert into public.tourist_profiles (user_id) values (new.id);
  end if;

  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- 2. Triggers de protection de colonnes
--    (RLS filtre des lignes, pas des colonnes : sans cela un utilisateur pourrait
--     s'auto-promouvoir admin ou s'auto-approuver)
-- ─────────────────────────────────────────────────────────────
create or replace function public.protect_users_columns()
returns trigger language plpgsql as $$
begin
  if public.is_client_role() and not public.is_admin() then
    if new.role is distinct from old.role
       or new.is_active is distinct from old.is_active
       or new.email is distinct from old.email
       or new.is_demo is distinct from old.is_demo
       or new.id is distinct from old.id then
      raise exception 'Protected column: only an admin can change role, is_active, email' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_users_protect
  before update on public.users
  for each row execute procedure public.protect_users_columns();

create or replace function public.protect_provider_columns()
returns trigger language plpgsql as $$
begin
  if public.is_client_role() and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.is_approved         := false;
      new.stripe_account_id   := null;
      new.stripe_onboarded    := false;
      new.avg_rating          := 0;
      new.review_count        := 0;
      new.created_by_admin_id := null;
      new.claimed             := true;
      new.claim_token_hash    := null;
      new.claimed_at          := null;
      new.is_demo             := false;
    else
      if new.is_approved is distinct from old.is_approved
         or new.stripe_account_id is distinct from old.stripe_account_id
         or new.stripe_onboarded is distinct from old.stripe_onboarded
         or new.avg_rating is distinct from old.avg_rating
         or new.review_count is distinct from old.review_count
         or new.created_by_admin_id is distinct from old.created_by_admin_id
         or new.claimed is distinct from old.claimed
         or new.claim_token_hash is distinct from old.claim_token_hash
         or new.claimed_at is distinct from old.claimed_at
         or new.is_demo is distinct from old.is_demo
         or new.user_id is distinct from old.user_id then
        raise exception 'Protected column on provider_profiles' using errcode = '42501';
      end if;
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_provider_protect
  before insert or update on public.provider_profiles
  for each row execute procedure public.protect_provider_columns();

create or replace function public.protect_service_columns()
returns trigger language plpgsql as $$
begin
  if public.is_client_role() and not public.is_admin() then
    if tg_op = 'INSERT' then
      if new.status not in ('draft', 'pending_review') then new.status := 'draft'; end if;
      new.is_featured         := false;
      new.avg_rating          := 0;
      new.review_count        := 0;
      new.booking_count       := 0;
      new.created_by_admin_id := null;
      new.rejection_reason    := null;
      new.is_demo             := false;
    else
      if new.provider_id is distinct from old.provider_id
         or new.is_featured is distinct from old.is_featured
         or new.avg_rating is distinct from old.avg_rating
         or new.review_count is distinct from old.review_count
         or new.booking_count is distinct from old.booking_count
         or new.created_by_admin_id is distinct from old.created_by_admin_id
         or new.rejection_reason is distinct from old.rejection_reason
         or new.is_demo is distinct from old.is_demo then
        raise exception 'Protected column on services' using errcode = '42501';
      end if;
      if new.status is distinct from old.status and new.status in ('published', 'rejected') then
        raise exception 'Only an admin can publish or reject a service' using errcode = '42501';
      end if;
    end if;
  end if;

  -- Invariant pour tout le monde : on ne publie que pour un prestataire approuvé.
  if new.status = 'published' and not public.provider_is_approved(new.provider_id) then
    raise exception 'Cannot publish a service of a non-approved provider' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger trg_services_protect
  before insert or update on public.services
  for each row execute procedure public.protect_service_columns();

create or replace function public.protect_review_columns()
returns trigger language plpgsql as $$
begin
  if public.is_client_role() and not public.is_admin() then
    if new.booking_id is distinct from old.booking_id
       or new.tourist_id is distinct from old.tourist_id
       or new.provider_id is distinct from old.provider_id
       or new.service_id is distinct from old.service_id
       or new.is_published is distinct from old.is_published
       or new.provider_reply is distinct from old.provider_reply
       or new.provider_replied_at is distinct from old.provider_replied_at then
      raise exception 'Only rating and content can be edited' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_reviews_protect
  before update on public.reviews
  for each row execute procedure public.protect_review_columns();

create or replace function public.protect_notification_columns()
returns trigger language plpgsql as $$
begin
  if public.is_client_role() and not public.is_admin() then
    if new.user_id is distinct from old.user_id
       or new.type is distinct from old.type
       or new.title_fr is distinct from old.title_fr
       or new.title_en is distinct from old.title_en
       or new.body_fr is distinct from old.body_fr
       or new.body_en is distinct from old.body_en
       or new.payload is distinct from old.payload then
      raise exception 'Only is_read can be updated' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_notifications_protect
  before update on public.notifications
  for each row execute procedure public.protect_notification_columns();

create or replace function public.protect_application_columns()
returns trigger language plpgsql as $$
begin
  if public.is_client_role() and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.status      := 'pending';
      new.review_note := null;
      new.reviewed_by := null;
      new.reviewed_at := null;
    elsif new.status is distinct from old.status
       or new.review_note is distinct from old.review_note
       or new.reviewed_by is distinct from old.reviewed_by
       or new.reviewed_at is distinct from old.reviewed_at
       or new.user_id is distinct from old.user_id
       or new.provider_id is distinct from old.provider_id then
      raise exception 'Protected column on provider_applications' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_applications_protect
  before insert or update on public.provider_applications
  for each row execute procedure public.protect_application_columns();

-- ─────────────────────────────────────────────────────────────
-- 3. Notes / compteurs (security definer : ils écrivent des colonnes protégées)
-- ─────────────────────────────────────────────────────────────
create or replace function public.refresh_ratings()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_service  uuid;
  v_provider uuid;
begin
  if tg_op = 'DELETE' then
    v_service := old.service_id; v_provider := old.provider_id;
  else
    v_service := new.service_id; v_provider := new.provider_id;
  end if;

  update public.services s set
    avg_rating   = coalesce((select round(avg(rating)::numeric, 2) from public.reviews r where r.service_id = v_service and r.is_published), 0),
    review_count = (select count(*) from public.reviews r where r.service_id = v_service and r.is_published)
  where s.id = v_service;

  update public.provider_profiles p set
    avg_rating   = coalesce((select round(avg(rating)::numeric, 2) from public.reviews r where r.provider_id = v_provider and r.is_published), 0),
    review_count = (select count(*) from public.reviews r where r.provider_id = v_provider and r.is_published)
  where p.id = v_provider;

  return null;
end;
$$;

drop trigger if exists trg_review_ratings on public.reviews;
create trigger trg_review_ratings
  after insert or update or delete on public.reviews
  for each row execute procedure public.refresh_ratings();

create or replace function public.bump_booking_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    update public.services set booking_count = booking_count + 1 where id = new.service_id;
  end if;
  return null;
end;
$$;

create trigger trg_booking_count
  after update of status on public.bookings
  for each row execute procedure public.bump_booking_count();

-- ─────────────────────────────────────────────────────────────
-- 4. Notifications internes (jamais exposées aux clients)
-- ─────────────────────────────────────────────────────────────
create or replace function public.notify(
  p_user uuid, p_type public.notification_type,
  p_title_fr text, p_title_en text, p_body_fr text, p_body_en text, p_payload jsonb default '{}'
) returns void language plpgsql security definer set search_path = public as $$
begin
  if p_user is null then return; end if;
  insert into public.notifications (user_id, type, title_fr, title_en, body_fr, body_en, payload)
  values (p_user, p_type, p_title_fr, p_title_en, p_body_fr, p_body_en, coalesce(p_payload, '{}'));
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- 5. Politique d'annulation
-- ─────────────────────────────────────────────────────────────
create or replace function public.refund_percent(p_policy uuid, p_starts_at timestamptz, p_at timestamptz default now())
returns integer language sql stable set search_path = public as $$
  with hrs as (select extract(epoch from (p_starts_at - p_at)) / 3600.0 as h),
       pol as (
         select rules from public.cancellation_policies
         where id = coalesce(p_policy, (select id from public.cancellation_policies where is_default limit 1))
       )
  select coalesce((
    select (r ->> 'refund_pct')::int
    from pol, hrs, jsonb_array_elements(pol.rules) r
    where hrs.h >= (r ->> 'hours_before')::numeric
    order by (r ->> 'hours_before')::numeric desc
    limit 1
  ), 0);
$$;

-- ─────────────────────────────────────────────────────────────
-- 6. RPC : create_booking (prix calculé côté serveur, anti double réservation)
-- ─────────────────────────────────────────────────────────────
create or replace function public.expire_pending_bookings()
returns integer language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  update public.bookings set status = 'expired'
  where status = 'pending' and expires_at is not null and expires_at <= now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.create_booking(
  p_service_id uuid,
  p_slot_id    uuid,
  p_guests     integer,
  p_notes      text default null,
  p_address    text default null
) returns public.bookings
language plpgsql security definer set search_path = public as $$
declare
  v_uid      uuid := auth.uid();
  v_service  public.services%rowtype;
  v_slot     public.availability_slots%rowtype;
  v_starts   timestamptz;
  v_hold     integer;
  v_total    integer;
  v_policy   uuid;
  v_booking  public.bookings;
  v_provider_user uuid;
begin
  if v_uid is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if not exists (select 1 from public.users where id = v_uid and is_active) then
    raise exception 'Account disabled' using errcode = '42501';
  end if;

  select * into v_service from public.services where id = p_service_id;
  if not found or v_service.status <> 'published' or not v_service.is_active
     or not public.provider_is_approved(v_service.provider_id) then
    raise exception 'Service not available' using errcode = 'P0002';
  end if;

  if p_guests is null or p_guests < v_service.capacity_min or p_guests > v_service.capacity_max then
    raise exception 'Guests count must be between % and %', v_service.capacity_min, v_service.capacity_max
      using errcode = '22023';
  end if;

  -- sérialise toutes les réservations d'un même prestataire (évite les chevauchements concurrents)
  perform 1 from public.provider_profiles where id = v_service.provider_id for update;

  select * into v_slot from public.availability_slots
   where id = p_slot_id and service_id = p_service_id for update;
  if not found or not v_slot.is_available then
    raise exception 'Slot not available' using errcode = 'P0002';
  end if;

  v_starts := (v_slot.date + v_slot.start_time) at time zone 'America/Guadeloupe';
  if v_starts < now() + make_interval(hours => v_service.min_notice_hours) then
    raise exception 'Slot too close to start time (minimum notice: % h)', v_service.min_notice_hours
      using errcode = '22023';
  end if;

  -- libère les réservations non payées expirées sur ce créneau
  update public.bookings set status = 'expired'
   where slot_id = p_slot_id and status = 'pending' and expires_at <= now();

  if exists (select 1 from public.bookings where slot_id = p_slot_id and status in ('pending', 'confirmed')) then
    raise exception 'Slot already booked' using errcode = '23505';
  end if;

  -- le prestataire ne peut pas être réservé deux fois sur le même horaire (tous services confondus)
  if exists (
    select 1
    from public.bookings b
    join public.services sv on sv.id = b.service_id
    join public.availability_slots s2 on s2.id = b.slot_id
    where sv.provider_id = v_service.provider_id
      and (b.status = 'confirmed' or (b.status = 'pending' and b.expires_at > now()))
      and s2.date = v_slot.date
      and s2.start_time < v_slot.end_time
      and s2.end_time > v_slot.start_time
  ) then
    raise exception 'Provider already booked at that time' using errcode = '23505';
  end if;

  v_total := case v_service.price_unit
               when 'per_person' then v_service.price_cents * p_guests
               else v_service.price_cents
             end;

  select coalesce((value #>> '{}')::int, 15) into v_hold
    from public.platform_settings where key = 'booking_hold_minutes';
  v_hold := coalesce(v_hold, 15);

  v_policy := coalesce(v_service.cancellation_policy_id,
                       (select id from public.cancellation_policies where is_default limit 1));

  insert into public.bookings (
    service_id, tourist_id, slot_id, status, guests_count, notes, total_cents,
    starts_at, expires_at, unit_price_cents, price_unit, service_address, cancellation_policy_id
  ) values (
    p_service_id, v_uid, p_slot_id, 'pending', p_guests,
    nullif(left(p_notes, 1000), ''), v_total,
    v_starts, now() + make_interval(mins => v_hold), v_service.price_cents, v_service.price_unit,
    nullif(left(p_address, 300), ''), v_policy
  ) returning * into v_booking;

  select user_id into v_provider_user from public.provider_profiles where id = v_service.provider_id;
  perform public.notify(
    v_provider_user, 'booking_new',
    'Nouvelle demande de réservation', 'New booking request',
    v_service.title_fr, coalesce(v_service.title_en, v_service.title_fr),
    jsonb_build_object('booking_id', v_booking.id, 'service_id', v_service.id)
  );

  return v_booking;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- 7. RPC : cancel_booking (touriste) / provider_set_booking_status (prestataire)
-- ─────────────────────────────────────────────────────────────
create or replace function public.cancel_booking(p_booking_id uuid, p_reason text default null)
returns public.bookings
language plpgsql security definer set search_path = public as $$
declare
  v_uid     uuid := auth.uid();
  v_booking public.bookings;
  v_provider_user uuid;
begin
  if v_uid is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select * into v_booking from public.bookings where id = p_booking_id for update;
  if not found or v_booking.tourist_id <> v_uid then
    raise exception 'Booking not found' using errcode = 'P0002';
  end if;
  if v_booking.status not in ('pending', 'confirmed') then
    raise exception 'Booking cannot be cancelled (status: %)', v_booking.status using errcode = '22023';
  end if;
  if v_booking.starts_at is not null and v_booking.starts_at <= now() then
    raise exception 'Booking already started' using errcode = '22023';
  end if;

  update public.bookings set
    status              = 'cancelled_tourist',
    cancelled_at        = now(),
    cancellation_reason = nullif(left(p_reason, 500), ''),
    refund_pct          = case when v_booking.status = 'confirmed'
                               then public.refund_percent(v_booking.cancellation_policy_id, v_booking.starts_at)
                               else 100 end   -- non confirmée (donc non capturée) : rien à retenir
  where id = p_booking_id
  returning * into v_booking;

  select pp.user_id into v_provider_user
    from public.services s join public.provider_profiles pp on pp.id = s.provider_id
   where s.id = v_booking.service_id;
  perform public.notify(v_provider_user, 'booking_cancelled',
    'Réservation annulée', 'Booking cancelled', null, null,
    jsonb_build_object('booking_id', v_booking.id));

  return v_booking;
end;
$$;

create or replace function public.provider_set_booking_status(p_booking_id uuid, p_status public.booking_status)
returns public.bookings
language plpgsql security definer set search_path = public as $$
declare
  v_uid     uuid := auth.uid();
  v_booking public.bookings;
begin
  if v_uid is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select b.* into v_booking
    from public.bookings b
    join public.services s on s.id = b.service_id
   where b.id = p_booking_id and s.provider_id = public.my_provider_id()
   for update of b;
  if not found then
    raise exception 'Booking not found' using errcode = 'P0002';
  end if;

  if p_status = 'cancelled_provider' and v_booking.status in ('pending', 'confirmed') then
    update public.bookings set
      status       = 'cancelled_provider',
      cancelled_at = now(),
      refund_pct   = 100                      -- le prestataire annule : remboursement intégral
    where id = p_booking_id returning * into v_booking;
    perform public.notify(v_booking.tourist_id, 'booking_cancelled',
      'Réservation annulée par le prestataire', 'Booking cancelled by the provider', null, null,
      jsonb_build_object('booking_id', v_booking.id));

  elsif p_status = 'completed' and v_booking.status = 'confirmed' then
    if v_booking.starts_at is null or v_booking.starts_at > now() then
      raise exception 'Booking has not taken place yet' using errcode = '22023';
    end if;
    update public.bookings set status = 'completed' where id = p_booking_id returning * into v_booking;
    perform public.notify(v_booking.tourist_id, 'booking_completed',
      'Prestation terminée — laissez un avis', 'Service completed — leave a review', null, null,
      jsonb_build_object('booking_id', v_booking.id));

  else
    -- La confirmation d'une réservation est réservée au serveur (paiement validé / acceptation : Prompt 6).
    raise exception 'Transition not allowed: % -> %', v_booking.status, p_status using errcode = '22023';
  end if;

  return v_booking;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- 8. RPC : create_review (réservation terminée du touriste, un seul avis)
-- ─────────────────────────────────────────────────────────────
create or replace function public.create_review(p_booking_id uuid, p_rating integer, p_content text default null)
returns public.reviews
language plpgsql security definer set search_path = public as $$
declare
  v_uid     uuid := auth.uid();
  v_booking public.bookings;
  v_provider uuid;
  v_review  public.reviews;
begin
  if v_uid is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if p_rating is null or p_rating not between 1 and 5 then
    raise exception 'Rating must be between 1 and 5' using errcode = '22023';
  end if;

  select * into v_booking from public.bookings where id = p_booking_id;
  if not found or v_booking.tourist_id <> v_uid then
    raise exception 'Booking not found' using errcode = 'P0002';
  end if;
  if v_booking.status <> 'completed' then
    raise exception 'Only completed bookings can be reviewed' using errcode = '22023';
  end if;
  if exists (select 1 from public.reviews where booking_id = p_booking_id) then
    raise exception 'Review already exists for this booking' using errcode = '23505';
  end if;

  select provider_id into v_provider from public.services where id = v_booking.service_id;

  insert into public.reviews (booking_id, tourist_id, provider_id, service_id, rating, content)
  values (p_booking_id, v_uid, v_provider, v_booking.service_id, p_rating, nullif(left(p_content, 2000), ''))
  returning * into v_review;

  return v_review;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- 9. RPC : coordonnées du prestataire, visibles seulement après confirmation
-- ─────────────────────────────────────────────────────────────
create or replace function public.get_provider_contact(p_booking_id uuid)
returns table (phone text, whatsapp text)
language sql stable security definer set search_path = public as $$
  select pp.phone, pp.whatsapp
    from public.bookings b
    join public.services s on s.id = b.service_id
    join public.provider_profiles pp on pp.id = s.provider_id
   where b.id = p_booking_id
     and b.tourist_id = auth.uid()
     and b.status in ('confirmed', 'completed');
$$;

-- ─────────────────────────────────────────────────────────────
-- 10. Purge des données de démonstration (avant la vraie mise en ligne)
-- ─────────────────────────────────────────────────────────────
create or replace function public.purge_demo_data()
returns void language plpgsql security definer set search_path = public as $$
begin
  -- security definer : current_user vaut ici le propriétaire, on s'appuie donc sur auth.uid().
  -- uid null = service_role / éditeur SQL (de confiance) ; sinon il faut être admin.
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Admin only' using errcode = '42501';
  end if;

  delete from public.reviews  where service_id in (select id from public.services where is_demo);
  delete from public.payments where booking_id in (
    select id from public.bookings where service_id in (select id from public.services where is_demo));
  delete from public.bookings where service_id in (select id from public.services where is_demo);
  delete from public.services where is_demo;
  delete from public.provider_profiles where is_demo and user_id is null;
  delete from auth.users where id in (select id from public.users where is_demo);
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- 11. Vues publiques (sans données sensibles)
-- ─────────────────────────────────────────────────────────────
create view public.public_provider_profiles as
  select pp.id, pp.business_name, pp.bio, pp.bio_en, pp.bio_es, pp.languages, pp.certifications,
         pp.island, pp.avg_rating, pp.review_count,
         u.full_name, u.avatar_url
  from public.provider_profiles pp
  left join public.users u on u.id = pp.user_id
  where pp.is_approved;

create view public.public_reviews as
  select r.id, r.service_id, r.provider_id, r.rating, r.content, r.created_at,
         r.provider_reply, r.provider_replied_at,
         split_part(coalesce(u.full_name, ''), ' ', 1) as author_first_name
  from public.reviews r
  join public.users u on u.id = r.tourist_id
  where r.is_published;

-- Réservations vues par le prestataire, avec le seul prénom du touriste
create view public.provider_booking_details as
  select b.id, b.service_id, b.slot_id, b.status, b.guests_count, b.notes, b.total_cents,
         b.starts_at, b.service_address, b.created_at, b.cancelled_at,
         s.title_fr, s.title_en,
         split_part(coalesce(u.full_name, ''), ' ', 1) as tourist_first_name
  from public.bookings b
  join public.services s on s.id = b.service_id
  join public.users u on u.id = b.tourist_id
  where s.provider_id = public.my_provider_id();

-- ─────────────────────────────────────────────────────────────
-- 12. Policies : services (status) + tables de 003
-- ─────────────────────────────────────────────────────────────
drop policy "services: public read" on public.services;
create policy "services: public read published"
  on public.services for select
  using (status = 'published' and is_active and public.provider_is_approved(provider_id));

create policy "cancellation_policies: public read"
  on public.cancellation_policies for select using (true);
create policy "cancellation_policies: admin all"
  on public.cancellation_policies for all
  using (public.is_admin()) with check (public.is_admin());

create policy "partner_profiles: select own"
  on public.partner_profiles for select using (user_id = auth.uid());
create policy "partner_profiles: admin all"
  on public.partner_profiles for all
  using (public.is_admin()) with check (public.is_admin());

create policy "leads: anyone can submit"
  on public.leads for insert
  to anon, authenticated
  with check (status = 'new' and consent);
create policy "leads: admin all"
  on public.leads for all
  using (public.is_admin()) with check (public.is_admin());

create policy "provider_applications: select own"
  on public.provider_applications for select using (user_id = auth.uid());
create policy "provider_applications: insert own"
  on public.provider_applications for insert with check (user_id = auth.uid());
create policy "provider_applications: update own"
  on public.provider_applications for update
  using (user_id = auth.uid() and status in ('pending', 'needs_info'))
  with check (user_id = auth.uid());
create policy "provider_applications: admin all"
  on public.provider_applications for all
  using (public.is_admin()) with check (public.is_admin());

create policy "platform_settings: admin all"
  on public.platform_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- 13. Privilèges : les RPC sensibles ne sont pas appelables par anon / public
-- ─────────────────────────────────────────────────────────────
revoke execute on function public.notify(uuid, public.notification_type, text, text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.expire_pending_bookings() from public, anon, authenticated;
revoke execute on function public.refresh_ratings() from public, anon, authenticated;
revoke execute on function public.bump_booking_count() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

revoke execute on function public.create_booking(uuid, uuid, integer, text, text) from public, anon;
revoke execute on function public.cancel_booking(uuid, text) from public, anon;
revoke execute on function public.provider_set_booking_status(uuid, public.booking_status) from public, anon;
revoke execute on function public.create_review(uuid, integer, text) from public, anon;
revoke execute on function public.get_provider_contact(uuid) from public, anon;
revoke execute on function public.purge_demo_data() from public, anon;

grant execute on function public.create_booking(uuid, uuid, integer, text, text) to authenticated;
grant execute on function public.cancel_booking(uuid, text) to authenticated;
grant execute on function public.provider_set_booking_status(uuid, public.booking_status) to authenticated;
grant execute on function public.create_review(uuid, integer, text) to authenticated;
grant execute on function public.get_provider_contact(uuid) to authenticated;
grant execute on function public.purge_demo_data() to authenticated;   -- vérifie is_admin() en interne

grant select on public.public_provider_profiles, public.public_reviews to anon, authenticated;
grant select on public.provider_booking_details to authenticated;

-- (payments / bookings / reviews / notifications : aucune policy d'écriture client => RLS refuse déjà ;
--  l'écriture passe par les RPC ci-dessus ou par service_role.)
revoke all on public.webhook_events from anon, authenticated;
revoke all on public.platform_settings from anon;
revoke all on public.admin_logs from anon;
