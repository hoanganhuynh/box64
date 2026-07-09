-- Gamification: Porsche Lover badge, lucky spin wheel (1 spin per paid order),
-- and one-time hidden quests. Badge state is DERIVED (rolling 60-day window of
-- paid Porsche purchases) — nothing to store or expire. Spins and quest awards
-- are stored because they carry one-time rewards.

-- Singleton config — admin-tunable from /admin/game.
create table if not exists game_config (
  id boolean primary key default true check (id),
  spin_enabled boolean not null default true,
  badge_brand text not null default 'porsche',
  badge_threshold integer not null default 5 check (badge_threshold > 0),
  badge_window_days integer not null default 60 check (badge_window_days > 0),
  badge_discount_pct integer not null default 10 check (badge_discount_pct between 0 and 100),
  slow_product_id text references products(id) on delete set null,
  spin_weights jsonb not null default '{"slow_product": 5, "freeship": 25, "brand": 15, "color": 15, "nothing": 40}'::jsonb
);
insert into game_config (id) values (true) on conflict (id) do nothing;

-- One spin per paid order.
create table if not exists game_spins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id text not null unique references orders(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'spun')),
  reward_type text,
  promo_code_id uuid references promo_codes(id) on delete set null,
  created_at timestamptz not null default now(),
  spun_at timestamptz
);
create index if not exists game_spins_user_status_idx on game_spins (user_id, status);

-- One-time hidden quest rewards. PK doubles as the "already awarded" guard.
create table if not exists user_quests (
  user_id uuid not null references auth.users(id) on delete cascade,
  quest_key text not null,
  achieved_at timestamptz not null default now(),
  promo_code_id uuid references promo_codes(id) on delete set null,
  primary key (user_id, quest_key)
);

-- Spin rewards can target one specific product ("sản phẩm ế" the admin picks)
-- — widen promo scope with a product dimension.
alter table promo_codes add column if not exists product_id text references products(id) on delete cascade;
alter table promo_codes drop constraint if exists promo_codes_scope_check;
alter table promo_codes add constraint promo_codes_scope_check
  check (scope in ('all', 'attribute', 'product'));

-- Grant a spin the moment an order is confirmed paid — regardless of which
-- path confirmed it (SePay IPN, admin manual confirm, future gateways).
-- Fail-safe: a notify/grant failure must never break the payment update.
create or replace function grant_spin_on_paid()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.payment_status = 'paid'
     and (tg_op = 'INSERT' or old.payment_status is distinct from 'paid')
     and new.user_id is not null
     and (select spin_enabled from game_config where id) then
    begin
      insert into game_spins (user_id, order_id) values (new.user_id, new.id)
      on conflict (order_id) do nothing;
    exception when others then
      raise warning 'grant_spin_on_paid failed: %', sqlerrm;
    end;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_grant_spin_on_paid on orders;
create trigger trg_grant_spin_on_paid
after insert or update of payment_status on orders
for each row execute function grant_spin_on_paid();
