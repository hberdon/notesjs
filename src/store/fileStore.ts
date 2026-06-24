import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { DbFile, FileMeta, PublicLink, SharePermission } from '@/shared/types'
import { detectLanguage } from '@/shared/utils'

export type SharedFileResult =
  | { status: 'needs_password' }
  | { status: 'wrong_password' }
  | { status: 'ok'; link: PublicLink; file: DbFile }

const SIZE_WARN_BYTES = 512_000 // 500 KB

/** Trashed files older than this (by deleted_at) are hidden from the modal. */
const TRASH_VISIBLE_DAYS = 7

interface FileStore {
  files: FileMeta[]
  loading: boolean
  error: string | null

  /**
   * Load metadata (no content) for all non-deleted files of the current user,
   * ordered by updated_at DESC. Content is fetched lazily per file via
   * loadFileContent when a file is actually opened.
   */
  fetchFiles: () => Promise<void>

  /** Fetch the content body for a single file. Returns null on error. */
  loadFileContent: (id: string) => Promise<string | null>

  /**
   * List soft-deleted files (the "trash"), metadata only, newest first.
   * Only returns files trashed within the last TRASH_VISIBLE_DAYS — older ones
   * stay in the DB but are hidden, and can only be cleared via emptyTrash().
   */
  fetchDeletedFiles: () => Promise<FileMeta[]>

  /** Count ALL soft-deleted files of the user (visible + hidden) — drives the
   * "Vaciar papelera" button visibility and its confirmation count. */
  countTrash: () => Promise<number>

  /** Permanently (hard) delete EVERY trashed file of the user — visible and
   * hidden alike. Irreversible. Returns how many rows were removed. */
  emptyTrash: () => Promise<number>

  /** Restore a soft-deleted file by clearing is_deleted + deleted_at. */
  restoreFile: (id: string) => Promise<void>

  /**
   * Create a new file with the given name.
   * Language is derived from the file extension.
   * Warns to the console if content would exceed 500 KB (empty on creation,
   * so the guard applies when initial content is passed explicitly).
   */
  createFile: (name: string, content?: string) => Promise<DbFile>

  /**
   * Update a file's content in Supabase.
   * Called by the debounced auto-save in EditorPanel.
   * Warns if content exceeds 500 KB.
   */
  updateFile: (id: string, content: string) => Promise<void>

  /**
   * Rename a persisted file: updates `name` and re-derives `language` from the
   * new extension. Local tabs that aren't persisted yet are renamed in tabStore
   * only — this is for files that already have a row.
   */
  renameFile: (id: string, name: string) => Promise<void>

  /** Soft-delete a file (sets is_deleted = true). Optimistically removes from local state. */
  deleteFile: (id: string) => Promise<void>

  /**
   * Create a public share link for a file.
   * Returns the created PublicLink row, or null if the insert fails.
   */
  createPublicLink: (
    fileId: string,
    opts?: {
      expiresAt?: string | null
      passwordHash?: string | null
      permission?: SharePermission
    },
  ) => Promise<PublicLink | null>

  /** Delete a public share link by its id. */
  revokePublicLink: (linkId: string) => Promise<void>

  /**
   * Fetch the public share link for a given file.
   * Returns null if no link exists for that file.
   */
  getPublicLink: (fileId: string) => Promise<PublicLink | null>

  /**
   * Fetch a shared file by token, optionally with a password.
   * Calls the get_shared_file() RPC — works without authentication.
   * Returns null if the token doesn't exist or is expired.
   */
  getSharedFile: (token: string, password?: string) => Promise<SharedFileResult | null>
}

export const useFileStore = create<FileStore>((set, get) => ({
  files: [],
  loading: false,
  error: null,

  async fetchFiles() {
    set({ loading: true, error: null })
    try {
      // Select metadata only — never pull `content` for the list. A large
      // workspace would otherwise drag every file body into memory on mount.
      const { data, error } = await supabase
        .from('files')
        .select('id, user_id, name, language, is_deleted, deleted_at, created_at, updated_at')
        .eq('is_deleted', false)
        .order('updated_at', { ascending: false })

      if (error) throw error

      set({ files: (data ?? []) as FileMeta[] })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load files'
      set({ error: message })
    } finally {
      set({ loading: false })
    }
  },

  async loadFileContent(id) {
    const { data, error } = await supabase
      .from('files')
      .select('content')
      .eq('id', id)
      .single()

    if (error) {
      console.error('[fileStore] loadFileContent error:', error.message)
      return null
    }
    return data?.content ?? null
  },

  async createFile(name, content = '') {
    if (content.length > SIZE_WARN_BYTES) {
      console.warn(
        `[fileStore] createFile: content size ${content.length} bytes exceeds 500 KB warning threshold`,
      )
    }

    const language = detectLanguage(name)

    // user_id is required by the DB Insert type; Supabase RLS also enforces
    // auth.uid() = user_id server-side.
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const userId = session?.user.id
    if (!userId) throw new Error('createFile: no authenticated user')

    const { data, error } = await supabase
      .from('files')
      .insert({ name, content, language, user_id: userId })
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error('createFile: no data returned from Supabase')

    const newFile = data as DbFile
    set((state) => ({ files: [newFile, ...state.files] }))
    return newFile
  },

  async updateFile(id, content) {
    if (content.length > SIZE_WARN_BYTES) {
      console.warn(
        `[fileStore] updateFile: content size ${content.length} bytes exceeds 500 KB warning threshold`,
      )
    }

    const { error } = await supabase
      .from('files')
      .update({ content })
      .eq('id', id)

    if (error) throw error
    // No local cache update: the files list holds metadata only (no content),
    // and the live editor doc is the source of truth for the open tab.
  },

  async fetchDeletedFiles() {
    // Only the recent window: files trashed within the last TRASH_VISIBLE_DAYS.
    const cutoff = new Date(Date.now() - TRASH_VISIBLE_DAYS * 24 * 60 * 60 * 1000).toISOString()
    const { data, error } = await supabase
      .from('files')
      .select('id, user_id, name, language, is_deleted, deleted_at, created_at, updated_at')
      .eq('is_deleted', true)
      .gte('deleted_at', cutoff)
      .order('deleted_at', { ascending: false })

    if (error) {
      console.error('[fileStore] fetchDeletedFiles error:', error.message)
      return []
    }
    return (data ?? []) as FileMeta[]
  },

  async countTrash() {
    // Count ALL trashed rows (no date window) — RLS scopes this to the user.
    const { count, error } = await supabase
      .from('files')
      .select('id', { count: 'exact', head: true })
      .eq('is_deleted', true)

    if (error) {
      console.error('[fileStore] countTrash error:', error.message)
      return 0
    }
    return count ?? 0
  },

  async emptyTrash() {
    // Hard-delete every trashed row of the user (visible + hidden). RLS ensures
    // only the caller's rows are affected. `.select('id')` returns the removed
    // rows so we can report the count.
    const { data, error } = await supabase
      .from('files')
      .delete()
      .eq('is_deleted', true)
      .select('id')

    if (error) throw error
    return (data ?? []).length
  },

  async restoreFile(id) {
    const { error } = await supabase
      .from('files')
      .update({ is_deleted: false, deleted_at: null })
      .eq('id', id)

    if (error) throw error
  },

  async renameFile(id, name) {
    const language = detectLanguage(name)
    const { error } = await supabase
      .from('files')
      .update({ name, language })
      .eq('id', id)

    if (error) throw error

    // Keep the metadata list in sync (name + language only — no content there).
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, name, language } : f)),
    }))
  },

  async deleteFile(id) {
    // Optimistic remove
    const previous = get().files
    set((state) => ({ files: state.files.filter((f) => f.id !== id) }))

    const { error } = await supabase
      .from('files')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      // Rollback optimistic update on failure
      set({ files: previous })
      throw error
    }
  },

  async createPublicLink(fileId, opts = {}) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const userId = session?.user.id
    if (!userId) throw new Error('createPublicLink: no authenticated user')

    const insert: {
      file_id: string
      user_id: string
      expires_at?: string | null
      password_hash?: string | null
      permission?: SharePermission
    } = { file_id: fileId, user_id: userId }

    if (opts.expiresAt !== undefined) insert.expires_at = opts.expiresAt
    if (opts.passwordHash !== undefined) insert.password_hash = opts.passwordHash
    if (opts.permission !== undefined) insert.permission = opts.permission

    const { data, error } = await supabase
      .from('public_links')
      .insert(insert)
      .select()
      .single()

    if (error) {
      console.error('[fileStore] createPublicLink error:', error.message)
      return null
    }

    return data as PublicLink
  },

  async revokePublicLink(linkId) {
    const { error } = await supabase
      .from('public_links')
      .delete()
      .eq('id', linkId)

    if (error) throw error
  },

  async getPublicLink(fileId) {
    const { data, error } = await supabase
      .from('public_links')
      .select('*')
      .eq('file_id', fileId)
      .maybeSingle()

    if (error) {
      console.error('[fileStore] getPublicLink error:', error.message)
      return null
    }

    return (data as PublicLink) ?? null
  },

  async getSharedFile(token, password) {
    const { data, error } = await supabase
      .rpc('get_shared_file', {
        p_token:    token,
        p_password: password ?? null,
      })

    if (error) {
      console.error('[fileStore] getSharedFile error:', error.message)
      return null
    }
    if (!data) return null

    if ((data as { requires_password?: boolean }).requires_password) {
      return { status: 'needs_password' as const }
    }
    if ((data as { wrong_password?: boolean }).wrong_password) {
      return { status: 'wrong_password' as const }
    }

    const { file, link } = data as { file: DbFile; link: PublicLink }
    return { status: 'ok' as const, file, link }
  },
}))
