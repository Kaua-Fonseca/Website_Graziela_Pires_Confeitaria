-- Usuários unificados (ADMIN / CLIENT), conteúdo editável, seções e mídia.

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL,
  name          text NOT NULL,
  phone         text,
  password_hash text NOT NULL,
  role          text NOT NULL DEFAULT 'CLIENT' CHECK (role IN ('ADMIN','CLIENT')),
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_uq ON users (lower(email));

-- preserva os administradores já criados (mesmos ids e hashes)
INSERT INTO users (id, email, name, password_hash, role, created_at)
SELECT id, lower(email), name, password_hash, 'ADMIN', created_at FROM admins;

ALTER TABLE sessions DROP CONSTRAINT sessions_admin_id_fkey;
ALTER TABLE sessions RENAME COLUMN admin_id TO user_id;
ALTER TABLE sessions ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX sessions_user_idx ON sessions (user_id);
DROP TABLE admins;

CREATE TABLE password_resets (
  token_hash text PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  used_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- orçamento pode estar ligado a um cliente logado; apagar o cliente mantém o orçamento
ALTER TABLE quotes ADD COLUMN user_id uuid REFERENCES users(id) ON DELETE SET NULL;

-- textos, contatos e redes sociais editáveis (chave/valor; chaves válidas definidas no código)
CREATE TABLE site_content (
  key        text PRIMARY KEY,
  value      text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE site_sections (
  key      text PRIMARY KEY,
  enabled  boolean NOT NULL DEFAULT true,
  position int NOT NULL DEFAULT 0
);

CREATE TABLE media (
  id            serial PRIMARY KEY,
  filename      text NOT NULL UNIQUE,
  original_name text NOT NULL,
  mime          text NOT NULL,
  size          int  NOT NULL,
  alt           text NOT NULL DEFAULT '',
  uploaded_by   uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
