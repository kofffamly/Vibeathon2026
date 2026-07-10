-- ============================================================
-- AGRILINK CI — Script de synchronisation complet
-- Colle ce script dans Supabase → SQL Editor → Run
-- Adapté exactement aux tables : profiles, recoltes, missions_transport
-- ============================================================


-- ============================================================
-- 1. TRIGGER : création automatique du profil à l'inscription
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (uuid, nom_complet, telephone, role, zone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nom_complet', 'Utilisateur'),
    new.raw_user_meta_data->>'telephone',
    coalesce(new.raw_user_meta_data->>'role', 'acheteur'),
    new.raw_user_meta_data->>'zone'
  )
  on conflict (uuid) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- 2. RLS — TABLE profiles
-- ============================================================
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all"   on public.profiles;
drop policy if exists "profiles_insert_own"   on public.profiles;
drop policy if exists "profiles_update_own"   on public.profiles;

create policy "profiles_select_all"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = uuid);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using  (auth.uid() = uuid)
  with check (auth.uid() = uuid);


-- ============================================================
-- 3. RLS — TABLE recoltes
-- ============================================================
alter table public.recoltes enable row level security;

drop policy if exists "recoltes_select_all"   on public.recoltes;
drop policy if exists "recoltes_insert_own"   on public.recoltes;
drop policy if exists "recoltes_update_own"   on public.recoltes;
drop policy if exists "recoltes_delete_own"   on public.recoltes;

-- Tout utilisateur connecté voit les annonces disponibles
-- + l'agriculteur voit aussi ses propres annonces archivées/vendues
create policy "recoltes_select_all"
  on public.recoltes for select
  to authenticated
  using (statut = 'disponible' or agriculteur_id = auth.uid());

-- Insertion : l'agriculteur_id doit être l'utilisateur connecté
create policy "recoltes_insert_own"
  on public.recoltes for insert
  to authenticated
  with check (agriculteur_id = auth.uid());

-- Mise à jour : uniquement ses propres annonces
create policy "recoltes_update_own"
  on public.recoltes for update
  to authenticated
  using  (agriculteur_id = auth.uid())
  with check (agriculteur_id = auth.uid());

-- Suppression : uniquement ses propres annonces
create policy "recoltes_delete_own"
  on public.recoltes for delete
  to authenticated
  using (agriculteur_id = auth.uid());


-- ============================================================
-- 4. RLS — TABLE missions_transport
-- ============================================================
alter table public.missions_transport enable row level security;

drop policy if exists "missions_select_own"   on public.missions_transport;
drop policy if exists "missions_insert_own"   on public.missions_transport;
drop policy if exists "missions_update_own"   on public.missions_transport;

-- Visible par : l'acheteur, le transporteur, ou l'agriculteur de la récolte
create policy "missions_select_own"
  on public.missions_transport for select
  to authenticated
  using (
    acheteur_id     = auth.uid()
    or transporteur_id = auth.uid()
    or recolte_id in (
      select id from public.recoltes where agriculteur_id = auth.uid()
    )
  );

-- Seul l'acheteur crée une mission
create policy "missions_insert_own"
  on public.missions_transport for insert
  to authenticated
  with check (acheteur_id = auth.uid());

-- L'acheteur ou le transporteur peut mettre à jour
create policy "missions_update_own"
  on public.missions_transport for update
  to authenticated
  using (acheteur_id = auth.uid() or transporteur_id = auth.uid());


-- ============================================================
-- 5. STORAGE — Bucket "harvests" pour les photos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('harvests', 'harvests', true)
on conflict (id) do nothing;

drop policy if exists "harvests_public_read"        on storage.objects;
drop policy if exists "harvests_insert_own_folder"  on storage.objects;
drop policy if exists "harvests_delete_own_folder"  on storage.objects;

-- Lecture publique (affichage marketplace sans auth)
create policy "harvests_public_read"
  on storage.objects for select
  using (bucket_id = 'harvests');

-- Upload uniquement dans son propre dossier {uid}/...
create policy "harvests_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'harvests'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Suppression uniquement de ses propres fichiers
create policy "harvests_delete_own_folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'harvests'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ============================================================
-- 6. INDEX pour les performances
-- ============================================================
create index if not exists idx_recoltes_agriculteur  on public.recoltes (agriculteur_id);
create index if not exists idx_recoltes_statut        on public.recoltes (statut);
create index if not exists idx_recoltes_type_produit  on public.recoltes (type_produit);
create index if not exists idx_recoltes_created_at    on public.recoltes (created_at desc);
create index if not exists idx_missions_acheteur      on public.missions_transport (acheteur_id);
create index if not exists idx_missions_transporteur  on public.missions_transport (transporteur_id);
create index if not exists idx_missions_recolte       on public.missions_transport (recolte_id);
