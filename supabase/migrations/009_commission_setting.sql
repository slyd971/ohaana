-- Ohaana — Migration 009 : taux de commission lisible côté serveur, borné, modifiable par l'admin
-- Modèle « commission incluse » : le voyageur paie le prix affiché ; Ohaana prélève ce pourcentage sur
-- la part du prestataire. La valeur vit dans platform_settings.commission_pct (créée en 003, défaut 20).

-- Lecture publique et bornée du taux (la table elle-même reste réservée à l'admin).
create or replace function public.get_commission_pct()
returns numeric language sql stable security definer set search_path = public as $$
  select least(greatest(coalesce(
    (select (value #>> '{}')::numeric from public.platform_settings where key = 'commission_pct'),
    20), 0), 50);
$$;

revoke all on function public.get_commission_pct() from public;
grant execute on function public.get_commission_pct() to anon, authenticated;

-- Garde-fou en base : un taux hors de [0, 50] est refusé, même modifié à la main.
create or replace function public.validate_platform_setting()
returns trigger language plpgsql as $$
begin
  if new.key = 'commission_pct' then
    if jsonb_typeof(new.value) <> 'number' or (new.value #>> '{}')::numeric < 0 or (new.value #>> '{}')::numeric > 50 then
      raise exception 'commission_pct must be a number between 0 and 50' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_platform_settings_validate on public.platform_settings;
create trigger trg_platform_settings_validate
  before insert or update on public.platform_settings
  for each row execute procedure public.validate_platform_setting();
