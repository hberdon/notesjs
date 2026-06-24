-- One-time cleanup: remove empty "Untitled" files that were auto-created
-- before the "promote on first edit" pattern was in place.
-- Run manually in the Supabase SQL editor. Not a schema migration.
--
-- Preview first:
--   SELECT id, name, length(content), created_at FROM files
--   WHERE name ILIKE 'Untitled%' AND content = '' AND is_deleted = false;
--
-- Then delete:
DELETE FROM files
WHERE name ILIKE 'Untitled%'
  AND content = ''
  AND is_deleted = false;
