import type { Language } from './types'

// ── Language detection ──────────────────────────────────────────────────────

/**
 * Maps file extensions (lowercase, without the leading dot) to
 * the corresponding CodeMirror 6 language ID.
 *
 * Only extensions that have a corresponding @codemirror/lang-* package
 * installed in this project should appear here.
 */
const LANG_MAP: Record<string, Language> = {
  // TypeScript
  ts: 'typescript',
  tsx: 'typescript',
  // JavaScript
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  // Python
  py: 'python',
  pyw: 'python',
  // Markdown
  md: 'markdown',
  mdx: 'markdown',
  // HTML / templates
  html: 'html',
  htm: 'html',
  // CSS
  css: 'css',
  scss: 'css',
  sass: 'css',
  less: 'css',
  // JSON
  json: 'json',
  jsonc: 'json',
  // Java
  java: 'java',
  // Rust
  rs: 'rust',
}

/**
 * Derives a CodeMirror 6 language ID from a filename.
 *
 * - Extracts the last segment after the final dot.
 * - Normalises to lowercase.
 * - Falls back to `'text'` for unknown or missing extensions.
 *
 * @example
 *   detectLanguage('main.ts')      // → 'typescript'
 *   detectLanguage('styles.SCSS')  // → 'css'
 *   detectLanguage('Dockerfile')   // → 'text'
 *   detectLanguage('')             // → 'text'
 */
export function detectLanguage(filename: string): Language {
  if (!filename) return 'text'

  const dotIndex = filename.lastIndexOf('.')
  if (dotIndex === -1 || dotIndex === filename.length - 1) return 'text'

  const ext = filename.slice(dotIndex + 1).toLowerCase()
  return LANG_MAP[ext] ?? 'text'
}

// ── ID generation ───────────────────────────────────────────────────────────

/**
 * Generates a cryptographically random UUID v4 string.
 * Uses the Web Crypto API (`crypto.randomUUID`) available in all modern
 * browsers and Node 18+.
 */
export function generateId(): string {
  return crypto.randomUUID()
}

// ── Formatting helpers ──────────────────────────────────────────────────────

/**
 * Formats a byte count into a human-readable string with appropriate units.
 *
 * @example
 *   formatBytes(0)          // → '0 B'
 *   formatBytes(1024)       // → '1.0 KB'
 *   formatBytes(1536)       // → '1.5 KB'
 *   formatBytes(1048576)    // → '1.0 MB'
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB'] as const
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  )

  if (index === 0) return `${bytes} B`

  const value = bytes / Math.pow(1024, index)
  return `${value.toFixed(1)} ${units[index]}`
}
