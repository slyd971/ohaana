-- Ohaana — Migration 013 : emails transactionnels, rappels planifiés, double opt-in des leads, notifications temps réel
--  * bookings.reminder_sent_at / review_request_sent_at : un rappel J-1 et une demande d'avis J+1, une seule fois
--  * leads.confirm_token_hash / confirmed_at / unsubscribed_at : double opt-in (seul le HASH du jeton est stocké)
--  * confirm_lead / unsubscribe_lead : appelables sans compte, par le lien reçu par email
--  * notifications ajoutée à la publication Realtime (la RLS limite chaque utilisateur à ses lignes)

alter table public.bookings
  add column if not exists reminder_sent_at       timestamptz,
  add column if not exists review_request_sent_at timestamptz;

alter table public.leads
  add column if not exists confirm_token_hash text,
  add column if not exists confirmed_at       timestamptz,
  add column if not exists unsubscribed_at    timestamptz;

create unique index if not exists leads_confirm_token_uidx on public.leads (confirm_token_hash) where confirm_token_hash is not null;

-- Le visiteur anonyme peut déposer un lead avec le hash de son jeton, mais jamais se déclarer confirmé :
-- les colonnes d'état restent à leur valeur par défaut à l'insertion.
drop policy if exists "leads: anyone can submit" on public.leads;
create policy "leads: anyone can submit"
  on public.leads for insert
  to anon, authenticated
  with check (status = 'new' and consent and confirmed_at is null and unsubscribed_at is null);

create or replace function public.confirm_lead(p_hash text) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_n integer;
begin
  if p_hash is null or length(p_hash) <> 64 then return false; end if;
  update public.leads
     set confirmed_at = coalesce(confirmed_at, now()), unsubscribed_at = null
   where confirm_token_hash = p_hash;
  get diagnostics v_n = row_count;
  return v_n > 0;
end;
$$;

create or replace function public.unsubscribe_lead(p_hash text) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_n integer;
begin
  if p_hash is null or length(p_hash) <> 64 then return false; end if;
  update public.leads set unsubscribed_at = coalesce(unsubscribed_at, now()) where confirm_token_hash = p_hash;
  get diagnostics v_n = row_count;
  return v_n > 0;
end;
$$;

revoke execute on function public.confirm_lead(text), public.unsubscribe_lead(text) from public;
grant execute on function public.confirm_lead(text), public.unsubscribe_lead(text) to anon, authenticated, service_role;

-- Realtime : la table des notifications est diffusée, filtrée par la RLS (chacun ne reçoit que les siennes).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
     ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

-- Nouveaux types de notifications (rappel J-1, demande d'avis, dossier prestataire).
-- ADD VALUE ne peut pas être utilisé dans la même transaction : ces valeurs ne servent que plus tard, côté serveur.
alter type public.notification_type add value if not exists 'booking_reminder';
alter type public.notification_type add value if not exists 'review_request';
alter type public.notification_type add value if not exists 'provider_status';

-- La tâche planifiée (clé service_role) libère les créneaux des réservations non payées.
grant execute on function public.expire_pending_bookings() to service_role;
grant execute on function public.notify(uuid, public.notification_type, text, text, text, text, jsonb) to service_role;
