-- 0011_reviews.sql
-- Table : reviews (avis et notes des acheteurs sur les vendeurs)

-- ============================================================
-- TABLE: reviews
-- ============================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id    uuid not null references public.profiles(id) on delete cascade,
  listing_id   uuid references public.listings(id) on delete set null,
  order_id     uuid references public.orders(id) on delete set null,
  rating       smallint not null check (rating between 1 and 5),
  comment      text,
  created_at   timestamptz not null default now(),
  -- Un acheteur ne peut laisser qu'un seul avis par commande
  unique (reviewer_id, order_id)
);

comment on table public.reviews is 'Avis et notations des acheteurs sur les vendeurs';

-- Index
create index if not exists idx_reviews_seller     on public.reviews (seller_id);
create index if not exists idx_reviews_reviewer   on public.reviews (reviewer_id);
create index if not exists idx_reviews_listing    on public.reviews (listing_id);

-- RLS
alter table public.reviews enable row level security;

drop policy if exists "reviews_select" on public.reviews;
create policy "reviews_select" on public.reviews for select
  using (true); -- Lecture publique

drop policy if exists "reviews_insert" on public.reviews;
create policy "reviews_insert" on public.reviews for insert to authenticated
  with check (reviewer_id = auth.uid());

drop policy if exists "reviews_delete" on public.reviews;
create policy "reviews_delete" on public.reviews for delete to authenticated
  using (reviewer_id = auth.uid());

-- Vue : note moyenne par vendeur
create or replace view public.seller_ratings as
select
  seller_id,
  count(*)::int                         as review_count,
  round(avg(rating)::numeric, 2)        as avg_rating,
  count(*) filter (where rating = 5)    as five_stars,
  count(*) filter (where rating = 4)    as four_stars,
  count(*) filter (where rating = 3)    as three_stars,
  count(*) filter (where rating <= 2)   as low_stars
from public.reviews
group by seller_id;

comment on view public.seller_ratings is 'Note moyenne agrégée par vendeur';
