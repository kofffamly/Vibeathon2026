-- 0012_notifications.sql
-- Table : notifications (alertes in-app pour les utilisateurs)

-- ============================================================
-- TABLE: notifications
-- ============================================================
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in (
                'nouvelle_commande',
                'commande_confirmee',
                'commande_livree',
                'nouveau_message',
                'nouvelle_annonce_proche',
                'avis_recu',
                'promotion'
              )),
  title       text not null,
  body        text,
  data        jsonb,           -- payload flexible (listing_id, order_id, etc.)
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

comment on table public.notifications is 'Notifications in-app pour tous les utilisateurs';

-- Index pour charger les notifs non lues rapidement
create index if not exists idx_notif_user       on public.notifications (user_id);
create index if not exists idx_notif_user_read  on public.notifications (user_id, read);
create index if not exists idx_notif_created    on public.notifications (created_at desc);

-- RLS
alter table public.notifications enable row level security;

drop policy if exists "notif_select" on public.notifications;
create policy "notif_select" on public.notifications for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "notif_update" on public.notifications;
create policy "notif_update" on public.notifications for update to authenticated
  using (user_id = auth.uid());

drop policy if exists "notif_delete" on public.notifications;
create policy "notif_delete" on public.notifications for delete to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- FONCTION : créer une notification (appelée par triggers)
-- ============================================================
create or replace function public.create_notification(
  p_user_id uuid,
  p_type    text,
  p_title   text,
  p_body    text default null,
  p_data    jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, body, data)
  values (p_user_id, p_type, p_title, p_body, p_data);
end;
$$;

-- ============================================================
-- TRIGGER : notification automatique sur nouvelle commande
-- ============================================================
create or replace function public.notify_new_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seller_id uuid;
  v_listing_title text;
begin
  -- Pour chaque item de la commande, notifier le vendeur
  for v_seller_id, v_listing_title in
    select oi.seller_id, l.title
    from public.order_items oi
    join public.listings l on l.id = oi.listing_id
    where oi.order_id = NEW.id
  loop
    perform public.create_notification(
      v_seller_id,
      'nouvelle_commande',
      '🛒 Nouvelle commande reçue',
      'Commande pour : ' || v_listing_title,
      jsonb_build_object('order_id', NEW.id)
    );
  end loop;
  return NEW;
end;
$$;

drop trigger if exists trg_notify_new_order on public.orders;
create trigger trg_notify_new_order
  after insert on public.orders
  for each row execute function public.notify_new_order();

-- ============================================================
-- TRIGGER : notification sur nouveau message
-- ============================================================
create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_listing_title text;
begin
  select title into v_listing_title from public.listings where id = NEW.listing_id;
  perform public.create_notification(
    NEW.receiver_id,
    'nouveau_message',
    '💬 Nouveau message',
    'Message concernant : ' || coalesce(v_listing_title, 'une annonce'),
    jsonb_build_object('listing_id', NEW.listing_id, 'sender_id', NEW.sender_id)
  );
  return NEW;
end;
$$;

drop trigger if exists trg_notify_new_message on public.messages;
create trigger trg_notify_new_message
  after insert on public.messages
  for each row execute function public.notify_new_message();
