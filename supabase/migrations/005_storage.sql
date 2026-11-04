-- Ohaana — Migration 005 : buckets Supabase Storage + policies
--  * service-images : lecture publique ; écriture dans {provider_id}/... par le prestataire (ou admin)
--  * provider-docs  : privé (pièces justificatives) ; le prestataire gère son dossier, l'admin lit tout

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('service-images', 'service-images', true,  5242880,  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('provider-docs',  'provider-docs',  false, 10485760, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- service-images ---------------------------------------------------------
create policy "service-images: public read"
  on storage.objects for select
  using (bucket_id = 'service-images');

create policy "service-images: provider insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'service-images'
              and (storage.foldername(name))[1] = public.my_provider_id()::text);

create policy "service-images: provider update"
  on storage.objects for update to authenticated
  using (bucket_id = 'service-images'
         and (storage.foldername(name))[1] = public.my_provider_id()::text)
  with check (bucket_id = 'service-images'
              and (storage.foldername(name))[1] = public.my_provider_id()::text);

create policy "service-images: provider delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'service-images'
         and (storage.foldername(name))[1] = public.my_provider_id()::text);

create policy "service-images: admin all"
  on storage.objects for all to authenticated
  using (bucket_id = 'service-images' and public.is_admin())
  with check (bucket_id = 'service-images' and public.is_admin());

-- provider-docs ----------------------------------------------------------
create policy "provider-docs: provider select"
  on storage.objects for select to authenticated
  using (bucket_id = 'provider-docs'
         and (storage.foldername(name))[1] = public.my_provider_id()::text);

create policy "provider-docs: provider insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'provider-docs'
              and (storage.foldername(name))[1] = public.my_provider_id()::text);

create policy "provider-docs: provider delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'provider-docs'
         and (storage.foldername(name))[1] = public.my_provider_id()::text);

create policy "provider-docs: admin all"
  on storage.objects for all to authenticated
  using (bucket_id = 'provider-docs' and public.is_admin())
  with check (bucket_id = 'provider-docs' and public.is_admin());
