-- ============================================================
-- Fix lecture recoltes + profils
-- Supabase → SQL Editor → Run
-- ============================================================

-- 1. Supprimer les anciennes policies recoltes
drop policy if exists "recoltes_select_all"  on public.recoltes;
drop policy if exists "recoltes_insert_own"  on public.recoltes;
drop policy if exists "recoltes_update_own"  on public.recoltes;
drop policy if exists "recoltes_delete_own"  on public.recoltes;

-- 2. Nouvelle policy SELECT : tout utilisateur connecté voit TOUT
--    (pas de filtre statut ici, on filtre côté app)
create policy "recoltes_select_all"
  on public.recoltes for select
  to authenticated
  using (true);

-- 3. INSERT : agriculteur_id = utilisateur connecté
create policy "recoltes_insert_own"
  on public.recoltes for insert
  to authenticated
  with check (agriculteur_id = auth.uid());

-- 4. UPDATE : uniquement ses propres annonces
create policy "recoltes_update_own"
  on public.recoltes for update
  to authenticated
  using  (agriculteur_id = auth.uid())
  with check (agriculteur_id = auth.uid());

-- 5. DELETE : uniquement ses propres annonces
create policy "recoltes_delete_own"
  on public.recoltes for delete
  to authenticated
  using (agriculteur_id = auth.uid());

-- 6. Profiles : lecture publique même pour les non-authentifiés
--    (nécessaire pour la jointure depuis recoltes)
drop policy if exists "profiles_select_all" on public.profiles;

create policy "profiles_select_all"
  on public.profiles for select
  using (true);
