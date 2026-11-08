-- Ohaana — Migration 012 : demandes envoyées depuis la page Concierge
-- Un visiteur (connecté ou non) dépose une demande ; seule l'équipe (admin) peut la lire et la traiter.
-- Même schéma de protection que `leads` : insertion ouverte mais bornée, lecture réservée à l'admin.

create table if not exists public.concierge_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete set null,
  message     text not null check (length(btrim(message)) between 1 and 1000),
  stay_dates  text check (stay_dates is null or length(stay_dates) <= 100),
  location    text check (location is null or length(location) <= 150),
  contact     text not null check (length(btrim(contact)) between 3 and 254),  -- email ou WhatsApp pour répondre
  locale      text not null default 'fr' check (locale in ('fr', 'en', 'es')),
  status      public.lead_status not null default 'new',
  created_at  timestamptz not null default now()
);

create index if not exists concierge_requests_status_idx
  on public.concierge_requests (status, created_at desc);

alter table public.concierge_requests enable row level security;

drop policy if exists "concierge_requests: anyone can submit" on public.concierge_requests;
create policy "concierge_requests: anyone can submit"
  on public.concierge_requests for insert
  to anon, authenticated
  with check (status = 'new' and (user_id is null or user_id = auth.uid()));

drop policy if exists "concierge_requests: admin all" on public.concierge_requests;
create policy "concierge_requests: admin all"
  on public.concierge_requests for all
  using (public.is_admin()) with check (public.is_admin());
