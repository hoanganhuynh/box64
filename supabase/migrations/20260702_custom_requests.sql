-- Sample/custom box requests — submitted from the search page (no-results
-- state) and from the footer request form.
create table if not exists custom_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  car_models text[] not null default '{}',
  image_urls text[] not null default '{}',
  search_query text,
  source text not null default 'search',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists custom_requests_created_at_idx on custom_requests (created_at desc);
