-- Audit trail for every CRUD action performed in the admin UI.
-- Written app-side by logAdminAction() (service role); no RLS policies on
-- purpose — the admin browser has no Supabase identity, all reads go through
-- admin-cookie-gated server actions.
create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  action text not null check (action in ('create', 'update', 'delete')),
  entity_type text not null,
  entity_id text,
  entity_label text not null,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_created_at_idx on admin_audit_logs (created_at desc);
create index if not exists admin_audit_logs_entity_type_idx on admin_audit_logs (entity_type);

alter table admin_audit_logs enable row level security;
