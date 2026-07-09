-- 0004_functions.sql
-- 1) Création automatique du profil à l'inscription (auth.users -> public.profiles)
-- 2) Fonction RPC de tri par proximité géographique (remplace un calcul Haversine manuel)

-- ============================================================
-- 1) TRIGGER : auto-création du profil à l'inscription
-- Les infos (nom, tel, role, location) sont passées dans les
-- "options.data" de supabase.auth.signUp() côté client, elles
-- arrivent ici dans raw_user_meta_data.
-- SECURITY DEFINER : nécessaire pour écrire dans public.profiles
-- au moment où l'utilisateur vient d'être créé (pas encore de session).
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role, activity_description, location)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Utilisateur'),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'acheteur'),
    new.raw_user_meta_data->>'activity_description',
    case
      when new.raw_user_meta_data->>'lat' is not null and new.raw_user_meta_data->>'lng' is not null
      then ST_SetSRID(
             ST_MakePoint(
               (new.raw_user_meta_data->>'lng')::double precision,
               (new.raw_user_meta_data->>'lat')::double precision
             ), 4326
           )::geography
      else null
    end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2) FONCTION RPC : nearby_listings
-- Tri des annonces par distance réelle (mètres/km) depuis la
-- position de l'utilisateur, avec filtre optionnel par catégorie
-- et rayon de recherche. SECURITY INVOKER (par défaut) : la
-- fonction respecte les policies RLS de l'appelant, donc un
-- utilisateur ne verra jamais plus que ce que ses policies autorisent.
-- ============================================================
create or replace function public.nearby_listings(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision default 50,
  filter_category text default null
)
returns table (
  id uuid,
  owner_id uuid,
  listing_type text,
  category text,
  title text,
  description text,
  price numeric,
  quantity numeric,
  unit text,
  image_url text,
  status text,
  created_at timestamptz,
  seller_name text,
  seller_phone text,
  distance_km double precision
)
language sql
stable
as $$
  select
    l.id, l.owner_id, l.listing_type, l.category, l.title, l.description,
    l.price, l.quantity, l.unit, l.image_url, l.status, l.created_at,
    p.full_name as seller_name,
    p.phone as seller_phone,
    ST_Distance(
      l.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) / 1000.0 as distance_km
  from public.listings l
  join public.profiles p on p.id = l.owner_id
  where l.status = 'active'
    and (filter_category is null or l.category = filter_category)
    and ST_DWithin(
      l.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_km * 1000
    )
  order by distance_km asc;
$$;

grant execute on function public.nearby_listings(double precision, double precision, double precision, text) to authenticated;
