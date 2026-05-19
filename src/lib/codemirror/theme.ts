import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { oneDark } from '@codemirror/theme-one-dark'

/**
 * Returns the CodeMirror 6 dark theme extension.
 * Uses the official `oneDark` theme from `@codemirror/theme-one-dark`.
 */
export function getDarkTheme(): Extension {
  return oneDark
}

/**
 * Returns a CodeMirror 6 light theme extension.
 *
 * Provides a clean light color scheme:
 * - White editor background
 * - Near-black text (`#1a1a1a`)
 * - Light gray gutter background with medium-gray line numbers
 * - Subtle active-line highlight
 * - Standard blue selection color
 */
export function getLightTheme(): Extension {
  return EditorView.theme(
    {
      '&': {
        color: '#1a1a1a',
        backgroundColor: '#ffffff',
      },
      '.cm-content': {
        caretColor: '#0e0e0e',
      },
      '.cm-cursor, .cm-dropCursor': {
        borderLeftColor: '#0e0e0e',
      },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
        {
          backgroundColor: '#d7e4f2',
        },
      '.cm-panels': {
        backgroundColor: '#f5f5f5',
        color: '#1a1a1a',
      },
      '.cm-panels.cm-panels-top': {
        borderBottom: '1px solid #ddd',
      },
      '.cm-panels.cm-panels-bottom': {
        borderTop: '1px solid #ddd',
      },
      '.cm-searchMatch': {
        backgroundColor: '#ffdd5740',
        outline: '1px solid #ffdd57',
      },
      '.cm-searchMatch.cm-searchMatch-selected': {
        backgroundColor: '#ff9e3240',
      },
      '.cm-activeLine': {
        backgroundColor: '#f0f4f880',
      },
      '.cm-selectionMatch': {
        backgroundColor: '#a8d4ff40',
      },
      '&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
        backgroundColor: '#bad0f847',
      },
      '.cm-gutters': {
        backgroundColor: '#f5f5f5',
        color: '#999999',
        border: 'none',
        borderRight: '1px solid #e0e0e0',
      },
      '.cm-activeLineGutter': {
        backgroundColor: '#e8eef4',
      },
      '.cm-foldPlaceholder': {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#a0a0a0',
      },
      '.cm-tooltip': {
        border: '1px solid #ddd',
        backgroundColor: '#ffffff',
      },
      '.cm-tooltip .cm-tooltip-arrow:before': {
        borderTopColor: '#ddd',
        borderBottomColor: '#ddd',
      },
      '.cm-tooltip .cm-tooltip-arrow:after': {
        borderTopColor: '#ffffff',
        borderBottomColor: '#ffffff',
      },
      '.cm-tooltip-autocomplete': {
        '& > ul > li[aria-selected]': {
          backgroundColor: '#d7e4f2',
          color: '#1a1a1a',
        },
      },
    },
    { dark: false },
  )
}
