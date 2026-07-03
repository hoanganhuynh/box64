-- In-app notifications for the admin. Rows are written by DB triggers so every
-- write path is caught (SePay webhook orders, Google OAuth signups the app
-- never sees). RLS with no policies: service-role only — the admin browser has
-- no Supabase identity, content is fetched via admin-cookie-gated actions.
create table if not exists admin_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('order', 'comment', 'user')),
  title text not null,
  body text,
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists admin_notifications_created_at_idx on admin_notifications (created_at desc);

alter table admin_notifications enable row level security;

-- Broadcast an EMPTY signal on the public channel 'admin-notif'. Payload
-- carries only the event type — an anonymous subscriber can learn THAT
-- something happened, never WHAT. The client refetches content through a
-- gated server action. realtime.send failures must never break the insert.
create or replace function admin_notif_signal(evt_type text)
returns void language plpgsql as $$
begin
  perform realtime.send(jsonb_build_object('type', evt_type), 'new', 'admin-notif', false);
exception when others then
  null;
end $$;

create or replace function notify_admin_new_order()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into admin_notifications (type, title, body, href) values (
    'order',
    'Đơn hàng mới ' || new.id,
    coalesce(new.shipping->>'name', '') || ' · ' || new.total::text || '₫',
    '/admin/orders/' || new.id
  );
  perform admin_notif_signal('order');
  return new;
end $$;

drop trigger if exists trg_notify_admin_new_order on orders;
create trigger trg_notify_admin_new_order
  after insert on orders
  for each row execute function notify_admin_new_order();

create or replace function notify_admin_new_comment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into admin_notifications (type, title, body, href) values (
    'comment',
    'Bình luận mới',
    coalesce(new.user_name, 'Ẩn danh') || ': ' || left(new.content, 80),
    '/admin/moderation'
  );
  perform admin_notif_signal('comment');
  return new;
end $$;

drop trigger if exists trg_notify_admin_new_comment on product_comments;
create trigger trg_notify_admin_new_comment
  after insert on product_comments
  for each row execute function notify_admin_new_comment();

-- Trigger on auth.users catches Google OAuth signups. Requires the migration
-- to run as postgres (supabase db push / SQL editor does). security definer so
-- the auth-schema trigger can insert into public.admin_notifications.
create or replace function public.notify_admin_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into admin_notifications (type, title, body, href) values (
    'user',
    'Người dùng mới đăng ký',
    new.email,
    '/admin/customers'
  );
  perform admin_notif_signal('user');
  return new;
end $$;

drop trigger if exists trg_notify_admin_new_user on auth.users;
create trigger trg_notify_admin_new_user
  after insert on auth.users
  for each row execute function public.notify_admin_new_user();
