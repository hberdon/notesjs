-- Migration: 002_trash
-- Adds a real `deleted_at` timestamp to files so the trash can show an accurate
-- deletion date and filter by a recency window (the previous code relied on
-- `updated_at`, which changes on any edit and so mislabelled the deletion date).
-- Run once via Supabase SQL editor or: supabase db push

-- ── deleted_at column ────────────────────────────────────────────────────────
-- Nullable: NULL means the file is not in the trash. Set to now() on soft-delete,
-- cleared back to NULL on restore (both done by the app, not a trigger).
ALTER TABLE files ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Backfill: existing trashed rows have no deleted_at — seed it from updated_at so
-- they still appear with a plausible date instead of NULL (which the 7-day filter
-- would exclude).
UPDATE files
  SET deleted_at = updated_at
  WHERE is_deleted = true AND deleted_at IS NULL;

-- ── Index for the trash query ────────────────────────────────────────────────
-- The trash modal filters by (user_id, is_deleted, deleted_at). A partial index
-- on deleted rows keeps it small.
CREATE INDEX IF NOT EXISTS files_trash_idx
  ON files (user_id, deleted_at DESC)
  WHERE is_deleted = true;

-- ── Rollback ─────────────────────────────────────────────────────────────────
-- To revert: DROP INDEX IF EXISTS files_trash_idx;
--            ALTER TABLE files DROP COLUMN IF EXISTS deleted_at;
