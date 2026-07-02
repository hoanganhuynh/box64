-- Product comments — login required, auto-moderated (no admin review needed
-- for the common case). Violations tracked per account; 3 strikes = warned,
-- the 4th auto-bans the account from commenting.
--
-- This project has no `profiles` table — user identity lives on
-- auth.users directly (see orders.user_id). Comments denormalize the
-- display name/avatar at post time instead of joining a profile.
create table if not exists product_comments (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text,
  user_avatar text,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists product_comments_product_id_idx on product_comments (product_id, created_at desc);

create table if not exists user_moderation (
  user_id uuid primary key references auth.users(id) on delete cascade,
  comment_violations integer not null default 0,
  comment_banned boolean not null default false,
  comment_banned_at timestamptz
);

-- Admin-editable blocklist — normalized lowercase, diacritics stripped, so
-- matching is accent- and case-insensitive at the application layer.
create table if not exists banned_words (
  id uuid primary key default gen_random_uuid(),
  word text not null unique,
  created_at timestamptz not null default now()
);

insert into banned_words (word) values
  ('dcm'), ('dmm'), ('vcl'), ('vl'), ('cak'), ('clm'), ('djt'), ('dit me'),
  ('lon'), ('cak'), ('cac'), ('buoi'), ('deo'), ('ditme'), ('vcc'), ('cmm'),
  ('fuck'), ('shit'), ('bitch'), ('asshole')
on conflict (word) do nothing;
