-- 0002_rls_policies.sql
-- Row Level Security : chaque utilisateur ne peut agir que sur SES propres données.
-- La lecture publique de la marketplace reste ouverte (nécessaire pour l'UX),
-- mais toute écriture est strictement limitée au propriétaire de la ligne.

alter table public.profiles enable row level security;
alter table public.listings enable row level security;

-- ============================================================
-- PROFILES
-- ============================================================

-- Lecture : tout utilisateur authentifié peut voir les profils publics
-- (nécessaire pour afficher "vendu par X" sur une annonce)
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select
  to authenticated
  using (true);

-- Insertion : uniquement son propre profil (id doit correspondre à auth.uid())
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Mise à jour : uniquement son propre profil
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Pas de policy delete : on ne permet pas la suppression de profil depuis le client
-- (à faire via une fonction serveur dédiée si besoin, avec service_role)

-- ============================================================
-- LISTINGS
-- ============================================================

-- Lecture : tout le monde authentifié voit les annonces actives.
-- Un propriétaire voit aussi ses propres annonces même archivées/vendues.
drop policy if exists "listings_select_active_or_own" on public.listings;
create policy "listings_select_active_or_own"
  on public.listings for select
  to authenticated
  using (status = 'active' or owner_id = auth.uid());

-- Insertion : uniquement en tant que soi-même
drop policy if exists "listings_insert_own" on public.listings;
create policy "listings_insert_own"
  on public.listings for insert
  to authenticated
  with check (owner_id = auth.uid());

-- Mise à jour : uniquement ses propres annonces
drop policy if exists "listings_update_own" on public.listings;
create policy "listings_update_own"
  on public.listings for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Suppression : uniquement ses propres annonces
drop policy if exists "listings_delete_own" on public.listings;
create policy "listings_delete_own"
  on public.listings for delete
  to authenticated
  using (owner_id = auth.uid());
