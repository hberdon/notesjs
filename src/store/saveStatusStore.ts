import { create } from 'zustand'

/**
 * Central save-status channel for the active editor.
 *
 * The auto-save flow lives in `useEditorView` (debounced writes to Supabase /
 * IndexedDB). This store is the single source of truth the chrome reads from:
 * `StatusBar` subscribes directly (leaf) so a save tick doesn't re-render
 * EditorPage or the editor body.
 *
 * Lifecycle:
 *   keystroke      → setSaving()  (a change is pending / in-flight)
 *   write resolves → setSaved()   (status + lastSavedAt updated)
 */
export type SaveStatus = 'idle' | 'saving' | 'saved'

interface SaveStatusState {
  status: SaveStatus
  lastSavedAt: number | null
  setSaving: () => void
  setSaved: () => void
  reset: () => void
}

export const useSaveStatusStore = create<SaveStatusState>((set) => ({
  status: 'idle',
  lastSavedAt: null,
  setSaving: () => set((s) => (s.status === 'saving' ? s : { ...s, status: 'saving' })),
  setSaved: () => set({ status: 'saved', lastSavedAt: Date.now() }),
  reset: () => set({ status: 'idle', lastSavedAt: null }),
}))
