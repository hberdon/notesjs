import type { Extension } from '@codemirror/state'
import { EditorState } from '@codemirror/state'
import {
  EditorView,
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
  keymap,
} from '@codemirror/view'
import {
  foldGutter,
  indentOnInput,
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
} from '@codemirror/language'
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands'
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete'
import { getLanguageExtension } from './languages'
import { getDarkTheme, getLightTheme } from './theme'

/**
 * Builds the full CodeMirror 6 extension set for the editor.
 *
 * Includes:
 * - Line numbers, gutter highlights, fold gutter
 * - Selection, active-line and special-char highlights
 * - History (undo/redo), draw selection, drop cursor
 * - Multiple selections, indent-on-input
 * - Syntax highlighting with default highlight style
 * - Bracket matching and auto-close brackets
 * - Autocompletion
 * - Rectangular selection + crosshair cursor
 * - All keymaps (default, history, close-brackets, completion)
 * - Language extension for the given language ID
 * - Theme (dark or light)
 *
 * @param language - A Language ID string (e.g. 'typescript', 'python', 'text')
 * @param isDark   - Whether to apply the dark theme (true) or light theme (false)
 */
export function buildExtensions(language: string, isDark: boolean): Extension[] {
  return [
    // ── Gutters ────────────────────────────────────────────────────────────
    lineNumbers(),
    highlightActiveLineGutter(),
    foldGutter(),

    // ── Visual aids ────────────────────────────────────────────────────────
    highlightSpecialChars(),
    drawSelection(),
    dropCursor(),
    highlightActiveLine(),

    // ── Editor behaviour ───────────────────────────────────────────────────
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    history(),

    // ── Syntax ────────────────────────────────────────────────────────────
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),

    // ── Brackets / completion ─────────────────────────────────────────────
    bracketMatching(),
    closeBrackets(),
    autocompletion(),

    // ── Mouse / selection helpers ─────────────────────────────────────────
    rectangularSelection(),
    crosshairCursor(),

    // ── Keymaps ───────────────────────────────────────────────────────────
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...historyKeymap,
      ...completionKeymap,
    ]),

    // ── Language support ──────────────────────────────────────────────────
    ...getLanguageExtension(language),

    // ── Theme ─────────────────────────────────────────────────────────────
    isDark ? getDarkTheme() : getLightTheme(),

    // ── Base theme: fill container height ────────────────────────────────
    EditorView.theme({ '&': { height: '100%' } }),
  ]
}
