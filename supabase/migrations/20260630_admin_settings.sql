CREATE TABLE IF NOT EXISTS admin_settings (
  id            INTEGER PRIMARY KEY DEFAULT 1,
  password_hash TEXT,
  updated_at    TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS admin_settings_singleton ON admin_settings (id);
INSERT INTO admin_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
