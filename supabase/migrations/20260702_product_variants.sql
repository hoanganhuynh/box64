-- Box variants per product (custom MiniGT / custom Poprace / MiniGT zin),
-- each with its own price. Empty array = no selector, plain product.price used.
alter table products add column if not exists variants jsonb not null default '[]'::jsonb;
