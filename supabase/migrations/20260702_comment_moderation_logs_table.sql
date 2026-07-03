create table if not exists comment_moderation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references products(id) on delete cascade,
  content text not null,
  action text not null check (action in ('ALLOWED', 'BLOCKED')),
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists comment_moderation_logs_created_at_idx on comment_moderation_logs (created_at desc);
create index if not exists comment_moderation_logs_user_id_idx on comment_moderation_logs (user_id);
