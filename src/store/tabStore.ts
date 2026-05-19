import { create } from 'zustand'
import type { EditorState } from '@codemirror/state'
import type { Tab, DbFile } from '@/shared/types'
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

  /** Persist an EditorState snapshot for a tab (called before switching). */
  snapshotState: (tabId: string, state: EditorState) => void

  /** Retrieve the stored EditorState for a tab (returns undefined if none). */
  getEditorState: (tabId: string) => EditorState | undefined

  /** Open a local file (not yet persisted) with pre-loaded content. */
  openLocalTab: (filename: string, content: string) => void
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
}))
