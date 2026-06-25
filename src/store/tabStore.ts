import { create } from 'zustand'
import type { EditorState } from '@codemirror/state'
import type { Tab, DbFile, Language } from '@/shared/types'
import { detectLanguage } from '@/shared/utils'

const editorStateMap  = new Map<string, EditorState>()
const localContentMap = new Map<string, string>()

/** Read initial content for a local (unpersisted) tab. Used by useEditorView. */
export function getLocalContent(tabId: string): string | undefined {
  return localContentMap.get(tabId)
}

interface TabStore {
  tabs: Tab[]
  activeTabId: string | null

  /** Open a file as a tab. If already open, just activates it. */
  addTab: (file: DbFile) => void

  /** Close a tab by its ID. If it was active, activates the nearest sibling. */
  removeTab: (tabId: string) => void

  /** Set the active tab. */
  setActiveTab: (tabId: string) => void

  /** Mark a tab as dirty (unsaved changes) or clean. */
  updateTabDirty: (tabId: string, isDirty: boolean) => void

  /**
   * Bind a (previously local) tab to a persisted DB file id, keeping the same
   * tab.id so the mounted editor is not remounted. Used when an auth user's
   * local "Untitled" tab is promoted to a real file on first edit.
   */
  setTabFileId: (tabId: string, fileId: string) => void

  /**
   * Rename a tab and re-derive its language from the new extension.
   * Local only — persistence (DB or IndexedDB) is handled by the caller.
   */
  renameTab: (tabId: string, filename: string) => void

  /** Update the detected language of a tab (e.g. after paste detection). */
  updateTabLanguage: (tabId: string, language: Language) => void

  /** Persist an EditorState snapshot for a tab (called before switching). */
  snapshotState: (tabId: string, state: EditorState) => void

  /** Retrieve the stored EditorState for a tab (returns undefined if none). */
  getEditorState: (tabId: string) => EditorState | undefined

  /** Open a local file (not yet persisted) with pre-loaded content. */
  openLocalTab: (filename: string, content: string) => void

  /** Open a local tab with a caller-provided stable ID. Used for IndexedDB guest hydration. */
  openGuestTab: (id: string, filename: string, content: string) => void

  /**
   * Open a persisted DB file as a tab (tab.id === fileId), seeding its content
   * for the editor. Idempotent: re-activates an already-open tab instead of
   * duplicating. Used to restore the auth user's session on reload.
   */
  openPersistedFile: (id: string, filename: string, content: string) => void

  /**
   * Add a persisted DB file as a tab WITHOUT loading its content (lazy).
   * Used to list all of the user's Supabase files as tabs on login — content
   * is fetched on first activation. Does not change the active tab. Idempotent.
   */
  addPersistedMeta: (id: string, filename: string) => void
}

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [],
  activeTabId: null,

  addTab(file) {
    const existing = get().tabs.find((t) => t.id === file.id)
    if (existing) {
      set({ activeTabId: file.id })
      return
    }

    const newTab: Tab = {
      id: file.id,
      fileId: file.id,
      filename: file.name,
      language: detectLanguage(file.name),
      isDirty: false,
    }

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: file.id,
    }))
  },

  removeTab(tabId) {
    set((state) => {
      const idx = state.tabs.findIndex((t) => t.id === tabId)
      if (idx === -1) return state

      const nextTabs = state.tabs.filter((t) => t.id !== tabId)
      editorStateMap.delete(tabId)

      let nextActiveId = state.activeTabId
      if (state.activeTabId === tabId) {
        // Prefer the tab to the right, fall back to the left, then null
        const sibling = nextTabs[idx] ?? nextTabs[idx - 1] ?? null
        nextActiveId = sibling?.id ?? null
      }

      return { tabs: nextTabs, activeTabId: nextActiveId }
    })
  },

  setActiveTab(tabId) {
    set({ activeTabId: tabId })
  },

  updateTabDirty(tabId, isDirty) {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, isDirty } : t)),
    }))
  },

  setTabFileId(tabId, fileId) {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, fileId } : t)),
    }))
  },

  renameTab(tabId, filename) {
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId ? { ...t, filename, language: detectLanguage(filename) } : t,
      ),
    }))
  },

  updateTabLanguage(tabId, language) {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, language } : t)),
    }))
  },

  snapshotState(tabId, state) {
    editorStateMap.set(tabId, state)
  },

  getEditorState(tabId) {
    return editorStateMap.get(tabId)
  },

  openLocalTab(filename, content) {
    const id = crypto.randomUUID()
    localContentMap.set(id, content)
    const newTab: Tab = {
      id,
      fileId: null,
      filename,
      language: detectLanguage(filename),
      isDirty: false,
    }
    set((state) => ({ tabs: [...state.tabs, newTab], activeTabId: id }))
  },

  openGuestTab(id, filename, content) {
    // Always refresh content maps — IDB is source of truth on re-hydration.
    // Clearing editorStateMap forces the editor to rebuild from localContentMap
    // instead of using a stale CM6 snapshot from a previous session.
    localContentMap.set(id, content)
    editorStateMap.delete(id)

    if (get().tabs.some((t) => t.id === id)) return

    const newTab: Tab = {
      id,
      fileId: null,
      filename,
      language: detectLanguage(filename),
      isDirty: false,
    }
    set((state) => ({ tabs: [...state.tabs, newTab], activeTabId: id }))
  },

  openPersistedFile(id, filename, content) {
    // Seed content and clear any stale CM6 snapshot so the editor rebuilds from
    // the freshly fetched DB content.
    localContentMap.set(id, content)
    editorStateMap.delete(id)

    if (get().tabs.some((t) => t.id === id)) {
      set({ activeTabId: id })
      return
    }

    const newTab: Tab = {
      id,
      fileId: id, // tab.id === fileId for persisted files
      filename,
      language: detectLanguage(filename),
      isDirty: false,
    }
    set((state) => ({ tabs: [...state.tabs, newTab], activeTabId: id }))
  },

  addPersistedMeta(id, filename) {
    if (get().tabs.some((t) => t.id === id)) return

    const newTab: Tab = {
      id,
      fileId: id, // tab.id === fileId for persisted files
      filename,
      language: detectLanguage(filename),
      isDirty: false,
    }
    // No activeTabId change and no localContentMap seed — getLocalContent stays
    // undefined, which is the "content not loaded yet" marker for lazy loading.
    set((state) => ({ tabs: [...state.tabs, newTab] }))
  },
}))
