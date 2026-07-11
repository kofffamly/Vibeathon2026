-- 0013_seller_stats.sql
-- Vue matérialisée & fonctions de statistiques vendeur

-- ============================================================
-- VUE MATERIALISEE : stats par vendeur (Dashboard Jour 3)
-- ============================================================
create materialized view if not exists public.seller_stats as
select
  p.id                                                    as seller_id,
  p.full_name,
  p.role,
  count(distinct l.id)                                    as total_listings,
  count(distinct l.id) filter (where l.status = 'active') as active_listings,
  count(distinct oi.order_id)                             as total_orders,
  coalesce(sum(oi.unit_price * oi.quantity), 0)           as total_revenue,
  coalesce(round(avg(r.rating)::numeric, 2), 0)          as avg_rating,
  count(distinct r.id)                                    as review_count
from public.profiles p
left join public.listings     l  on l.owner_id  = p.id
left join public.order_items  oi on oi.seller_id = p.id
left join public.reviews      r  on r.seller_id  = p.id
group by p.id, p.full_name, p.role;

comment on materialized view public.seller_stats is
  'Statistiques agrégées par vendeur (actualisées périodiquement)';

create unique index if not exists idx_seller_stats_pk on public.seller_stats (seller_id);

-- Fonction pour rafraîchir les stats (à appeler via cron ou après chaque commande)
create or replace function public.refresh_seller_stats()
returns void
language sql
security definer
as $$
  refresh materialized view concurrently public.seller_stats;
$$;

-- ============================================================
-- FONCTION : top annonces par catégorie
-- ============================================================
create or replace function public.top_listings_by_category(
  p_category text default null,
  p_limit    int  default 10
)
returns table (
  id          uuid,
  title       text,
  category    text,
  price       numeric,
  image_url   text,
  order_count bigint,
  avg_rating  numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    l.id,
    l.title,
    l.category,
    l.price,
    l.image_url,
    count(distinct oi.order_id) as order_count,
    coalesce(round(avg(r.rating)::numeric,2), 0) as avg_rating
  from public.listings l
  left join public.order_items oi on oi.listing_id = l.id
  left join public.reviews     r  on r.listing_id  = l.id
  where l.status = 'active'
    and (p_category is null or l.category = p_category)
  group by l.id, l.title, l.category, l.price, l.image_url
  order by order_count desc, avg_rating desc
  limit p_limit;
$$;

grant execute on function public.top_listings_by_category(text, int) to authenticated, anon;
