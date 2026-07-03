-- Adds a 'freeship' promo type — discounts the shipping fee by `value`
-- percent (e.g. value=50 → 50% off shipping, value=100 → free shipping),
-- computed against shippingFee instead of subtotal. Reuses the existing
-- `value` column rather than adding a new one.
alter table promo_codes drop constraint if exists promo_codes_type_check;
alter table promo_codes add constraint promo_codes_type_check
  check (type in ('fixed', 'percent', 'freeship'));
