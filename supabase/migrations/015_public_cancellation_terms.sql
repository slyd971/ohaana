-- Ohaana — Migration 015 : conditions d'annulation affichables publiquement
-- free_hours = délai (en heures avant la prestation) jusqu'auquel l'annulation est remboursée à 100 %, d'après la politique
-- du service (ou la politique par défaut). Évite d'afficher une promesse d'annulation fixe qui ne correspondrait pas au service.

create or replace view public.public_service_cancellation as
select s.id as service_id,
       (
         select max((r ->> 'hours_before')::int)
           from public.cancellation_policies p, jsonb_array_elements(p.rules) r
          where p.id = coalesce(s.cancellation_policy_id, (select id from public.cancellation_policies where is_default limit 1))
            and (r ->> 'refund_pct')::int = 100
       ) as free_hours
  from public.services s
 where s.status = 'published' and s.is_active;

grant select on public.public_service_cancellation to anon, authenticated;
