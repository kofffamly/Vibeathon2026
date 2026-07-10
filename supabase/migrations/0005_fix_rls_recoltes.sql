-- ============================================================
-- RLS pour les vraies tables : recoltes, profiles, missions_transport
-- À exécuter dans Supabase → SQL Editor
-- ============================================================

-- ── PROFILES ────────────────────────────────────────────────
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = uuid);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = uuid)
  with check (auth.uid() = uuid);

-- ── RECOLTES ────────────────────────────────────────────────
alter table public.recoltes enable row level security;

-- Lecture : tout le monde voit les annonces disponibles
drop policy if exists "recoltes_select_all" on public.recoltes;
create policy "recoltes_select_all"
  on public.recoltes for select
  to authenticated
  using (statut = 'disponible' or agriculteur_id = auth.uid());

-- Insertion : uniquement en tant que soi-même
drop policy if exists "recoltes_insert_own" on public.recoltes;
create policy "recoltes_insert_own"
  on public.recoltes for insert
  to authenticated
  with check (agriculteur_id = auth.uid());

-- Mise à jour : uniquement ses propres annonces
drop policy if exists "recoltes_update_own" on public.recoltes;
create policy "recoltes_update_own"
  on public.recoltes for update
  to authenticated
  using (agriculteur_id = auth.uid())
  with check (agriculteur_id = auth.uid());

-- Suppression : uniquement ses propres annonces
drop policy if exists "recoltes_delete_own" on public.recoltes;
create policy "recoltes_delete_own"
  on public.recoltes for delete
  to authenticated
  using (agriculteur_id = auth.uid());

-- ── MISSIONS_TRANSPORT ──────────────────────────────────────
alter table public.missions_transport enable row level security;

drop policy if exists "missions_select_own" on public.missions_transport;
create policy "missions_select_own"
  on public.missions_transport for select
  to authenticated
  using (
    acheteur_id = auth.uid()
    or transporteur_id = auth.uid()
    or recolte_id in (
      select id from public.recoltes where agriculteur_id = auth.uid()
    )
  );

drop policy if exists "missions_insert_own" on public.missions_transport;
create policy "missions_insert_own"
  on public.missions_transport for insert
  to authenticated
  with check (acheteur_id = auth.uid());

drop policy if exists "missions_update_own" on public.missions_transport;
create policy "missions_update_own"
  on public.missions_transport for update
  to authenticated
  using (
    acheteur_id = auth.uid()
    or transporteur_id = auth.uid()
  );
