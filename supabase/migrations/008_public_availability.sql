-- Ohaana — Migration 008 : disponibilités publiques
-- `bookings` n'est lisible que par ses parties (RLS) : le site public ne peut donc pas savoir
-- quels créneaux sont déjà pris. Cette vue expose UNIQUEMENT les créneaux réellement libres,
-- sans aucune donnée de réservation.
--
-- Un créneau est libre si : le service est publié et le prestataire approuvé, le délai minimum
-- de prévenance est respecté, et aucune réservation confirmée (ou en attente non expirée) du
-- même prestataire ne chevauche l'horaire — tous services confondus (comme create_booking).

create view public.public_slot_availability as
select s.id, s.service_id, s.date, s.start_time, s.end_time
from public.availability_slots s
join public.services sv on sv.id = s.service_id
where s.is_available
  and sv.status = 'published'
  and sv.is_active
  and public.provider_is_approved(sv.provider_id)
  and ((s.date + s.start_time) at time zone 'America/Guadeloupe') >= now() + make_interval(hours => sv.min_notice_hours)
  and not exists (
    select 1
    from public.bookings b
    join public.services sv2 on sv2.id = b.service_id
    join public.availability_slots s2 on s2.id = b.slot_id
    where sv2.provider_id = sv.provider_id
      and (b.status = 'confirmed' or (b.status = 'pending' and b.expires_at > now()))
      and s2.date = s.date
      and s2.start_time < s.end_time
      and s2.end_time > s.start_time
  );

grant select on public.public_slot_availability to anon, authenticated;
