import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type MenuId = 'archivo' | 'editar' | 'buscar' | 'compartir' | 'ver' | 'ayuda'
type RightPanelType = 'tree' | 'preview'

interface EditorSettings {
  showLineNumbers: boolean
  wrap: boolean
  fontSize: number // 10..24, default 14
}

interface UIState {
  openMenuId: MenuId | null
  rightPanel: RightPanelType | null
  editorSettings: EditorSettings
  // actions
  setOpenMenu: (id: MenuId | null) => void
  closeMenu: () => void
  toggleMenu: (id: MenuId) => void
  setRightPanel: (panel: RightPanelType | null) => void
  toggleRightPanel: (panel: RightPanelType) => void
  updateEditorSettings: (partial: Partial<EditorSettings>) => void
}

const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  showLineNumbers: true,
  wrap: true,
  fontSize: 14,
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      openMenuId: null,
      rightPanel: null,
      editorSettings: DEFAULT_EDITOR_SETTINGS,

      setOpenMenu(id) {
        set({ openMenuId: id })
      },

      closeMenu() {
        set({ openMenuId: null })
      },

      toggleMenu(id) {
        set((state) => ({
          openMenuId: state.openMenuId === id ? null : id,
        }))
      },

      setRightPanel(panel) {
        set({ rightPanel: panel })
      },

      toggleRightPanel(panel) {
        set((state) => ({
          rightPanel: state.rightPanel === panel ? null : panel,
        }))
      },

      updateEditorSettings(partial) {
        set((state) => ({
          editorSettings: { ...state.editorSettings, ...partial },
        }))
      },
    }),
    {
      name: 'notesjs-ui',
      // Only persist editorSettings — openMenuId and rightPanel reset each session
      partialize: (state) => ({ editorSettings: state.editorSettings }),
    },
  ),
)
