-- ============================================================
-- AGRILINK CI — Fix FK + Trigger robuste
-- Colle dans Supabase → SQL Editor → Run
-- ============================================================

-- 1. Supprimer la contrainte FK problématique sur recoltes.agriculteur_id
--    Elle pointe vers profiles.uuid mais le profil peut ne pas exister encore
alter table public.recoltes
  drop constraint if exists recoltes_agriculteur_id_fkey;

alter table public.recoltes
  drop constraint if exists recoltes_agriculteur_id_key;

-- 2. Recréer la FK vers auth.users directement (toujours existant)
alter table public.recoltes
  add constraint recoltes_agriculteur_id_fkey
  foreign key (agriculteur_id)
  references auth.users(id)
  on delete cascade;

-- 3. Même chose pour missions_transport
alter table public.missions_transport
  drop constraint if exists missions_transport_acheteur_id_fkey;

alter table public.missions_transport
  drop constraint if exists missions_transport_transporteur_id_fkey;

alter table public.missions_transport
  add constraint missions_transport_acheteur_id_fkey
  foreign key (acheteur_id)
  references auth.users(id)
  on delete set null;

alter table public.missions_transport
  add constraint missions_transport_transporteur_id_fkey
  foreign key (transporteur_id)
  references auth.users(id)
  on delete set null;

-- 4. Trigger robuste : crée le profil à l'inscription
--    Utilise ON CONFLICT pour éviter les doublons
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
    coalesce(new.raw_user_meta_data->>'nom_complet', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'telephone',
    coalesce(new.raw_user_meta_data->>'role', 'acheteur'),
    new.raw_user_meta_data->>'zone'
  )
  on conflict (uuid) do update set
    nom_complet = coalesce(excluded.nom_complet, public.profiles.nom_complet),
    telephone   = coalesce(excluded.telephone,   public.profiles.telephone),
    role        = coalesce(excluded.role,         public.profiles.role),
    zone        = coalesce(excluded.zone,         public.profiles.zone);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Créer les profils manquants pour les users déjà inscrits
insert into public.profiles (uuid, nom_complet, role)
select
  id,
  coalesce(raw_user_meta_data->>'nom_complet', split_part(email, '@', 1)),
  coalesce(raw_user_meta_data->>'role', 'acheteur')
from auth.users
on conflict (uuid) do nothing;

-- 6. latitude/longitude nullable
alter table public.recoltes alter column latitude  drop not null;
alter table public.recoltes alter column longitude drop not null;
