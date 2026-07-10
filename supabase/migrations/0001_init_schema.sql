-- 0001_init_schema.sql
-- AGRILINK CI : schema de base (profiles + listings) avec support géographique PostGIS

create extension if not exists postgis;
create extension if not exists "pgcrypto"; -- pour gen_random_uuid()

-- ============================================================
-- TABLE: profiles
-- Un profil par utilisateur auth.users. Créé automatiquement
-- à l'inscription via un trigger (voir 0004_functions.sql).
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text unique,
  role text not null check (role in ('agriculteur','eleveur','menage','recycleur','fournisseur','acheteur')),
  activity_description text,
  location geography(Point, 4326),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Profil utilisateur, un par compte auth.users';
comment on column public.profiles.location is 'Position GPS (longitude, latitude) au format geography';

-- ============================================================
-- TABLE: listings
-- Une annonce (vente ou besoin) publiée par un profil.
-- ============================================================
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  listing_type text not null default 'vente' check (listing_type in ('vente','besoin')),
  category text not null check (category in ('recolte','animal','intrant','residu')),
  title text not null,
  description text,
  price numeric(10,2) check (price >= 0),
  quantity numeric(10,2),
  unit text,
  image_url text,
  location geography(Point, 4326) not null,
  status text not null default 'active' check (status in ('active','sold','archived')),
  ai_generated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.listings is 'Annonces de la marketplace (récoltes, animaux, intrants, résidus)';
comment on column public.listings.ai_generated is 'true si titre/catégorie/description ont été pré-remplis par Gemini Vision';

-- ============================================================
-- INDEX
-- ============================================================

-- Index spatiaux (GiST) : indispensables pour les requêtes de distance/proximité
create index if not exists idx_profiles_location on public.profiles using gist (location);
create index if not exists idx_listings_location on public.listings using gist (location);

-- Index classiques pour les filtres fréquents
create index if not exists idx_listings_category on public.listings (category);
create index if not exists idx_listings_status on public.listings (status);
create index if not exists idx_listings_owner on public.listings (owner_id);
create index if not exists idx_listings_created_at on public.listings (created_at desc);

-- ============================================================
-- TRIGGERS : mise à jour automatique de updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_listings_updated_at on public.listings;
create trigger trg_listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();
