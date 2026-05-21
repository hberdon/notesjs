import type { Database } from '@/lib/database.types'

// ── Domain types ────────────────────────────────────────────────────────────

/**
 * All supported CodeMirror 6 language IDs.
 * Maps 1:1 to the keys of LANG_MAP in utils.ts.
 * 'text' is the fallback for unknown extensions.
 */
export type Language =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'markdown'
  | 'html'
  | 'xml'
  | 'css'
  | 'json'
  | 'java'
  | 'rust'
  | 'sql'
  | 'text'

/** Light, dark, or system-matched UI theme. */
export type Theme = 'light' | 'dark' | 'auto'

// ── Database-derived types ──────────────────────────────────────────────────

/**
 * A file row as returned by Supabase.
 * Mirrors `Database['public']['Tables']['files']['Row']`
 * but narrows `language` to the Language union for type safety.
 */
export type DbFile = Omit<
  Database['public']['Tables']['files']['Row'],
  'language'
> & {
  language: Language
}

// ── Editor UI types ─────────────────────────────────────────────────────────

/**
 * An open tab in the editor.
 *
 * `fileId` is null for brand-new files that haven't been persisted yet.
 * Once saved, fileId is set to the Supabase row UUID.
 */
export interface Tab {
  /** Stable local identifier for the tab — NOT the same as fileId */
  id: string
  /** Supabase file UUID, or null if the file hasn't been persisted yet */
  fileId: string | null
  /** Display name shown in the tab bar — includes extension, e.g. "main.ts" */
  filename: string
  /** CodeMirror language ID derived from the filename extension */
  language: Language
  /** True when the editor content differs from the last saved version */
  isDirty: boolean
}

// ── Sharing / public links ──────────────────────────────────────────────────

export type SharePermission = 'view' | 'view+download'

export type ExpiryOption = '1h' | '1d' | '7d' | '30d' | null

export type PublicLink = {
  id: string
  file_id: string
  user_id: string
  token: string
  expires_at: string | null
  password_hash: string | null
  permission: SharePermission
  created_at: string
}
