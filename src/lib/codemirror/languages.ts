import type { Extension } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { html } from '@codemirror/lang-html'
import { xml } from '@codemirror/lang-xml'
import { sql } from '@codemirror/lang-sql'
import { css } from '@codemirror/lang-css'
import { markdown } from '@codemirror/lang-markdown'
import { java } from '@codemirror/lang-java'
import { rust } from '@codemirror/lang-rust'
import type { Language } from '@/shared/types'

/**
 * Returns the CodeMirror 6 language extension(s) for a given language ID.
 *
 * - `'javascript'` → JavaScript with JSX support enabled
 * - `'typescript'` → TypeScript with TSX support enabled
 * - `'text'`       → empty array (no language extension — plain text)
 * - Unknown IDs    → empty array (safe fallback)
 *
 * @example
 *   getLanguageExtension('typescript') // → [javascript({ typescript: true, jsx: true })]
 *   getLanguageExtension('text')       // → []
 */
export function getLanguageExtension(language: Language | string): Extension[] {
  switch (language as Language) {
    case 'javascript':
      // Enable JSX so .jsx files render correctly
      return [javascript({ jsx: true })]

    case 'typescript':
      // Enable TypeScript + TSX so .ts and .tsx files both work
      return [javascript({ typescript: true, jsx: true })]

    case 'python':
      return [python()]

    case 'html':
      return [html()]

    case 'xml':
      return [xml()]

    case 'sql':
      return [sql()]

    case 'css':
      return [css()]

    case 'markdown':
      return [markdown()]

    case 'java':
      return [java()]

    case 'rust':
      return [rust()]

    case 'text':
    default:
      // Plain text — no language extension needed
      return []
  }
}
