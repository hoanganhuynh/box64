-- Monthly profit-sharing ledger — mirrors the "Lợi nhuận FigBox" spreadsheet:
-- cost = quantity × (print cost/unit + protect box cost/unit), profit = revenue
-- - cost, split across partners by configurable percentages.
create table if not exists finance_settings (
  id integer primary key default 1,
  print_cost_per_unit integer not null default 20000,
  protect_box_cost_per_unit integer not null default 5000,
  partner_splits jsonb not null default '[{"name":"A. Hoàng","pct":30},{"name":"Ẩn","pct":30},{"name":"An","pct":40}]'::jsonb,
  updated_at timestamptz not null default now()
);

insert into finance_settings (id) values (1) on conflict (id) do nothing;

create table if not exists finance_entries (
  id uuid primary key default gen_random_uuid(),
  month text not null,                -- 'YYYY-MM'
  customer_name text not null,
  quantity integer not null default 0,
  revenue integer not null default 0,
  order_id text references orders(id) on delete set null,
  source text not null default 'external',  -- 'online' | 'external'
  note text,
  created_at timestamptz not null default now()
);

create index if not exists finance_entries_month_idx on finance_entries (month);
-- One finance row per online order — prevents double-sync
create unique index if not exists finance_entries_order_id_idx on finance_entries (order_id) where order_id is not null;
