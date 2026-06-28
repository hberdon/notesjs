import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { oneDark } from '@codemirror/theme-one-dark'

// Light-mode syntax token colors (VS Code Light+ inspired)
const lightHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword,                          color: '#0000ff', fontWeight: 'bold' },
  { tag: [tags.name, tags.deleted, tags.character, tags.propertyName, tags.macroName],
                                                color: '#001080' },
  { tag: [tags.function(tags.variableName), tags.labelName],
                                                color: '#795e26' },
  { tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)],
                                                color: '#0070c1' },
  { tag: [tags.definition(tags.name), tags.separator],
                                                color: '#001080' },
  { tag: [tags.typeName, tags.className, tags.number, tags.changed, tags.annotation, tags.modifier, tags.self, tags.namespace],
                                                color: '#267f99' },
  { tag: [tags.operator, tags.operatorKeyword, tags.url, tags.escape, tags.regexp, tags.link, tags.special(tags.string)],
                                                color: '#af00db' },
  { tag: [tags.meta, tags.comment],             color: '#008000', fontStyle: 'italic' },
  { tag: tags.strong,                           fontWeight: 'bold' },
  { tag: tags.emphasis,                         fontStyle: 'italic' },
  { tag: tags.strikethrough,                    textDecoration: 'line-through' },
  { tag: tags.link,                             color: '#0070c1', textDecoration: 'underline' },
  { tag: tags.heading,                          fontWeight: 'bold', color: '#0000ff' },
  { tag: [tags.atom, tags.bool, tags.special(tags.variableName)],
                                                color: '#0070c1' },
  { tag: [tags.processingInstruction, tags.string, tags.inserted],
                                                color: '#a31515' },
  { tag: tags.invalid,                          color: '#ff0000', fontWeight: 'bold' },
])

/**
 * Returns the CodeMirror 6 dark theme extension.
 * Uses the official `oneDark` theme from `@codemirror/theme-one-dark`.
 */
export function getDarkTheme(): Extension {
  return [
    oneDark,
    EditorView.theme({
      '&': {
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
      },
    }),
  ]
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
  return [syntaxHighlighting(lightHighlightStyle), EditorView.theme(
    {
      '&': {
        color: '#1a1a1a',
        backgroundColor: '#ffffff',
        backgroundImage: 'radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
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
  )]
}
