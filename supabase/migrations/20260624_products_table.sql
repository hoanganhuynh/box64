-- ─── PRODUCTS ───────────────────────────────────────────────────────────────
create table if not exists products (
  id          text        primary key,
  type        text        not null default 'box_custom',
  name        text        not null,
  slug        text        unique not null,
  price       integer     not null,
  images      text[]      not null default '{}',
  stock       integer     not null default 999,
  status      text        not null default 'active',
  description text,
  tags        text[]      default '{}',
  material    text,
  brand       text,
  created_at  timestamptz default now()
);

-- Admin uses service role key → no RLS needed
-- (no alter table enable row level security)
