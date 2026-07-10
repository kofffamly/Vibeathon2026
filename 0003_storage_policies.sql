-- 0003_storage_policies.sql
-- Bucket "harvests" pour les photos de récoltes/animaux/résidus.
-- Convention de chemin obligatoire côté client : {auth.uid()}/{filename}
-- Cela permet de restreindre l'écriture au dossier personnel de chaque utilisateur.

insert into storage.buckets (id, name, public)
values ('harvests', 'harvests', true)
on conflict (id) do nothing;

-- Lecture publique des images (nécessaire pour affichage marketplace sans auth)
drop policy if exists "harvests_public_read" on storage.objects;
create policy "harvests_public_read"
  on storage.objects for select
  using (bucket_id = 'harvests');

-- Upload : uniquement dans son propre dossier {auth.uid()}/...
drop policy if exists "harvests_insert_own_folder" on storage.objects;
create policy "harvests_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'harvests'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Mise à jour : uniquement ses propres fichiers
drop policy if exists "harvests_update_own_folder" on storage.objects;
create policy "harvests_update_own_folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'harvests'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Suppression : uniquement ses propres fichiers
drop policy if exists "harvests_delete_own_folder" on storage.objects;
create policy "harvests_delete_own_folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'harvests'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
