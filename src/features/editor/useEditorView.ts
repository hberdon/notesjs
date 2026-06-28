import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { EditorState, Compartment } from '@codemirror/state'
import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { buildExtensions } from '@/lib/codemirror/extensions'
import { useTabStore, getLocalContent } from '@/store/tabStore'
import { useFileStore } from '@/store/fileStore'
import { useUIStore } from '@/store/uiStore'
import { useEditorContentStore } from '@/store/editorContentStore'
import { useSaveStatusStore } from '@/store/saveStatusStore'
import { detectLanguage, detectContentLanguage } from '@/shared/utils'
import { formatCode } from '@/lib/formatter'

/** Debounce delay (ms) before an auto-save fires after the last keystroke. */
const DEBOUNCE_MS = 2000

// Module-level singleton — always points to the currently mounted EditorView.
let _activeView: EditorView | null = null

/** Returns the live EditorView instance, or null if no editor is mounted. */
export function getActiveEditorView(): EditorView | null {
  return _activeView
}

/**
 * Manages a single CodeMirror 6 `EditorView` bound to the given container.
 *
 * Extension architecture:
 *   EditorState.create({ extensions: [compartment.of(buildExtensions(...)), autoSaveListener] })
 *
 * Both autoSaveListener and buildExtensions live in the STATE (not view-level).
 * buildExtensions is wrapped in a Compartment so it can be reconfigured for
 * theme/language changes without touching autoSaveListener.
 *
 * NOTE: EditorView({ state, extensions }) ignores `extensions` when `state` is
 * provided — so extensions MUST be in the state itself.
 */
export function useEditorView(
  containerRef: RefObject<HTMLDivElement | null>,
  tabId: string | null,
  fileId: string | null,
  language: string,
  isDark: boolean,
  onGuestSave?: (tabId: string, content: string) => void,
  onAuthLocalSave?: (tabId: string, content: string) => void,
) {
  // ── Stable refs ───────────────────────────────────────────────────────────

  const viewRef = useRef<EditorView | null>(null)
  const prevTabIdRef = useRef<string | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fontSize        = useUIStore((s) => s.editorSettings.fontSize)
  const showLineNumbers = useUIStore((s) => s.editorSettings.showLineNumbers)

  // Keep latest values accessible inside the mount-effect closure (deps=[])
  // without triggering a full view remount.
  const tabIdRef = useRef(tabId)
  useEffect(() => { tabIdRef.current = tabId }, [tabId])

  const fontSizeRef = useRef(fontSize)
  useEffect(() => { fontSizeRef.current = fontSize }, [fontSize])

  const showLineNumbersRef = useRef(showLineNumbers)
  useEffect(() => { showLineNumbersRef.current = showLineNumbers }, [showLineNumbers])

  const onGuestSaveRef = useRef(onGuestSave)
  useEffect(() => { onGuestSaveRef.current = onGuestSave }, [onGuestSave])

  const onAuthLocalSaveRef = useRef(onAuthLocalSave)
  useEffect(() => { onAuthLocalSaveRef.current = onAuthLocalSave }, [onAuthLocalSave])

  // fileId is captured once in the mount effect (deps=[]); keep a live ref so the
  // auto-save listener sees the CURRENT id — critical after a local tab is
  // promoted to a real file (null → uuid) without remounting the editor.
  const fileIdRef = useRef(fileId)
  useEffect(() => { fileIdRef.current = fileId }, [fileId])

  // The autoSaveListener and pasteDetector are created once in the mount effect
  // and stored here so the tab-switch effect can include them in fresh states.
  const autoSaveListenerRef   = useRef<Extension | null>(null)
  const pasteDetectorRef      = useRef<Extension | null>(null)
  const contentDetectRef      = useRef<Extension | null>(null)
  const liveContentRef        = useRef<Extension | null>(null)
  const detectTimerRef        = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Compartment for theme/language — targeted reconfiguration that leaves
  // autoSaveListener untouched.
  const compartmentRef = useRef(new Compartment())

  // ── Store accessors ───────────────────────────────────────────────────────

  const snapshotState = useTabStore((s) => s.snapshotState)
  const getEditorState = useTabStore((s) => s.getEditorState)
  const updateFile = useFileStore((s) => s.updateFile)

  // ── Mount / unmount ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!containerRef.current || !tabId) return

    const compartment = compartmentRef.current

    // autoSaveListener MUST be in the EditorState extensions, not in the
    // EditorView constructor's `extensions` option. CM6 ignores the view-level
    // `extensions` when a `state` is provided — the listener would never fire.
    const autoSaveListener = EditorView.updateListener.of((update) => {
      if (!update.docChanged) return

      if (saveTimerRef.current !== null) {
        clearTimeout(saveTimerRef.current)
      }

      // Read the CURRENT fileId, not the one captured at mount — it may have
      // changed from null to a real id after a lazy promotion.
      const currentFileId = fileIdRef.current
      const tabId = tabIdRef.current

      if (currentFileId === null) {
        // Unpersisted tab. Guests save to IndexedDB; authed users get the tab
        // promoted to a real DB file on first edit (onAuthLocalSave).
        const localSave = onGuestSaveRef.current ?? onAuthLocalSaveRef.current
        if (localSave && tabId) {
          saveTimerRef.current = setTimeout(() => {
            // Spinner shows only once the debounce elapses and the write actually
            // starts (Word-like), not on every keystroke.
            useSaveStatusStore.getState().setSaving()
            // localSave is typed void but the impls return a Promise — wrap so we
            // mark "saved" only once the write actually resolves.
            Promise.resolve(localSave(tabId, update.state.doc.toString()))
              .then(() => useSaveStatusStore.getState().setSaved())
              .catch((err) => console.error('[useEditorView] local auto-save failed:', err))
          }, DEBOUNCE_MS)
        }
        return
      }

      saveTimerRef.current = setTimeout(() => {
        useSaveStatusStore.getState().setSaving()
        updateFile(currentFileId, update.state.doc.toString())
          .then(() => useSaveStatusStore.getState().setSaved())
          .catch((err) => {
            console.error('[useEditorView] auto-save failed:', err)
          })
      }, DEBOUNCE_MS)
    })

    autoSaveListenerRef.current = autoSaveListener

    const pasteDetector = EditorView.domEventHandlers({
      paste(event, view) {
        const text = event.clipboardData?.getData('text/plain') ?? ''
        if (text.length < 30) return

        const store   = useTabStore.getState()
        const current = store.tabs.find((t) => t.id === tabIdRef.current)
        if (!current) return
        // Only auto-detect for tabs whose filename has no recognized extension.
        if (detectLanguage(current.filename) !== 'text') return

        const detected = detectContentLanguage(text)
        if (!detected) return

        // Prevent CM6 from inserting the raw text — we insert formatted below.
        event.preventDefault()
        ;(async () => {
          const formatted = await formatCode(text, detected)
          store.updateTabLanguage(tabIdRef.current!, detected)
          const tab = store.tabs.find((t) => t.id === tabIdRef.current)
          if (tab?.fileId) {
            useFileStore.getState().updateFileLanguage(tab.fileId, detected).catch(console.error)
          }
          view.dispatch({
            changes: { from: 0, to: view.state.doc.length, insert: formatted },
          })
        })()

        return true
      },
    })
    pasteDetectorRef.current = pasteDetector

    const contentDetectListener = EditorView.updateListener.of((update) => {
      if (!update.docChanged) return
      const store   = useTabStore.getState()
      const current = store.tabs.find((t) => t.id === tabIdRef.current)
      // Only reactive-detect while language is still 'text' (never been identified)
      if (!current || current.language !== 'text') return

      if (detectTimerRef.current !== null) clearTimeout(detectTimerRef.current)
      detectTimerRef.current = setTimeout(async () => {
        const view = viewRef.current
        if (!view) return
        const content  = view.state.doc.toString()
        const detected = detectContentLanguage(content)
        if (!detected) return
        useTabStore.getState().updateTabLanguage(tabIdRef.current!, detected)
        const updatedTab = useTabStore.getState().tabs.find((t) => t.id === tabIdRef.current)
        if (updatedTab?.fileId) {
          useFileStore.getState().updateFileLanguage(updatedTab.fileId, detected).catch(console.error)
        }
        const formatted = await formatCode(content, detected)
        if (formatted === content) return
        view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: formatted } })
      }, 800)
    })
    contentDetectRef.current = contentDetectListener

    // Push the live doc into editorContentStore so StatusBar counts and the
    // RightPanel preview/tree update on every keystroke instead of staying
    // pinned to the last EditorState snapshot.
    const liveContentListener = EditorView.updateListener.of((update) => {
      if (!update.docChanged) return
      useEditorContentStore.getState().setContent(update.state.doc.toString())
    })
    liveContentRef.current = liveContentListener

    const existingState = getEditorState(tabId)
    const initialState =
      existingState ??
      EditorState.create({
        doc: getLocalContent(tabId) ?? '',
        extensions: [
          compartment.of(buildExtensions(language, isDark, fontSizeRef.current, showLineNumbersRef.current)),
          autoSaveListener,
          pasteDetector,
          contentDetectListener,
          liveContentListener,
        ],
      })

const view = new EditorView({
      state: initialState,
      parent: containerRef.current,
    })

    viewRef.current = view
    prevTabIdRef.current = tabId
    _activeView = view

    // Seed live content for the initial doc — the updateListener only fires on
    // subsequent changes, not on first mount.
    useEditorContentStore.getState().setContent(initialState.doc.toString())

    return () => {
      if (saveTimerRef.current !== null) {
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }
      if (detectTimerRef.current !== null) {
        clearTimeout(detectTimerRef.current)
        detectTimerRef.current = null
      }
      // Snapshot before destroy so remount can restore content from editorStateMap
      if (tabIdRef.current) {
        useTabStore.getState().snapshotState(tabIdRef.current, view.state)
      }
      view.destroy()
      viewRef.current = null
      _activeView = null
      // Editor is gone — clear live content so StatusBar doesn't show stale counts.
      useEditorContentStore.getState().setContent('')
      useSaveStatusStore.getState().reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Tab switch ────────────────────────────────────────────────────────────

  useEffect(() => {
    const view = viewRef.current
    if (!view || !tabId) return
    if (tabId === prevTabIdRef.current) return

    const prevTabId = prevTabIdRef.current
    if (prevTabId !== null) {
      snapshotState(prevTabId, view.state)
    }

    const compartment = compartmentRef.current
    const nextState =
      getEditorState(tabId) ??
      EditorState.create({
        doc: getLocalContent(tabId) ?? '',
        extensions: [
          compartment.of(buildExtensions(language, isDark, fontSizeRef.current, showLineNumbersRef.current)),
          autoSaveListenerRef.current!,
          pasteDetectorRef.current!,
          contentDetectRef.current!,
          liveContentRef.current!,
        ],
      })

    view.setState(nextState)
    prevTabIdRef.current = tabId

    // setState replaces the doc without firing a docChanged update — push the
    // new tab's content so the StatusBar / RightPanel reflect the switch.
    useEditorContentStore.getState().setContent(nextState.doc.toString())
  }, [tabId, language, isDark, snapshotState, getEditorState])

  // ── Theme / language reconfiguration ─────────────────────────────────────

  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    // Reconfigure only the compartment — autoSaveListener is unaffected.
    view.dispatch({
      effects: compartmentRef.current.reconfigure(buildExtensions(language, isDark, fontSize, showLineNumbers)),
    })
  }, [isDark, language, fontSize, showLineNumbers])

  // ── Return ────────────────────────────────────────────────────────────────

  return { view: viewRef.current }
}
