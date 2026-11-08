-- Ohaana — Migration 011 : suivi des remboursements d'annulation
--  * payments.refunded_cents : montant déjà remboursé (mis à jour par le serveur et par le webhook charge.refunded)
--  * apply_charge_refunded reçoit le montant remboursé, y compris pour un remboursement partiel
--  * admin_pending_refunds() : annulations dont le remboursement dû n'est pas (entièrement) parti

alter table public.payments
  add column if not exists refunded_cents integer not null default 0 check (refunded_cents >= 0);

-- La signature change (4e argument) : on retire l'ancienne pour éviter toute ambiguïté d'appel.
drop function if exists public.apply_charge_refunded(text, text, boolean);

create or replace function public.apply_charge_refunded(
  p_charge text, p_intent text, p_fully boolean, p_refunded_cents integer default null
) returns text language plpgsql security definer set search_path = public as $$
declare v_pay public.payments;
begin
  select * into v_pay from public.payments
   where (p_charge is not null and stripe_charge_id = p_charge)
      or (p_intent is not null and stripe_payment_intent_id = p_intent)
   limit 1
   for update;
  if not found then return 'unknown'; end if;

  -- Le cumul ne baisse jamais (un événement rejoué ou en retard ne peut pas faire reculer le compteur).
  update public.payments
     set refunded_cents = least(total_cents, greatest(refunded_cents, coalesce(p_refunded_cents, case when p_fully then total_cents else 0 end))),
         status = case when p_fully then 'refunded' else status end,
         updated_at = now()
   where id = v_pay.id;

  return case when p_fully then 'refunded' else 'partial' end;
end;
$$;

revoke all on function public.apply_charge_refunded(text, text, boolean, integer) from public, anon, authenticated;
grant execute on function public.apply_charge_refunded(text, text, boolean, integer) to service_role;

-- Annulations avec un remboursement encore dû. « Dû » = total payé × refund_pct de la réservation (fixé au moment
-- de l'annulation d'après la politique du service) moins ce qui est déjà parti.
create or replace function public.admin_pending_refunds()
returns table (
  booking_id uuid, service_title text, status public.booking_status, cancelled_at timestamptz,
  total_cents integer, expected_cents integer, refunded_cents integer
) language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Admin only' using errcode = '42501';
  end if;
  return query
    select b.id, s.title_fr, b.status, b.cancelled_at,
           p.total_cents,
           round(p.total_cents * coalesce(b.refund_pct, 0) / 100.0)::integer,
           p.refunded_cents
      from public.bookings b
      join public.payments p on p.booking_id = b.id
      join public.services s on s.id = b.service_id
     where b.status in ('cancelled_tourist', 'cancelled_provider')
       and p.status = 'succeeded'
       and round(p.total_cents * coalesce(b.refund_pct, 0) / 100.0) > p.refunded_cents
     order by b.cancelled_at nulls last;
end;
$$;

revoke all on function public.admin_pending_refunds() from public, anon;
grant execute on function public.admin_pending_refunds() to authenticated;
