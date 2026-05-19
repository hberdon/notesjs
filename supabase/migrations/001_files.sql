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

-- ── Rollback ───────────────────────────────────────────────────────────────
-- To revert: DROP TABLE IF EXISTS files CASCADE;
--            DROP FUNCTION IF EXISTS update_updated_at();
