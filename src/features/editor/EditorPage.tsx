import { useCallback, useEffect, useRef, useState } from 'react'
import { useTabStore, getLocalContent } from '@/store/tabStore'
import { useThemeStore, getEffectiveTheme } from '@/store/themeStore'
import { useFileStore } from '@/store/fileStore'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/features/auth/authStore'
import { formatCode } from '@/lib/formatter'
import { getActiveEditorView } from './useEditorView'
import { loadGuestTabs, saveGuestTab, deleteGuestTab } from '@/lib/guestDb'
import type { Tab, FileMeta } from '@/shared/types'
import { DeletedFilesModal } from './DeletedFilesModal'
import TabBar from './TabBar'
import { MenuStrip } from './MenuStrip'
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
 *   ├─────────────────────────────────────┤  28px  ┐
 *   │ MenuStrip (+ panel toggle, right)   │        │
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
  const openGuestTab   = useTabStore((s) => s.openGuestTab)
  const setTabFileId   = useTabStore((s) => s.setTabFileId)
  const renameTab      = useTabStore((s) => s.renameTab)
  const openPersistedFile = useTabStore((s) => s.openPersistedFile)
  const addPersistedMeta  = useTabStore((s) => s.addPersistedMeta)

  // Storage usage indicator for LiteBar
  const [usedBytes, setUsedBytes] = useState(0)

  // Gate that prevents EditorPanel from mounting before guest hydration completes.
  // If EditorPanel mounts first, useEditorView creates a CM6 view with stale
  // localContentMap content before the hydration effect can refresh it from IDB.
  // Auth users are always ready; guests wait for the hydration effect to finish.
  const [hydratedGuest, setHydratedGuest] = useState(!isGuest)

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
  const createFile   = useFileStore((s) => s.createFile)
  const updateFile   = useFileStore((s) => s.updateFile)
  const renameFile   = useFileStore((s) => s.renameFile)
  const loadFileContent = useFileStore((s) => s.loadFileContent)
  const fetchFiles   = useFileStore((s) => s.fetchFiles)
  const restoreFile  = useFileStore((s) => s.restoreFile)
  const deleteFile   = useFileStore((s) => s.deleteFile)

  // Trash (deleted files) modal — opened on demand from Archivo → Papelera.
  const [trashOpen, setTrashOpen] = useState(false)


  // Id of the tab being renamed inline (driven from TabBar double-click or the
  // Archivo → Renombrar menu action).
  const [renamingTabId, setRenamingTabId] = useState<string | null>(null)

  // Tracks tabs mid-promotion so concurrent debounced saves don't create
  // duplicate DB files during the async createFile window.
  const promotingRef = useRef<Set<string>>(new Set())

  // ── Hydrate guest tabs from IndexedDB ──────────────────────────────────────
  // Guard against React Strict Mode double-invocation: before opening any tab,
  // check if it's already in the store (happens when the effect re-fires without
  // an unmount clearing the Zustand state).
  useEffect(() => {
    if (!isGuest) {
      setHydratedGuest(true)
      return
    }
    // Block EditorPanel from mounting until localContentMap is refreshed from IDB.
    setHydratedGuest(false)
    async function hydrate() {
      const records = await loadGuestTabs()

      if (records.length === 0) {
        // First guest entry — only create welcome.js if no tab exists yet
        if (useTabStore.getState().tabs.length > 0) {
          setHydratedGuest(true)
          return
        }
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
        setHydratedGuest(true)
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
      setHydratedGuest(true)
    }
    hydrate().catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuest])

  // ── Load all of the user's Supabase files as tabs on mount ─────────────────
  // Guest mode is handled by the IndexedDB hydration effect above. Every
  // non-deleted file the user owns is opened as a tab (Notepad++ style); content
  // is fetched lazily on first activation. The most-recently-updated file is
  // activated and its content loaded eagerly so the editor mounts ready.
  // Source of truth is Supabase — NOT localStorage — so files are reachable from
  // any device or origin. Falls back to a blank tab when the user has no files.
  useEffect(() => {
    if (isGuest) return
    let cancelled = false

    async function loadFiles() {
      const metas = await fetchFiles()
      if (cancelled) return

      for (const meta of metas) addPersistedMeta(meta.id, meta.name)

      // Eagerly load + activate the most recent file (metas are newest-first) so
      // the editor mounts with real content instead of an empty doc.
      const active = metas[0]
      if (active) {
        const content = await loadFileContent(active.id)
        if (cancelled) return
        openPersistedFile(active.id, active.name, content ?? '')
      }

      if (useTabStore.getState().tabs.length === 0) {
        createDefaultTab()
      }
    }

    loadFiles()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Tab helpers ────────────────────────────────────────────────────────────

  function createDefaultTab() {
    // Unpersisted local tab (fileId: null). On first edit it is promoted:
    // guests → IndexedDB (handleGuestSave), authed users → a real DB file
    // (handleAuthLocalSave). Previously this used a fake file id, so auto-save
    // ran UPDATE against a non-existent row and silently lost the content.
    useTabStore.getState().openLocalTab('Untitled', '')
  }

  function handleNewTab() {
    createDefaultTab()
  }

  async function handleSelectTab(id: string) {
    // Lazy content load: tabs added via addPersistedMeta have no content yet
    // (getLocalContent === undefined). Fetch on first activation, then seed +
    // activate. Already-loaded tabs (incl. empty files, content '') just switch.
    if (getLocalContent(id) === undefined) {
      const tab = useTabStore.getState().tabs.find((t) => t.id === id)
      const content = await loadFileContent(id)
      openPersistedFile(id, tab?.filename ?? 'file', content ?? '')
    } else {
      setActiveTab(id)
    }
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

  // Promote an unpersisted auth tab to a real DB file on first edit. Keeps the
  // same tab.id so the editor never remounts; the fileId swap flows back through
  // props → useEditorView's fileIdRef, so later saves go straight to updateFile.
  async function handleAuthLocalSave(tabId: string, content: string) {
    if (promotingRef.current.has(tabId)) return
    promotingRef.current.add(tabId)
    try {
      const tab = useTabStore.getState().tabs.find((t) => t.id === tabId)
      if (!tab || tab.fileId !== null) return
      const file = await createFile(tab.filename || 'Untitled.txt', content)
      setTabFileId(tabId, file.id)

      // Recover keystrokes typed during the async create window — those debounced
      // saves were skipped by the guard. Only the active tab's live view is readable.
      if (useTabStore.getState().activeTabId === tabId) {
        const latest = getActiveEditorView()?.state.doc.toString()
        if (latest != null && latest !== content) {
          await updateFile(file.id, latest)
        }
      }
    } catch (err) {
      console.error('[EditorPage] auth local save (promotion) failed:', err)
    } finally {
      promotingRef.current.delete(tabId)
    }
  }

  // Rename a tab: update locally (filename + language), then persist where the
  // content lives — DB for promoted files, IndexedDB for guests. Naming a tab is
  // a clear intent to keep it, so an unpromoted auth tab is promoted to a real
  // file on rename (not only on first edit) — otherwise it has no DB row and
  // can't be trashed/restored or survive a reload.
  async function handleRename(tabId: string, filename: string) {
    setRenamingTabId(null)
    const tab = useTabStore.getState().tabs.find((t) => t.id === tabId)
    if (!tab) return
    renameTab(tabId, filename)

    function currentContent(): string {
      const view = getActiveEditorView()
      return useTabStore.getState().activeTabId === tabId && view
        ? view.state.doc.toString()
        : getLocalContent(tabId) ?? ''
    }

    try {
      if (tab.fileId) {
        await renameFile(tab.fileId, filename)
      } else if (isGuest) {
        await saveGuestTab(tabId, filename, currentContent())
      } else if (!promotingRef.current.has(tabId)) {
        // Auth, unpromoted → create the file now under the new name.
        promotingRef.current.add(tabId)
        try {
          const file = await createFile(filename, currentContent())
          setTabFileId(tabId, file.id)
        } finally {
          promotingRef.current.delete(tabId)
        }
      }
    } catch (err) {
      console.error('[EditorPage] rename failed:', err)
    }
  }

  // Move the active file to the trash: soft-delete the DB row (recoverable via
  // the Papelera modal) and close its tab. Distinct from closing a tab, which
  // leaves the file untouched. Guests have no server trash — their delete is
  // a permanent IndexedDB removal.
  async function handleMoveToTrash(tabId: string) {
    const tab = useTabStore.getState().tabs.find((t) => t.id === tabId)
    removeTab(tabId)
    if (!tab) return
    try {
      if (tab.fileId) {
        await deleteFile(tab.fileId)
      } else if (isGuest) {
        await deleteGuestTab(tabId)
        const records = await loadGuestTabs()
        setUsedBytes(
          records.reduce((sum, r) => sum + new TextEncoder().encode(r.content).length, 0),
        )
      }
    } catch (err) {
      console.error('[EditorPage] move to trash failed:', err)
    }
  }

  // Restore a soft-deleted file: clear is_deleted, then open it as a tab so the
  // result is immediately visible (consistent with "files are tabs").
  async function handleRestoreDeleted(file: FileMeta) {
    await restoreFile(file.id)
    const content = await loadFileContent(file.id)
    openPersistedFile(file.id, file.name, content ?? '')
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
  const panelType  = panelTypeForLanguage(language)

  // ── Format active document ────────────────────────────────────────────────

  const handleFormat = useCallback(async () => {
    const currentTab = useTabStore.getState().tabs.find((t) => t.id === activeTabId)
    if (!currentTab) return
    const view = getActiveEditorView()
    if (!view) return
    const raw       = view.state.doc.toString()
    const formatted = await formatCode(raw, currentTab.language)
    if (formatted === raw) return
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: formatted },
    })
  }, [activeTabId])

  // Close the right panel when switching to a language that doesn't support it
  useEffect(() => {
    if (!hasPanel && rightPanel !== null) {
      setRightPanel(null)
    }
  }, [hasPanel, rightPanel, setRightPanel])

  // RightPanel is shown only when a panel is selected AND the language supports it
  const showRightPanel = rightPanel !== null && hasPanel

  // StatusBar and RightPanel read live content from editorContentStore directly
  // (subscribed in those leaf components) so keystrokes don't re-render this page.

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
        onCloseTab={handleMoveToTrash}
        onNewTab={handleNewTab}
        isGuest={isGuest}
        renamingTabId={renamingTabId}
        onRequestRename={setRenamingTabId}
        onCommitRename={handleRename}
        onCancelRename={() => setRenamingTabId(null)}
      />

      {/* ── Menu bar row — LiteBar for guests, MenuStrip for auth ── */}
      {isGuest ? (
        <LiteBar
          activeTabId={activeTabId}
          activeFilename={filename}
          onNewTab={handleNewTab}
          onOpenFile={handleTriggerOpenFile}
          onFormat={handleFormat}
          usedBytes={usedBytes}
          hasPanel={hasPanel}
          rightPanel={rightPanel}
          panelType={panelType}
          onTogglePanel={toggleRightPanel}
        />
      ) : (
        <MenuStrip
          onNewTab={handleNewFileFromArchivo}
          onOpenFile={handleTriggerOpenFile}
          onRenameTab={() => { closeMenu(); if (activeTabId) setRenamingTabId(activeTabId) }}
          onOpenTrash={() => { closeMenu(); setTrashOpen(true) }}
          onDeleteTab={() => { if (activeTabId) handleMoveToTrash(activeTabId) }}
          onFormat={handleFormat}
          onMinify={() => { /* TODO: CM6 minify */ }}
          fileId={activeTab?.fileId ?? null}
          hasPanel={hasPanel}
          rightPanel={rightPanel}
          panelType={panelType}
          onTogglePanel={toggleRightPanel}
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
        {/* Editor body: EditorPanel + optional RightPanel.
            Panel toggle (tree/preview) lives in MenuStrip/LiteBar right region. */}
        <div
          style={{
            display:  'flex',
            flex:     1,
            overflow: 'hidden',
          }}
        >
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {activeTabId !== null && hydratedGuest && (
              <EditorPanel
                tabId={activeTabId}
                fileId={activeTab?.fileId ?? null}
                language={language}
                isDark={isDark}
                onGuestSave={isGuest ? handleGuestSave : undefined}
                onAuthLocalSave={!isGuest ? handleAuthLocalSave : undefined}
              />
            )}
          </div>

          {showRightPanel && (
            <RightPanel
              type={panelTypeForLanguage(language)}
              onClose={() => setRightPanel(null)}
            />
          )}
        </div>

        {/* StatusBar */}
        <StatusBar
          language={language}
          cursorLine={1}
          cursorCol={1}
        />
      </div>

      {/* Trash modal — on-demand, overlays everything */}
      {trashOpen && (
        <DeletedFilesModal
          onClose={() => setTrashOpen(false)}
          onRestore={handleRestoreDeleted}
        />
      )}
    </div>
  )
}
