-- Flash sales: time-boxed exact sale prices on selected products with optional
-- per-item quantity limits. Public may read (prices are public); writes are
-- service-role only. A product in overlapping active sales takes the LOWEST
-- currently-valid price (enforced in the app-side resolver).
create table if not exists flash_sales (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (starts_at < ends_at)
);

create table if not exists flash_sale_items (
  id uuid primary key default gen_random_uuid(),
  flash_sale_id uuid not null references flash_sales(id) on delete cascade,
  product_id text not null references products(id) on delete cascade,
  sale_price integer not null check (sale_price > 0),
  quantity_limit integer check (quantity_limit > 0),
  sold_count integer not null default 0,
  unique (flash_sale_id, product_id)
);

create index if not exists flash_sale_items_product_id_idx on flash_sale_items (product_id);

alter table flash_sales enable row level security;
alter table flash_sale_items enable row level security;
create policy "public read flash_sales" on flash_sales for select using (true);
create policy "public read flash_sale_items" on flash_sale_items for select using (true);

-- Atomic claim: increments sold_count only if the limit allows it; returns the
-- updated row, or no row when the claim would oversell (caller falls back to
-- base price). Single UPDATE = atomic under concurrency.
create or replace function claim_flash_sale_stock(item_id uuid, qty integer)
returns setof flash_sale_items language sql as $$
  update flash_sale_items
     set sold_count = sold_count + qty
   where id = item_id
     and qty > 0
     and (quantity_limit is null or sold_count + qty <= quantity_limit)
  returning *;
$$;

-- Compensating release for when the order insert fails after a claim.
create or replace function release_flash_sale_stock(item_id uuid, qty integer)
returns void language sql as $$
  update flash_sale_items
     set sold_count = greatest(sold_count - qty, 0)
   where id = item_id;
$$;

-- Only the server (service role) may mutate stock counters.
revoke execute on function claim_flash_sale_stock(uuid, integer) from public, anon, authenticated;
revoke execute on function release_flash_sale_stock(uuid, integer) from public, anon, authenticated;
