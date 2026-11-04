-- Ohaana — Migration 010 : traitement atomique et idempotent des webhooks Stripe
-- Toutes ces fonctions sont réservées au rôle service_role (route /api/webhooks/stripe) : ni le navigateur
-- ni un utilisateur connecté ne peuvent les appeler.
--
-- Idempotence : chaque événement Stripe (stripe_event_id) n'est traité qu'une fois. Les fonctions
-- apply_* sont en plus rejouables sans effet de bord (verrou de ligne + transitions conditionnelles),
-- car Stripe peut renvoyer un événement, ou deux événements peuvent arriver en même temps.

-- 1. Prise en charge d'un événement : 'new' | 'duplicate' (déjà traité) | 'retry' (reçu mais non terminé)
create or replace function public.webhook_claim_event(p_id text, p_type text, p_payload jsonb default '{}')
returns text language plpgsql security definer set search_path = public as $$
declare v_processed timestamptz;
begin
  insert into public.webhook_events (stripe_event_id, type, payload)
  values (p_id, p_type, coalesce(p_payload, '{}'::jsonb))
  on conflict (stripe_event_id) do nothing;
  if found then return 'new'; end if;

  select processed_at into v_processed from public.webhook_events where stripe_event_id = p_id;
  return case when v_processed is not null then 'duplicate' else 'retry' end;
end;
$$;

-- 2. Fin de traitement : succès (p_error null) ou échec (l'événement restera rejouable par Stripe)
create or replace function public.webhook_finish_event(p_id text, p_error text default null)
returns void language sql security definer set search_path = public as $$
  update public.webhook_events
     set processed_at = case when p_error is null then now() else null end,
         error = left(p_error, 500)
   where stripe_event_id = p_id;
$$;

-- 3. Paiement réussi : confirme la réservation encore en attente.
--    'confirmed'     réservation confirmée, prestataire et voyageur notifiés
--    'already'       déjà traité (rejeu) : aucun effet
--    'needs_refund'  le paiement est arrivé après l'expiration / l'annulation de la réservation :
--                    le créneau n'est plus garanti, l'appelant doit rembourser
--    'unknown'       aucun paiement connu pour ce PaymentIntent
create or replace function public.apply_payment_succeeded(p_intent text, p_charge text default null)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_pay public.payments;
  v_book public.bookings;
  v_provider_user uuid;
  v_title text;
begin
  select * into v_pay from public.payments where stripe_payment_intent_id = p_intent for update;
  if not found then return 'unknown'; end if;
  select * into v_book from public.bookings where id = v_pay.booking_id for update;

  if v_pay.status = 'refunded' then return 'already'; end if;

  if v_pay.status = 'succeeded' then
    return case when v_book.status in ('confirmed', 'completed') then 'already' else 'needs_refund' end;
  end if;

  update public.payments
     set status = 'succeeded', stripe_charge_id = coalesce(p_charge, stripe_charge_id), updated_at = now()
   where id = v_pay.id;

  if v_book.status = 'pending' then
    update public.bookings set status = 'confirmed' where id = v_book.id;

    select pp.user_id, s.title_fr into v_provider_user, v_title
      from public.services s join public.provider_profiles pp on pp.id = s.provider_id
     where s.id = v_book.service_id;
    perform public.notify(v_provider_user, 'booking_new', 'Nouvelle réservation confirmée', 'New confirmed booking',
      v_title, v_title, jsonb_build_object('booking_id', v_book.id));
    perform public.notify(v_book.tourist_id, 'booking_confirmed', 'Réservation confirmée', 'Booking confirmed',
      v_title, v_title, jsonb_build_object('booking_id', v_book.id));
    return 'confirmed';
  end if;

  return case when v_book.status in ('confirmed', 'completed') then 'already' else 'needs_refund' end;
end;
$$;

-- 4. Paiement refusé : la réservation reste en attente et expirera toute seule
create or replace function public.apply_payment_failed(p_intent text)
returns text language plpgsql security definer set search_path = public as $$
begin
  update public.payments set status = 'failed', updated_at = now()
   where stripe_payment_intent_id = p_intent and status = 'pending';
  return case when found then 'failed' else 'ignored' end;
end;
$$;

-- 5. Remboursement : 'refunded' seulement si la totalité est remboursée ; un remboursement partiel
--    (politique d'annulation) laisse le paiement 'succeeded'.
create or replace function public.apply_charge_refunded(p_charge text, p_intent text, p_fully boolean)
returns text language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  select id into v_id from public.payments
   where (p_charge is not null and stripe_charge_id = p_charge)
      or (p_intent is not null and stripe_payment_intent_id = p_intent)
   limit 1;
  if v_id is null then return 'unknown'; end if;
  if not p_fully then return 'partial'; end if;

  update public.payments set status = 'refunded', updated_at = now() where id = v_id and status <> 'refunded';
  return 'refunded';
end;
$$;

-- 6. Compte Stripe Connect d'un prestataire : prêt à encaisser ou non
create or replace function public.apply_account_updated(p_account text, p_ready boolean)
returns text language plpgsql security definer set search_path = public as $$
begin
  update public.provider_profiles set stripe_onboarded = p_ready where stripe_account_id = p_account;
  return case when found then 'updated' else 'unknown' end;
end;
$$;

revoke all on function public.webhook_claim_event(text, text, jsonb) from public, anon, authenticated;
revoke all on function public.webhook_finish_event(text, text) from public, anon, authenticated;
revoke all on function public.apply_payment_succeeded(text, text) from public, anon, authenticated;
revoke all on function public.apply_payment_failed(text) from public, anon, authenticated;
revoke all on function public.apply_charge_refunded(text, text, boolean) from public, anon, authenticated;
revoke all on function public.apply_account_updated(text, boolean) from public, anon, authenticated;

grant execute on function public.webhook_claim_event(text, text, jsonb) to service_role;
grant execute on function public.webhook_finish_event(text, text) to service_role;
grant execute on function public.apply_payment_succeeded(text, text) to service_role;
grant execute on function public.apply_payment_failed(text) to service_role;
grant execute on function public.apply_charge_refunded(text, text, boolean) to service_role;
grant execute on function public.apply_account_updated(text, boolean) to service_role;
