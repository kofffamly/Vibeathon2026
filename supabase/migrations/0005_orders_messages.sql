-- 0005_orders_messages.sql
-- Tables : orders, order_items, messages (chat entre acheteur et vendeur)

-- ============================================================
-- TABLE: orders
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'en_attente'
    check (status in ('en_attente','en_cours','confirmee','livree','annulee')),
  total numeric(12,2) not null default 0,
  delivery_note text,
  payment_method text not null default 'sur_place'
    check (payment_method in ('sur_place','mobile_money','virement')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- TABLE: order_items
-- ============================================================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete restrict,
  seller_id uuid not null references public.profiles(id) on delete restrict,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TABLE: messages (chat acheteur <-> vendeur par annonce)
-- ============================================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEX
-- ============================================================
create index if not exists idx_orders_buyer on public.orders (buyer_id);
create index if not exists idx_order_items_order on public.order_items (order_id);
create index if not exists idx_order_items_seller on public.order_items (seller_id);
create index if not exists idx_messages_listing on public.messages (listing_id);
create index if not exists idx_messages_sender on public.messages (sender_id);
create index if not exists idx_messages_receiver on public.messages (receiver_id);

-- ============================================================
-- TRIGGERS updated_at
-- ============================================================
drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS
-- ============================================================
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.messages enable row level security;

-- Orders : acheteur voit ses commandes, vendeur voit les commandes qui le concernent
drop policy if exists "orders_select" on public.orders;
create policy "orders_select" on public.orders for select to authenticated
  using (
    buyer_id = auth.uid()
    or exists (
      select 1 from public.order_items oi where oi.order_id = id and oi.seller_id = auth.uid()
    )
  );

drop policy if exists "orders_insert" on public.orders;
create policy "orders_insert" on public.orders for insert to authenticated
  with check (buyer_id = auth.uid());

drop policy if exists "orders_update" on public.orders;
create policy "orders_update" on public.orders for update to authenticated
  using (
    buyer_id = auth.uid()
    or exists (
      select 1 from public.order_items oi where oi.order_id = id and oi.seller_id = auth.uid()
    )
  );

-- Order items
drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items for select to authenticated
  using (
    seller_id = auth.uid()
    or exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
  );

drop policy if exists "order_items_insert" on public.order_items;
create policy "order_items_insert" on public.order_items for insert to authenticated
  with check (
    exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
  );

-- Messages : sender ou receiver
drop policy if exists "messages_select" on public.messages;
create policy "messages_select" on public.messages for select to authenticated
  using (sender_id = auth.uid() or receiver_id = auth.uid());

drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages for insert to authenticated
  with check (sender_id = auth.uid());

drop policy if exists "messages_update" on public.messages;
create policy "messages_update" on public.messages for update to authenticated
  using (receiver_id = auth.uid());

-- ============================================================
-- FONCTION : créer une commande complète (order + items atomique)
-- ============================================================
create or replace function public.create_order(
  p_items jsonb,  -- [{listing_id, quantity, unit_price, seller_id}]
  p_total numeric,
  p_payment_method text default 'sur_place',
  p_delivery_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_item jsonb;
begin
  insert into public.orders (buyer_id, total, payment_method, delivery_note)
  values (auth.uid(), p_total, p_payment_method, p_delivery_note)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.order_items (order_id, listing_id, seller_id, quantity, unit_price)
    values (
      v_order_id,
      (v_item->>'listing_id')::uuid,
      (v_item->>'seller_id')::uuid,
      (v_item->>'quantity')::numeric,
      (v_item->>'unit_price')::numeric
    );
  end loop;

  return v_order_id;
end;
$$;

grant execute on function public.create_order(jsonb, numeric, text, text) to authenticated;
