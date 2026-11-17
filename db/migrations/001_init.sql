CREATE TABLE IF NOT EXISTS admins (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE,
  name          text NOT NULL,
  password_hash text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- id = SHA-256 do token; o token em si só existe no cookie do navegador
CREATE TABLE IF NOT EXISTS sessions (
  id         text PRIMARY KEY,
  admin_id   uuid NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS categories (
  id          serial PRIMARY KEY,
  slug        text NOT NULL UNIQUE,
  name        text NOT NULL,
  description text NOT NULL DEFAULT '',
  image       text NOT NULL DEFAULT '',
  position    int  NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id          serial PRIMARY KEY,
  slug        text NOT NULL UNIQUE,
  name        text NOT NULL,
  category_id int  REFERENCES categories(id) ON DELETE SET NULL,
  image       text NOT NULL DEFAULT '',
  price_label text NOT NULL DEFAULT 'Sob consulta',
  detail      text NOT NULL DEFAULT '',
  active      boolean NOT NULL DEFAULT true,
  position    int  NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quotes (
  id           serial PRIMARY KEY,
  name         text NOT NULL,
  whatsapp     text NOT NULL,
  desired_date date,
  product_type text,
  idea         text NOT NULL DEFAULT '',
  status       text NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','em_contato','fechado','descartado')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rate_events (
  bucket     text NOT NULL,
  key        text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS rate_events_idx ON rate_events (bucket, key, created_at);
