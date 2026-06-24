CREATE TABLE IF NOT EXISTS bank_settings (
  id            INTEGER PRIMARY KEY DEFAULT 1,
  bank_id       TEXT NOT NULL DEFAULT 'MB',
  account_number TEXT NOT NULL DEFAULT '',
  account_name   TEXT NOT NULL DEFAULT '',
  qr_image_url   TEXT,
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- Enforce singleton row
CREATE UNIQUE INDEX IF NOT EXISTS bank_settings_singleton ON bank_settings (id);

-- Seed from current env defaults
INSERT INTO bank_settings (id, bank_id, account_number, account_name)
VALUES (1, 'MB', '9519152688', 'NGUYEN DINH AN')
ON CONFLICT (id) DO NOTHING;
