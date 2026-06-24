ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sku          TEXT,
  ADD COLUMN IF NOT EXISTS manufacturer TEXT,
  ADD COLUMN IF NOT EXISTS car_make     TEXT,
  ADD COLUMN IF NOT EXISTS car_model    TEXT,
  ADD COLUMN IF NOT EXISTS color        TEXT,
  ADD COLUMN IF NOT EXISTS color_group  TEXT;

-- SKU must be unique when set
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_unique
  ON products (sku) WHERE sku IS NOT NULL;

-- Fast lookup of color variants
CREATE INDEX IF NOT EXISTS products_color_group_idx
  ON products (color_group) WHERE color_group IS NOT NULL;
