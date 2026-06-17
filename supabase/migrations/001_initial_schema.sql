-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES ───
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  phone      text unique,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, phone)
  values (new.id, new.phone);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── ADDRESSES ───
create table addresses (
  id         uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  name       text not null,
  line1      text not null,
  city       text not null,
  country    text not null default 'VN',
  phone      text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

alter table addresses enable row level security;

create policy "Users can manage own addresses"
  on addresses for all
  using (auth.uid() = profile_id);

-- ─── PRODUCTS ───
create table products (
  id          uuid primary key default uuid_generate_v4(),
  type        text not null check (type in ('box_catalog', 'box_custom', 'accessory')),
  name        text not null,
  slug        text unique not null,
  price       integer not null,
  images      text[] not null default '{}',
  stock       integer not null default 0,
  status      text not null default 'active'
              check (status in ('active', 'pre_order', 'out_of_stock')),
  description text,
  created_at  timestamptz default now()
);

alter table products enable row level security;

create policy "Public can read active products"
  on products for select
  using (status != 'out_of_stock');

create policy "Admins can manage products"
  on products for all
  using (auth.jwt() ->> 'role' = 'admin');

-- ─── PROMOTIONS ───
create table promotions (
  id           uuid primary key default uuid_generate_v4(),
  type         text not null check (type in ('sale', 'pre_order', 'flash_sale')),
  label        text not null,
  discount_pct integer not null default 0 check (discount_pct between 0 and 100),
  starts_at    timestamptz not null,
  ends_at      timestamptz not null,
  product_ids  uuid[],
  priority     integer not null default 1,
  created_at   timestamptz default now()
);

alter table promotions enable row level security;

create policy "Public can read active promotions"
  on promotions for select
  using (now() between starts_at and ends_at);

create policy "Admins can manage promotions"
  on promotions for all
  using (auth.jwt() ->> 'role' = 'admin');

-- ─── ORDERS ───
create table orders (
  id              uuid primary key default uuid_generate_v4(),
  profile_id      uuid references profiles(id),
  status          text not null default 'pending'
                  check (status in ('pending', 'printing', 'shipped', 'delivered', 'cancelled')),
  items           jsonb not null default '[]',
  shipping        jsonb not null,
  total           integer not null,
  payment_method  text not null check (payment_method in ('vnpay', 'momo', 'paypal')),
  payment_ref     text,
  pdf_url         text,
  tracking_number text,
  created_at      timestamptz default now()
);

alter table orders enable row level security;

create policy "Users can read own orders"
  on orders for select
  using (auth.uid() = profile_id);

create policy "Admins can manage all orders"
  on orders for all
  using (auth.jwt() ->> 'role' = 'admin');

-- ─── DESIGN JOBS ───
create table design_jobs (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid references orders(id) on delete cascade,
  canvas_data  jsonb not null,
  pdf_url      text,
  generated_at timestamptz
);

alter table design_jobs enable row level security;

create policy "Admins can manage design jobs"
  on design_jobs for all
  using (auth.jwt() ->> 'role' = 'admin');

-- ─── TEMPLATES ───
create table templates (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  logo_variant   text not null check (logo_variant in ('minigt', 'poprace', 'custom')),
  default_colors jsonb not null,
  preview_url    text,
  created_at     timestamptz default now()
);

alter table templates enable row level security;

create policy "Public can read templates"
  on templates for select
  using (true);

create policy "Admins can manage templates"
  on templates for all
  using (auth.jwt() ->> 'role' = 'admin');

-- ─── SERVER TIME FUNCTION ───
-- Countdown timers sync to this, not Date.now(), for timezone accuracy
create or replace function get_server_time()
returns timestamptz language sql stable as $$
  select now();
$$;
