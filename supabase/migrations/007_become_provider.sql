-- Ohaana — Migration 007 : inscription prestataire via un fournisseur OAuth (Google)
--
-- Avec email + mot de passe, le rôle voulu voyage dans raw_user_meta_data (handle_new_user).
-- Avec OAuth, on ne peut pas injecter de métadonnées : l'utilisateur est créé touriste, puis le
-- callback appelle cette RPC s'il a explicitement choisi "Prestataire" à l'inscription.
-- Seul le passage tourist -> provider est possible (jamais admin / concierge / partner).

create or replace function public.become_provider(p_business_name text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid  uuid := auth.uid();
  v_user public.users%rowtype;
begin
  if v_uid is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select * into v_user from public.users where id = v_uid and is_active for update;
  if not found then
    raise exception 'User not found' using errcode = 'P0002';
  end if;

  if v_user.role = 'provider' then
    return;                                   -- déjà prestataire : idempotent
  end if;
  if v_user.role <> 'tourist' then
    raise exception 'Role % cannot become provider', v_user.role using errcode = '42501';
  end if;

  update public.users set role = 'provider' where id = v_uid;

  insert into public.provider_profiles (user_id, business_name)
  values (v_uid, coalesce(nullif(trim(p_business_name), ''), v_user.full_name, split_part(v_user.email, '@', 1)))
  on conflict (user_id) do nothing;
end;
$$;

revoke execute on function public.become_provider(text) from public, anon;
grant execute on function public.become_provider(text) to authenticated;
