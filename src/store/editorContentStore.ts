import { create } from 'zustand'

/**
 * Live content of the active editor tab.
 *
 * CodeMirror's EditorState snapshots in tabStore only update on tab switch /
 * unmount, so anything that reads from them (StatusBar counts, RightPanel
 * JSON tree / Markdown preview) goes stale while the user types.
 *
 * This store is the reactive channel: `useEditorView` pushes the current doc
 * on every change, and the leaf consumers subscribe directly — keeping the
 * keystroke-frequency re-render out of EditorPage and the editor chrome.
 */
interface EditorContentState {
  content: string
  setContent: (content: string) => void
}

export const useEditorContentStore = create<EditorContentState>((set) => ({
  content: '',
  setContent: (content) => set({ content }),
}))
