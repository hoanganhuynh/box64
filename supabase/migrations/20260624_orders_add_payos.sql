-- Add PayOS fields to orders
alter table orders
  add column if not exists payos_order_code bigint,
  add column if not exists payment_status   text not null default 'pending';

-- Index for webhook lookups
create index if not exists orders_payos_order_code_idx on orders (payos_order_code)
  where payos_order_code is not null;
