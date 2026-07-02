-- Product comments — login required, auto-moderated (no admin review needed
-- for the common case). Violations tracked on the profile; 3 strikes = warned,
-- the 4th auto-bans the account from commenting.
alter table profiles add column if not exists comment_violations integer not null default 0;
alter table profiles add column if not exists comment_banned boolean not null default false;
alter table profiles add column if not exists comment_banned_at timestamptz;

create table if not exists product_comments (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references products(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists product_comments_product_id_idx on product_comments (product_id, created_at desc);

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
