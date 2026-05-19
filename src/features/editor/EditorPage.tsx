import { useEffect } from 'react'
import { useTabStore } from '@/store/tabStore'
import { useThemeStore } from '@/store/themeStore'
import { useFileStore } from '@/store/fileStore'
import { useUIStore } from '@/store/uiStore'
import { generateId } from '@/shared/utils'
import type { Tab } from '@/shared/types'
import TabBar from './TabBar'
import { MenuStrip } from './MenuStrip'
import { EditorHeader } from './EditorHeader'
import { RightPanel } from './RightPanel'
import { StatusBar } from './StatusBar'
import EditorPanel from './EditorPanel'

/**
 * Root editor page — V3 layout orchestrator.
 *
 * Layout (flex column, 100% height):
 *   ┌─────────────────────────────────────┐  30px
 *   │ TabBar                              │
 *   ├─────────────────────────────────────┤  28px
 *   │ MenuStrip                           │
 *   ├─────────────────────────────────────┤  30px  ┐
 *   │ EditorHeader                        │        │
 *   ├───────────────────────┬─────────────┤  flex-1│ dimmed when menu open
 *   │ EditorPanel (flex-1)  │ RightPanel  │        │
 *   ├───────────────────────┴─────────────┤  22px  │
 *   │ StatusBar                           │        ┘
 *   └─────────────────────────────────────┘
 */

// ── Panel eligibility ──────────────────────────────────────────────────────────

/** Languages that expose a right panel (JSON tree or Markdown preview). */
function languageHasPanel(language: string): boolean {
  return language === 'json' || language === 'markdown'
}

/** Map language → panel type. */
function panelTypeForLanguage(language: string): 'tree' | 'preview' {
  return language === 'json' ? 'tree' : 'preview'
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function EditorPage() {
  // ── Tab store ──────────────────────────────────────────────────────────────
  const tabs         = useTabStore((s) => s.tabs)
  const activeTabId  = useTabStore((s) => s.activeTabId)
  const addTabRaw    = useTabStore((s) => s.addTab)
  const removeTab    = useTabStore((s) => s.removeTab)
  const setActiveTab = useTabStore((s) => s.setActiveTab)
  const getEditorState = useTabStore((s) => s.getEditorState)

  // ── UI store ───────────────────────────────────────────────────────────────
  const openMenuId      = useUIStore((s) => s.openMenuId)
  const rightPanel      = useUIStore((s) => s.rightPanel)
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel)
  const setRightPanel   = useUIStore((s) => s.setRightPanel)

  // ── Theme store ────────────────────────────────────────────────────────────
  const effectiveTheme = useThemeStore((s) => s.effectiveTheme)
  const isDark = effectiveTheme() === 'dark'

  // ── File store ─────────────────────────────────────────────────────────────
  const fetchFiles   = useFileStore((s) => s.fetchFiles)
  const createFile   = useFileStore((s) => s.createFile)

  // ── Fetch files on mount ───────────────────────────────────────────────────
  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  // ── Ensure at least one tab exists on mount ────────────────────────────────
  useEffect(() => {
    if (tabs.length === 0) {
      createDefaultTab()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Tab helpers ────────────────────────────────────────────────────────────

  function createDefaultTab() {
    const id = generateId()
    const untitledFile = {
      id,
      name: 'Untitled',
      content: '',
      language: 'text' as const,
      user_id: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false,
    }
    addTabRaw(untitledFile)
  }

  function handleNewTab() {
    createDefaultTab()
  }

  function handleSelectTab(id: string) {
    setActiveTab(id)
  }

  function handleCloseTab(id: string) {
    removeTab(id)
  }

  function handleOpenLocalFile(filename: string, content: string) {
    useTabStore.getState().openLocalTab(filename, content)
  }

  async function handleNewFileFromArchivo() {
    try {
      const file = await createFile('Untitled.txt', '')
      addTabRaw(file)
    } catch {
      // Fallback: open an unsaved tab when offline / unauthenticated
      createDefaultTab()
    }
  }

  // ── Active tab derivations ─────────────────────────────────────────────────
  const activeTab: Tab | undefined = tabs.find((t) => t.id === activeTabId)

  const language   = activeTab?.language ?? 'text'
  const filename   = activeTab?.filename ?? 'Untitled'
  const hasPanel   = languageHasPanel(language)

  // Close the right panel when switching to a language that doesn't support it
  useEffect(() => {
    if (!hasPanel && rightPanel !== null) {
      setRightPanel(null)
    }
  }, [hasPanel, rightPanel, setRightPanel])

  // RightPanel is shown only when a panel is selected AND the language supports it
  const showRightPanel = rightPanel !== null && hasPanel

  // ── Editor content for StatusBar + RightPanel ──────────────────────────────
  const editorContent =
    activeTabId != null
      ? (getEditorState(activeTabId)?.doc.toString() ?? '')
      : ''

  // ── Dim styles ─────────────────────────────────────────────────────────────
  // Only the area below MenuStrip is dimmed when a menu is open
  const isDimmed = openMenuId !== null

  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        height:         '100vh',
        overflow:       'hidden',
        background:     'var(--bg)',
        color:          'var(--ink)',
      }}
    >
      {/* ── TabBar — never dimmed ── */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
      />

      {/* ── MenuStrip — never dimmed ── */}
      <MenuStrip
        saveStatus="saved"
        activeTabId={activeTabId}
        onNewTab={handleNewFileFromArchivo}
        onOpenFile={handleOpenLocalFile}
        onRenameTab={() => { /* TODO: rename flow */ }}
        onDeleteTab={() => { if (activeTabId) handleCloseTab(activeTabId) }}
        onFormat={() => { /* TODO: CM6 format */ }}
        onMinify={() => { /* TODO: CM6 minify */ }}
        fileId={activeTab?.fileId ?? null}
      />

      {/* ── Area below MenuStrip — dims when a menu is open ── */}
      <div
        style={{
          display:    'flex',
          flexDirection: 'column',
          flex:       1,
          overflow:   'hidden',
          opacity:    isDimmed ? 0.55 : 1,
          transition: 'opacity 180ms',
          pointerEvents: isDimmed ? 'none' : undefined,
        }}
      >
        {/* Editor body: EditorPanel + optional RightPanel */}
        <div
          style={{
            display:  'flex',
            flex:     1,
            overflow: 'hidden',
          }}
        >
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {activeTabId !== null && (
              <EditorPanel
                tabId={activeTabId}
                fileId={activeTab?.fileId ?? null}
                language={language}
                isDark={isDark}
              />
            )}
          </div>

          {showRightPanel && (
            <RightPanel
              type={panelTypeForLanguage(language)}
              content={editorContent}
              onClose={() => setRightPanel(null)}
            />
          )}
        </div>

        {/* StatusBar */}
        <StatusBar
          language={language}
          content={editorContent}
          cursorLine={1}
          cursorCol={1}
          saveStatus="saved"
          lastSavedAt={Date.now()}
        />
      </div>
    </div>
  )
}
