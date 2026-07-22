-- Upload d'images : bucket public `shop-media`.
--
-- Arborescence imposée : {shop_id}/{domaine}/{uuid}.{ext}
-- (ex. 44aa.../products/9f2c....webp). Le premier segment fait office de
-- frontière multi-tenant : les policies n'autorisent l'écriture que dans le
-- dossier de SON magasin, via get_user_shop_id() (SECURITY DEFINER existant).
--
-- Garde-fous côté serveur (pas seulement UI) : taille max 5 Mo et types MIME
-- image imposés AU NIVEAU DU BUCKET — un client contourné reste bloqué.
-- Lecture publique : les images sont affichées sur les vitrines publiques.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'shop-media',
  'shop-media',
  true,
  5242880, -- 5 Mo
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

create policy "Public can read shop media"
  on storage.objects for select
  using (bucket_id = 'shop-media');

create policy "Shop members upload into their shop folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'shop-media'
    and (storage.foldername(name))[1] = get_user_shop_id()::text
  );

create policy "Shop members update their shop folder"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'shop-media'
    and (storage.foldername(name))[1] = get_user_shop_id()::text
  )
  with check (
    bucket_id = 'shop-media'
    and (storage.foldername(name))[1] = get_user_shop_id()::text
  );

create policy "Shop members delete from their shop folder"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'shop-media'
    and (storage.foldername(name))[1] = get_user_shop_id()::text
  );
