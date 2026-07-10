-- ============================================================
-- À exécuter dans Supabase → SQL Editor
-- Corrige le trigger de création de profil pour la vraie table
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
