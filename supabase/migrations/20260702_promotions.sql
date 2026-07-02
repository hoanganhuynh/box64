-- Promo codes — sitewide or scoped to one product attribute (brand, car_make,
-- color, manufacturer, type). Referral vouchers are promo_codes too
-- (is_referral=true, owner_id set, never expire); everything else must have
-- an expires_at.
create table if not exists promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null default 'fixed' check (type in ('fixed', 'percent')),
  value integer not null,
  scope text not null default 'all' check (scope in ('all', 'attribute')),
  attribute_key text check (attribute_key in ('brand', 'car_make', 'color', 'manufacturer', 'type')),
  attribute_value text,
  max_uses integer,
  used_count integer not null default 0,
  min_order_amount integer not null default 0,
  expires_at timestamptz,
  is_referral boolean not null default false,
  owner_id uuid references profiles(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists promo_codes_owner_id_idx on promo_codes (owner_id) where owner_id is not null;

-- One redemption per user per code — enforces single-use per account
-- regardless of the code's global max_uses.
create table if not exists promo_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  promo_code_id uuid not null references promo_codes(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  order_id text references orders(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (promo_code_id, user_id)
);

-- Referral program
alter table profiles add column if not exists referral_code text unique;
alter table profiles add column if not exists referred_by uuid references profiles(id);

create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references profiles(id) on delete cascade,
  referee_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (referee_id)
);
