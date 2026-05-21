import { useEffect, useRef, useState } from 'react'
import { useTabStore, getLocalContent } from '@/store/tabStore'
import { useThemeStore, getEffectiveTheme } from '@/store/themeStore'
import { useFileStore } from '@/store/fileStore'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/features/auth/authStore'
import { generateId } from '@/shared/utils'
import { loadGuestTabs, saveGuestTab, deleteGuestTab } from '@/lib/guestDb'
import type { Tab } from '@/shared/types'
import TabBar from './TabBar'
import { MenuStrip } from './MenuStrip'
import { EditorHeader } from './EditorHeader'
import { RightPanel } from './RightPanel'
import { StatusBar } from './StatusBar'
import EditorPanel from './EditorPanel'
import LiteBar from './LiteBar'

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
  // ── Auth store ─────────────────────────────────────────────────────────────
  const isGuest = useAuthStore((s) => s.isGuest)

  // ── Tab store ──────────────────────────────────────────────────────────────
  const tabs           = useTabStore((s) => s.tabs)
  const activeTabId    = useTabStore((s) => s.activeTabId)
  const addTabRaw      = useTabStore((s) => s.addTab)
  const removeTab      = useTabStore((s) => s.removeTab)
  const setActiveTab   = useTabStore((s) => s.setActiveTab)
  const getEditorState = useTabStore((s) => s.getEditorState)
  const openGuestTab   = useTabStore((s) => s.openGuestTab)

  // Storage usage indicator for LiteBar
  const [usedBytes, setUsedBytes] = useState(0)

  // ── UI store ───────────────────────────────────────────────────────────────
  const openMenuId      = useUIStore((s) => s.openMenuId)
  const closeMenu       = useUIStore((s) => s.closeMenu)
  const rightPanel      = useUIStore((s) => s.rightPanel)
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel)
  const setRightPanel   = useUIStore((s) => s.setRightPanel)

  // ── Theme store ────────────────────────────────────────────────────────────
  const theme  = useThemeStore((s) => s.theme)
  const isDark = getEffectiveTheme(theme) === 'dark'

  // ── File store ─────────────────────────────────────────────────────────────
  const fetchFiles   = useFileStore((s) => s.fetchFiles)
  const createFile   = useFileStore((s) => s.createFile)

  // ── Fetch files on mount (auth only) ──────────────────────────────────────
  useEffect(() => {
    if (!isGuest) fetchFiles()
  }, [fetchFiles, isGuest])

  // ── Hydrate guest tabs from IndexedDB ──────────────────────────────────────
  // Guard against React Strict Mode double-invocation: before opening any tab,
  // check if it's already in the store (happens when the effect re-fires without
  // an unmount clearing the Zustand state).
  useEffect(() => {
    if (!isGuest) return
    async function hydrate() {
      const records = await loadGuestTabs()

      if (records.length === 0) {
        // First guest entry — only create welcome.js if no tab exists yet
        if (useTabStore.getState().tabs.length > 0) return
        const id      = crypto.randomUUID()
        const welcome = [
          '// Welcome to notes.js!',
          '// A lightweight code editor that lives in your browser.',
          '//',
          '// Your files are saved automatically — no account needed.',
          '// Sign in to sync across devices and unlock more features.',
          '',
          'function greet(name) {',
          "  console.log(`Welcome to notes.js, ${name}!`);",
          '}',
          '',
          "greet('world');",
        ].join('\n')
        openGuestTab(id, 'welcome.js', welcome)
        await saveGuestTab(id, 'welcome.js', welcome).catch(console.error)
        setUsedBytes(new TextEncoder().encode(welcome).length)
        return
      }

      // Restore tabs — openGuestTab is idempotent: always refreshes localContentMap
      // from IDB (source of truth), and only adds to the store if not already open.
      let total = 0
      for (const rec of records) {
        openGuestTab(rec.id, rec.filename, rec.content)
        total += new TextEncoder().encode(rec.content).length
      }
      setUsedBytes(total)
    }
    hydrate().catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuest])

  // ── Ensure at least one tab exists on mount — auth mode only ──────────────
  // Guest mode is handled by the hydration effect below.
  useEffect(() => {
    if (isGuest) return
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

  async function handleCloseTab(id: string) {
    removeTab(id)
    if (isGuest) {
      await deleteGuestTab(id).catch(console.error)
      const records = await loadGuestTabs()
      setUsedBytes(
        records.reduce((sum, r) => sum + new TextEncoder().encode(r.content).length, 0),
      )
    }
  }

  function handleDownloadActive() {
    if (!activeTabId) return
    const content =
      getEditorState(activeTabId)?.doc.toString() ??
      getLocalContent(activeTabId) ??
      ''
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleGuestSave(tabId: string, content: string) {
    try {
      const tab = tabs.find((t) => t.id === tabId)
      if (!tab) return
      await saveGuestTab(tabId, tab.filename, content)
      const records = await loadGuestTabs()
      setUsedBytes(
        records.reduce((sum, r) => sum + new TextEncoder().encode(r.content).length, 0),
      )
    } catch (err) {
      console.error('[EditorPage] guest save failed:', err)
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const FILE_ACCEPT = [
    '.txt','.md','.mdx',
    '.js','.jsx','.mjs','.cjs',
    '.ts','.tsx',
    '.py','.pyw',
    '.html','.htm',
    '.css','.scss','.sass','.less',
    '.json','.jsonc',
    '.java','.rs',
    '.xml','.yaml','.yml',
    '.sh','.bash','.zsh',
    '.sql','.csv',
  ].join(',')

  function handleTriggerOpenFile() {
    closeMenu()
    fileInputRef.current?.click()
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      useTabStore.getState().openLocalTab(file.name, reader.result as string)
    }
    reader.readAsText(file, 'utf-8')
    e.target.value = ''
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
      {/* Persistent file picker — survives menu unmounts */}
      <input
        ref={fileInputRef}
        type="file"
        accept={FILE_ACCEPT}
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />
      {/* ── TabBar — never dimmed ── */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
        isGuest={isGuest}
      />

      {/* ── Menu bar row — LiteBar for guests, MenuStrip for auth ── */}
      {isGuest ? (
        <LiteBar
          activeTabId={activeTabId}
          activeFilename={filename}
          onNewTab={handleNewTab}
          onOpenFile={handleTriggerOpenFile}
          onFormat={() => { /* TODO: CM6 format */ }}
          usedBytes={usedBytes}
        />
      ) : (
        <MenuStrip
          saveStatus="saved"
          activeTabId={activeTabId}
          onNewTab={handleNewFileFromArchivo}
          onOpenFile={handleTriggerOpenFile}
          onRenameTab={() => { /* TODO: rename flow */ }}
          onDeleteTab={() => { if (activeTabId) handleCloseTab(activeTabId) }}
          onFormat={() => { /* TODO: CM6 format */ }}
          onMinify={() => { /* TODO: CM6 minify */ }}
          fileId={activeTab?.fileId ?? null}
        />
      )}

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
                onGuestSave={isGuest ? handleGuestSave : undefined}
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
