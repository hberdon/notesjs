import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { DbFile, PublicLink, SharePermission } from '@/shared/types'
import { detectLanguage } from '@/shared/utils'

export type PublicFileResult = { link: PublicLink; file: DbFile }

const SIZE_WARN_BYTES = 512_000 // 500 KB

interface FileStore {
  files: DbFile[]
  loading: boolean
  error: string | null

  /** Load all non-deleted files for the current user, ordered by updated_at DESC. */
  fetchFiles: () => Promise<void>

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
   * Fetch a public link + its file by token.
   * Works without authentication — used by SharedFilePage.
   * Returns null if the token doesn't exist or the link is expired (RLS filters it).
   */
  getPublicFile: (token: string) => Promise<PublicFileResult | null>
}

export const useFileStore = create<FileStore>((set, get) => ({
  files: [],
  loading: false,
  error: null,

  async fetchFiles() {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('is_deleted', false)
        .order('updated_at', { ascending: false })

      if (error) throw error

      set({ files: (data ?? []) as DbFile[] })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load files'
      set({ error: message })
    } finally {
      set({ loading: false })
    }
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

    // Update local cache with new content
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, content } : f)),
    }))
  },

  async deleteFile(id) {
    // Optimistic remove
    const previous = get().files
    set((state) => ({ files: state.files.filter((f) => f.id !== id) }))

    const { error } = await supabase
      .from('files')
      .update({ is_deleted: true })
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

  async getPublicFile(token) {
    const { data, error } = await supabase
      .from('public_links')
      .select('*, files(*)')
      .eq('token', token)
      .maybeSingle()

    if (error) {
      console.error('[fileStore] getPublicFile error:', error.message)
      return null
    }
    if (!data) return null

    const { files: fileData, ...linkFields } = data as PublicLink & { files: DbFile }
    return { link: linkFields as PublicLink, file: fileData }
  },
}))
