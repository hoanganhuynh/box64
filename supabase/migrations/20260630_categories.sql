CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  color       TEXT NOT NULL DEFAULT '#6366f1',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

INSERT INTO categories (slug, name, description, color, sort_order) VALUES
  ('box_catalog',  'Box Catalog',  'Template MiniGT có sẵn',    '#6366f1', 0),
  ('box_custom',   'Box Custom',   'Thiết kế theo yêu cầu',     '#F0A500', 1),
  ('water_decal',  'Water Decal',  'Decal dán nước trang trí',  '#22c55e', 2),
  ('accessory_3d', 'Phụ kiện 3D', 'Phụ kiện in 3D cho xe',     '#e54c10', 3)
ON CONFLICT (slug) DO NOTHING;

-- Track product updates
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
