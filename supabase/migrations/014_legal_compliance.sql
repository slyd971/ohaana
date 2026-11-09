-- Ohaana — Migration 014 : conformité (RGPD et statut des prestataires)
--  * consents : acceptation VERSIONNÉE des CGU / CGU prestataire / politique de confidentialité (preuve datée)
--  * accept_legal() : enregistre une acceptation pour l'utilisateur connecté
--  * handle_new_user() : reprend les versions acceptées à l'inscription (cases cochées dans le formulaire)
--  * export_my_data() : export JSON de toutes les données de l'utilisateur connecté (droit d'accès / portabilité)
--  * prepare_account_removal() : suppression du compte — effacement complet s'il n'y a aucune trace comptable,
--    sinon anonymisation (les réservations et paiements doivent être conservés pour la comptabilité)
--  * provider_profiles : statut professionnel déclaré (+ vérification par l'équipe, colonnes protégées)

-- ─── Consentements ───────────────────────────────────────────────────────────
create table if not exists public.consents (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  document    text not null check (document in ('terms', 'provider_terms', 'privacy')),
  version     text not null check (version ~ '^\d{4}-\d{2}-\d{2}$'),
  source      text not null default 'settings' check (source in ('signup', 'settings', 'provider_onboarding')),
  accepted_at timestamptz not null default now(),
  unique (user_id, document, version)
);
create index if not exists consents_user_idx on public.consents (user_id, accepted_at desc);

alter table public.consents enable row level security;
drop policy if exists "consents: select own" on public.consents;
create policy "consents: select own" on public.consents for select using (user_id = auth.uid());
drop policy if exists "consents: admin select" on public.consents;
create policy "consents: admin select" on public.consents for select using (public.is_admin());
revoke insert, update, delete on public.consents from anon, authenticated;

create or replace function public.accept_legal(p_document text, p_version text, p_source text default 'settings')
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if p_document not in ('terms', 'provider_terms', 'privacy') or p_version !~ '^\d{4}-\d{2}-\d{2}$'
     or p_source not in ('signup', 'settings', 'provider_onboarding') then
    raise exception 'Invalid consent' using errcode = '22023';
  end if;
  insert into public.consents (user_id, document, version, source)
  values (v_uid, p_document, p_version, p_source)
  on conflict (user_id, document, version) do nothing;
end;
$$;
revoke execute on function public.accept_legal(text, text, text) from public, anon;
grant execute on function public.accept_legal(text, text, text) to authenticated;

-- À l'inscription, les versions cochées dans le formulaire (métadonnées) sont enregistrées avec l'horodatage serveur.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role public.user_role;
  v_name text := nullif(trim(new.raw_user_meta_data ->> 'full_name'), '');
  v_terms text := new.raw_user_meta_data ->> 'terms_version';
  v_privacy text := new.raw_user_meta_data ->> 'privacy_version';
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

  if v_terms ~ '^\d{4}-\d{2}-\d{2}$' then
    insert into public.consents (user_id, document, version, source) values (new.id, 'terms', v_terms, 'signup')
    on conflict do nothing;
  end if;
  if v_privacy ~ '^\d{4}-\d{2}-\d{2}$' then
    insert into public.consents (user_id, document, version, source) values (new.id, 'privacy', v_privacy, 'signup')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

-- ─── Statut professionnel des prestataires ───────────────────────────────────
alter table public.provider_profiles
  add column if not exists legal_status           text check (legal_status is null or legal_status in ('particulier', 'micro_entrepreneur', 'entreprise', 'association')),
  add column if not exists siret                  text check (siret is null or siret ~ '^\d{14}$'),
  add column if not exists vat_number             text check (vat_number is null or length(vat_number) <= 20),
  add column if not exists insurance_confirmed    boolean not null default false,
  add column if not exists insurance_expires_on   date,
  add column if not exists compliance_verified_at timestamptz,
  add column if not exists compliance_verified_by uuid references public.users(id) on delete set null,
  add column if not exists compliance_note        text check (compliance_note is null or length(compliance_note) <= 1000);

-- Le prestataire DÉCLARE son statut ; seule l'équipe VÉRIFIE (colonnes compliance_* protégées).
create or replace function public.protect_provider_compliance()
returns trigger language plpgsql as $$
begin
  if public.is_client_role() and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.compliance_verified_at := null;
      new.compliance_verified_by := null;
      new.compliance_note        := null;
    elsif new.compliance_verified_at is distinct from old.compliance_verified_at
       or new.compliance_verified_by is distinct from old.compliance_verified_by
       or new.compliance_note is distinct from old.compliance_note then
      raise exception 'Protected column on provider_profiles' using errcode = '42501';
    else
      -- Modifier une déclaration retire la vérification : l'équipe doit la refaire sur les nouvelles données.
      if new.legal_status is distinct from old.legal_status
         or new.siret is distinct from old.siret
         or new.vat_number is distinct from old.vat_number
         or new.insurance_confirmed is distinct from old.insurance_confirmed
         or new.insurance_expires_on is distinct from old.insurance_expires_on then
        new.compliance_verified_at := null;
        new.compliance_verified_by := null;
      end if;
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists trg_provider_compliance_protect on public.provider_profiles;
create trigger trg_provider_compliance_protect
  before insert or update on public.provider_profiles
  for each row execute procedure public.protect_provider_compliance();

-- ─── Export des données (droit d'accès et de portabilité) ────────────────────
create or replace function public.export_my_data()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_uid   uuid := auth.uid();
  v_email text;
  v_prov  uuid;
begin
  if v_uid is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  select email into v_email from public.users where id = v_uid;
  select id into v_prov from public.provider_profiles where user_id = v_uid;

  return jsonb_build_object(
    'exported_at', now(),
    'account', (select to_jsonb(u) - 'is_demo' from public.users u where u.id = v_uid),
    'traveller_profile', (select to_jsonb(t) from public.tourist_profiles t where t.user_id = v_uid),
    'bookings', coalesce((select jsonb_agg(to_jsonb(b) order by b.created_at) from public.bookings b where b.tourist_id = v_uid), '[]'),
    'payments', coalesce((
      select jsonb_agg(jsonb_build_object('booking_id', p.booking_id, 'status', p.status, 'total_cents', p.total_cents,
                                          'refunded_cents', p.refunded_cents, 'currency', p.currency, 'created_at', p.created_at)
                       order by p.created_at)
        from public.payments p join public.bookings b on b.id = p.booking_id where b.tourist_id = v_uid), '[]'),
    'reviews', coalesce((select jsonb_agg(to_jsonb(r) order by r.created_at) from public.reviews r where r.tourist_id = v_uid), '[]'),
    'favorites', coalesce((select jsonb_agg(to_jsonb(f)) from public.favorites f where f.user_id = v_uid), '[]'),
    'notifications', coalesce((select jsonb_agg(to_jsonb(n) order by n.created_at) from public.notifications n where n.user_id = v_uid), '[]'),
    'consents', coalesce((select jsonb_agg(to_jsonb(c) order by c.accepted_at) from public.consents c where c.user_id = v_uid), '[]'),
    'concierge_requests', coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at) from public.concierge_requests q where q.user_id = v_uid), '[]'),
    'newsletter', coalesce((select jsonb_agg(jsonb_build_object('email', l.email, 'destination', l.destination, 'locale', l.locale,
                                                               'confirmed_at', l.confirmed_at, 'unsubscribed_at', l.unsubscribed_at, 'created_at', l.created_at))
                              from public.leads l where lower(l.email) = lower(v_email)), '[]'),
    'provider', case when v_prov is null then null else jsonb_build_object(
      'profile', (select to_jsonb(pp) - 'claim_token_hash' - 'is_demo' from public.provider_profiles pp where pp.id = v_prov),
      'services', coalesce((select jsonb_agg(to_jsonb(s) order by s.created_at) from public.services s where s.provider_id = v_prov), '[]'),
      'bookings_received', coalesce((select jsonb_agg(jsonb_build_object('id', b.id, 'status', b.status, 'guests_count', b.guests_count,
                                                                         'total_cents', b.total_cents, 'starts_at', b.starts_at))
                                       from public.bookings b join public.services s on s.id = b.service_id where s.provider_id = v_prov), '[]')
    ) end
  );
end;
$$;
revoke execute on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;

-- ─── Suppression du compte ───────────────────────────────────────────────────
-- Résultat : 'blocked_upcoming' (réservations à venir à honorer ou annuler), 'blocked_role' (compte d'équipe),
-- 'deletable' (aucune trace comptable : le serveur supprime l'utilisateur d'authentification, tout est effacé en cascade)
-- ou 'anonymised' (réservations/paiements conservés pour la comptabilité, données personnelles effacées).
create or replace function public.prepare_account_removal(p_user uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_user  public.users%rowtype;
  v_prov  uuid;
  v_email text;
begin
  select * into v_user from public.users where id = p_user for update;
  if not found then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  if v_user.role not in ('tourist', 'provider') then
    return 'blocked_role';
  end if;
  v_email := v_user.email;
  select id into v_prov from public.provider_profiles where user_id = p_user;

  -- Les réservations non payées expirent d'elles-mêmes.
  update public.bookings set status = 'expired'
   where status = 'pending'
     and (tourist_id = p_user or service_id in (select id from public.services where provider_id = v_prov));

  if exists (
    select 1 from public.bookings b
     where b.status = 'confirmed' and (b.starts_at is null or b.starts_at > now())
       and (b.tourist_id = p_user or b.service_id in (select id from public.services where provider_id = v_prov))
  ) then
    return 'blocked_upcoming';
  end if;

  if not exists (
    select 1 from public.bookings b
     where b.tourist_id = p_user or b.service_id in (select id from public.services where provider_id = v_prov)
  ) then
    return 'deletable';
  end if;

  -- Anonymisation : on garde la ligne users (clé étrangère des réservations) vidée de toute donnée personnelle.
  delete from public.notifications where user_id = p_user;
  delete from public.favorites where user_id = p_user;
  delete from public.tourist_profiles where user_id = p_user;
  delete from public.concierge_requests where user_id = p_user;
  delete from public.leads where lower(email) = lower(v_email);
  if v_prov is not null then
    update public.services set status = 'archived', is_active = false where provider_id = v_prov;
    update public.provider_profiles
       set business_name = 'Prestataire supprimé', bio = null, bio_en = null, phone = null, whatsapp = null,
           is_approved = false, siret = null, vat_number = null, legal_status = null,
           insurance_confirmed = false, insurance_expires_on = null, compliance_note = null
     where id = v_prov;
  end if;
  update public.users
     set email = 'deleted+' || p_user::text || '@deleted.invalid', full_name = null, avatar_url = null, is_active = false
   where id = p_user;
  return 'anonymised';
end;
$$;
revoke execute on function public.prepare_account_removal(uuid) from public, anon, authenticated;
grant execute on function public.prepare_account_removal(uuid) to service_role;
