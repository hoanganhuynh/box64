-- Defense-in-depth: enable RLS on every internal/sensitive table so the DB
-- denies anon/authenticated access even if PostgREST grants are ever
-- (re)granted. The service-role key used by all server-side code BYPASSES
-- RLS, so server actions/routes are unaffected. Anon-key paths were audited:
-- the only anon reads are orders (already policy-gated) and products (public
-- catalog data — given an explicit public-read policy below).

-- ── products: public catalog — anon/checkout read it, but only the
--    service role may write. RLS + read-only policy.
alter table products enable row level security;
drop policy if exists "public read products" on products;
create policy "public read products" on products for select using (true);

-- ── Internal, service-role-only tables. Enabling RLS with NO policy denies
--    all anon/authenticated access; the service role still has full access.
do $$
declare t text;
begin
  foreach t in array array[
    'promo_codes', 'promo_code_redemptions',
    'finance_settings', 'finance_entries',
    'product_comments', 'banned_words', 'user_moderation', 'ai_moderation_config',
    'comment_moderation_logs',
    'game_config', 'game_spins', 'user_quests',
    'user_referral', 'referrals',
    'custom_requests',
    'bank_settings', 'admin_settings',
    'categories'
  ]
  loop
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = t) then
      execute format('alter table public.%I enable row level security', t);
    end if;
  end loop;
end $$;
