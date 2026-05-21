import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { EditorState, Compartment } from '@codemirror/state'
import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { buildExtensions } from '@/lib/codemirror/extensions'
import { useTabStore, getLocalContent } from '@/store/tabStore'
import { useFileStore } from '@/store/fileStore'
import { useUIStore } from '@/store/uiStore'

/** Debounce delay (ms) before an auto-save fires after the last keystroke. */
const DEBOUNCE_MS = 1500

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
) {
  // ── Stable refs ───────────────────────────────────────────────────────────

  const viewRef = useRef<EditorView | null>(null)
  const prevTabIdRef = useRef<string | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fontSize = useUIStore((s) => s.editorSettings.fontSize)

  // Keep latest values accessible inside the mount-effect closure (deps=[])
  // without triggering a full view remount.
  const tabIdRef = useRef(tabId)
  useEffect(() => { tabIdRef.current = tabId }, [tabId])

  const fontSizeRef = useRef(fontSize)
  useEffect(() => { fontSizeRef.current = fontSize }, [fontSize])

  const onGuestSaveRef = useRef(onGuestSave)
  useEffect(() => { onGuestSaveRef.current = onGuestSave }, [onGuestSave])

  // The autoSaveListener is created once in the mount effect and stored here
  // so the tab-switch effect can include it in freshly created states.
  const autoSaveListenerRef = useRef<Extension | null>(null)

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

      if (fileId === null) {
        // Guest path — fileId is always null for local/guest tabs
        if (onGuestSaveRef.current && tabIdRef.current) {
          saveTimerRef.current = setTimeout(() => {
            const content = update.state.doc.toString()
            onGuestSaveRef.current?.(tabIdRef.current!, content)
          }, DEBOUNCE_MS)
        }
        return
      }

      saveTimerRef.current = setTimeout(() => {
        const content = update.state.doc.toString()
        updateFile(fileId, content).catch((err) => {
          console.error('[useEditorView] auto-save failed:', err)
        })
      }, DEBOUNCE_MS)
    })

    autoSaveListenerRef.current = autoSaveListener

    const existingState = getEditorState(tabId)
    const initialState =
      existingState ??
      EditorState.create({
        doc: getLocalContent(tabId) ?? '',
        extensions: [
          compartment.of(buildExtensions(language, isDark, fontSizeRef.current)),
          autoSaveListener,
        ],
      })

const view = new EditorView({
      state: initialState,
      parent: containerRef.current,
    })

    viewRef.current = view
    prevTabIdRef.current = tabId
    _activeView = view

    return () => {
      if (saveTimerRef.current !== null) {
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }
      view.destroy()
      viewRef.current = null
      _activeView = null
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
          compartment.of(buildExtensions(language, isDark, fontSizeRef.current)),
          autoSaveListenerRef.current!,
        ],
      })

    view.setState(nextState)
    prevTabIdRef.current = tabId
  }, [tabId, language, isDark, snapshotState, getEditorState])

  // ── Theme / language reconfiguration ─────────────────────────────────────

  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    // Reconfigure only the compartment — autoSaveListener is unaffected.
    view.dispatch({
      effects: compartmentRef.current.reconfigure(buildExtensions(language, isDark, fontSize)),
    })
  }, [isDark, language, fontSize])

  // ── Return ────────────────────────────────────────────────────────────────

  return { view: viewRef.current }
}
