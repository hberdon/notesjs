import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { EditorState, StateEffect } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { buildExtensions } from '@/lib/codemirror/extensions'
import { useTabStore, getLocalContent } from '@/store/tabStore'
import { useFileStore } from '@/store/fileStore'

/** Debounce delay (ms) before an auto-save fires after the last keystroke. */
const DEBOUNCE_MS = 1500

/**
 * Manages a single CodeMirror 6 `EditorView` bound to the given container.
 *
 * Responsibilities:
 * - Creates the EditorView once on mount, destroys it on unmount (React 19
 *   Strict Mode safe — the cleanup always runs before the next mount).
 * - Snapshots the current `EditorState` before switching tabs so that scroll
 *   position, selection, and undo history are preserved across tab switches.
 * - Reconfigures extensions on the fly when `isDark` changes without destroying
 *   the view.
 * - Fires a debounced auto-save (1500 ms) on every document change when a
 *   `fileId` is provided. The timer is cleared on unmount to prevent saves
 *   after the component has been destroyed.
 *
 * @param containerRef - A ref to the `<div>` that will host the editor DOM.
 * @param tabId        - The active tab's local ID (null → no editor rendered).
 * @param fileId       - The Supabase file UUID for auto-save (null → unsaved file).
 * @param language     - CodeMirror language ID (e.g. 'typescript').
 * @param isDark       - Whether the dark theme should be applied.
 * @returns `{ view }` — the current EditorView instance, or null if not mounted.
 */
export function useEditorView(
  containerRef: RefObject<HTMLDivElement | null>,
  tabId: string | null,
  fileId: string | null,
  language: string,
  isDark: boolean,
) {
  // ── Stable refs ───────────────────────────────────────────────────────────

  // The EditorView must live in a ref, NOT in state, to avoid re-renders on
  // every keystroke (which would destroy and re-create the view continuously).
  const viewRef = useRef<EditorView | null>(null)

  // Track the tabId that the view is currently showing so we know which state
  // to snapshot when the active tab changes.
  const prevTabIdRef = useRef<string | null>(null)

  // Debounce timer reference — cleared on unmount to prevent post-unmount saves.
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Store accessors ───────────────────────────────────────────────────────

  const snapshotState = useTabStore((s) => s.snapshotState)
  const getEditorState = useTabStore((s) => s.getEditorState)
  const updateFile = useFileStore((s) => s.updateFile)

  // ── Mount / unmount ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!containerRef.current || !tabId) return

    // Restore existing EditorState for this tab, or create a fresh one.
    // For local file tabs, seed with the content loaded from disk.
    const existingState = getEditorState(tabId)
    const initialState =
      existingState ??
      EditorState.create({
        doc: getLocalContent(tabId) ?? '',
        extensions: buildExtensions(language, isDark),
      })

    // Build the updateListener extension for debounced auto-save.
    // This is added to the view config on creation; it is NOT part of
    // buildExtensions so that reconfiguring theme never removes it.
    const autoSaveListener = EditorView.updateListener.of((update) => {
      if (!update.docChanged) return

      if (saveTimerRef.current !== null) {
        clearTimeout(saveTimerRef.current)
      }

      if (fileId === null) return

      saveTimerRef.current = setTimeout(() => {
        const content = update.state.doc.toString()
        updateFile(fileId, content).catch((err) => {
          console.error('[useEditorView] auto-save failed:', err)
        })
      }, DEBOUNCE_MS)
    })

    const view = new EditorView({
      state: initialState,
      parent: containerRef.current,
      extensions: [autoSaveListener],
    })

    viewRef.current = view
    prevTabIdRef.current = tabId

    return () => {
      // Clear any pending auto-save to avoid post-unmount network calls.
      if (saveTimerRef.current !== null) {
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }

      // MANDATORY: destroy the EditorView to release DOM listeners.
      view.destroy()
      viewRef.current = null
    }
    // Intentionally only run on mount/unmount.
    // tabId, language, and isDark changes are handled in their own effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Tab switch ────────────────────────────────────────────────────────────

  useEffect(() => {
    const view = viewRef.current
    if (!view || !tabId) return
    if (tabId === prevTabIdRef.current) return

    // CRITICAL ORDER: snapshot BEFORE switching state.
    // If we switch first, view.state already points to the new tab's state and
    // the snapshot for the previous tab is permanently lost.
    const prevTabId = prevTabIdRef.current
    if (prevTabId !== null) {
      snapshotState(prevTabId, view.state)
    }

    // Restore (or create) the EditorState for the newly active tab.
    const nextState =
      getEditorState(tabId) ??
      EditorState.create({
        doc: '',
        extensions: buildExtensions(language, isDark),
      })

    view.setState(nextState)
    prevTabIdRef.current = tabId
  }, [tabId, language, isDark, snapshotState, getEditorState])

  // ── Theme / language reconfiguration ─────────────────────────────────────

  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    // Reconfigure the full extension set in-place — avoids destroying the view
    // and preserves document content, selection, and undo history.
    view.dispatch({
      effects: StateEffect.reconfigure.of(buildExtensions(language, isDark)),
    })
  }, [isDark, language])

  // ── Return ────────────────────────────────────────────────────────────────

  return { view: viewRef.current }
}
