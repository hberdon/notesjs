-- Migration: 001_files
-- Creates the files table with RLS and auto-update trigger.
-- Run once via Supabase SQL editor or: supabase db push

-- ── Table ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS files (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name       text        NOT NULL,
  content    text        NOT NULL DEFAULT '',
  language   text        NOT NULL DEFAULT 'text',
  is_deleted boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Single policy covering all operations: users can only touch their own rows.
CREATE POLICY "Users can manage their own files"
  ON files
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── updated_at Trigger ─────────────────────────────────────────────────────

-- Function: set updated_at to now() on every UPDATE
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger: fires BEFORE UPDATE so updated_at is set before the row is written
CREATE TRIGGER files_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ── public_links ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public_links (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id      uuid        NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES auth.users(id),
  token        text        NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  expires_at   timestamptz,
  password_hash text,
  permission   text        NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'view+download')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public_links ENABLE ROW LEVEL SECURITY;

-- Owner can do everything with their links. This is the ONLY policy on
-- public_links: anonymous viewers never read this table directly — every public
-- read goes through the get_shared_file() RPC (SECURITY DEFINER, bypasses RLS).
--
-- A previous "public_read" SELECT policy let anyone read every non-expired row,
-- which exposed `password_hash` (bcrypt) and `token` to offline cracking /
-- link enumeration. RLS is row-level, not column-level, so it cannot hide a
-- single column — the correct fix is to not allow public SELECT at all and let
-- the RPC be the sole gatekeeper for shared content.
CREATE POLICY "owner_all" ON public_links
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Password hashing ───────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Auto-hash the password before storing it (bcrypt cost 8).
-- The client sends the plain password; this trigger ensures only the hash is persisted.
CREATE OR REPLACE FUNCTION hash_public_link_password()
RETURNS trigger LANGUAGE plpgsql
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  IF NEW.password_hash IS NOT NULL THEN
    NEW.password_hash = crypt(NEW.password_hash, gen_salt('bf', 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER public_links_hash_password
  BEFORE INSERT ON public_links
  FOR EACH ROW EXECUTE FUNCTION hash_public_link_password();

-- ── Shared file RPC ────────────────────────────────────────────────────────

-- Returns the file + link data for a given share token.
-- Handles three cases:
--   · token not found or expired → returns NULL
--   · link has password but none was provided → returns { requires_password: true }
--   · link has password and wrong password was provided → returns { wrong_password: true }
--   · no password or correct password → returns { file: {...}, link: {...} }
--
-- SECURITY DEFINER: runs as the function owner, bypassing RLS on files.
-- The password is verified with bcrypt via pgcrypto — the hash is never exposed to the client.
CREATE OR REPLACE FUNCTION get_shared_file(p_token text, p_password text DEFAULT NULL)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  v_link public_links%ROWTYPE;
  v_file files%ROWTYPE;
BEGIN
  SELECT * INTO v_link
  FROM public_links
  WHERE token = p_token
    AND (expires_at IS NULL OR expires_at > now());

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF v_link.password_hash IS NOT NULL THEN
    IF p_password IS NULL THEN
      RETURN jsonb_build_object('requires_password', true);
    END IF;
    IF v_link.password_hash != crypt(p_password, v_link.password_hash) THEN
      RETURN jsonb_build_object('wrong_password', true);
    END IF;
  END IF;

  SELECT * INTO v_file FROM files WHERE id = v_link.file_id;

  RETURN jsonb_build_object(
    'file', jsonb_build_object(
      'id',       v_file.id,
      'name',     v_file.name,
      'content',  v_file.content,
      'language', v_file.language
    ),
    'link', jsonb_build_object(
      'id',         v_link.id,
      'token',      v_link.token,
      'permission', v_link.permission,
      'expires_at', v_link.expires_at
    )
  );
END;
$$;

-- ── Rollback ───────────────────────────────────────────────────────────────
-- To revert: DROP FUNCTION IF EXISTS get_shared_file(text, text);
--            DROP TRIGGER IF EXISTS public_links_hash_password ON public_links;
--            DROP FUNCTION IF EXISTS hash_public_link_password();
--            DROP TABLE IF EXISTS public_links CASCADE;
--            DROP TABLE IF EXISTS files CASCADE;
--            DROP FUNCTION IF EXISTS update_updated_at();
