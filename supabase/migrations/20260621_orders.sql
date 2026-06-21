-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New query

create table if not exists orders (
  id            text primary key,
  user_id       uuid references auth.users(id) on delete set null,
  status        text not null default 'pending'
                  check (status in ('pending','printing','shipped','delivered','cancelled')),
  items         jsonb not null,
  shipping      jsonb not null,
  subtotal      integer not null,
  total         integer not null,
  payment_method text not null default 'transfer',
  payment_ref   text,
  coupon_code   text,
  discount      integer not null default 0,
  note          text,
  created_at    timestamptz not null default now()
);

-- Row-level security
alter table orders enable row level security;

-- Drop existing policies if re-running
drop policy if exists "owner_select" on orders;
drop policy if exists "anyone_insert" on orders;
drop policy if exists "owner_update" on orders;

-- Logged-in users see only their own orders
create policy "owner_select" on orders
  for select using (auth.uid() = user_id);

-- Anyone (including anon) can insert
create policy "anyone_insert" on orders
  for insert with check (true);

-- Only owner can update (for future self-cancel)
create policy "owner_update" on orders
  for update using (auth.uid() = user_id);
