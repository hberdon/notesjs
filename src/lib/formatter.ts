import type { Plugin } from 'prettier'
import type { Language } from '@/shared/types'

// ── Native: JSON ──────────────────────────────────────────────────────────────

function formatJSON(input: string): string {
  return JSON.stringify(JSON.parse(input), null, 2)
}

// ── Native: XML ───────────────────────────────────────────────────────────────

function validateXML(text: string): boolean {
  const doc = new DOMParser().parseFromString(text, 'text/xml')
  return !doc.querySelector('parsererror')
}

function formatXML(input: string, indent = 2): string {
  if (!validateXML(input)) return input

  const pad = ' '.repeat(indent)
  let result = ''
  let level  = 0

  const nodes = input
    .replace(/>\s*</g, '><')
    .replace(/</g, '\x00<')
    .split('\x00')
    .filter(Boolean)

  for (let i = 0; i < nodes.length; i++) {
    const trimmed = nodes[i].trim()

    if (trimmed.startsWith('</')) {
      level = Math.max(0, level - 1)
      result += `${pad.repeat(level)}${trimmed}\n`

    } else if (trimmed.endsWith('/>') || trimmed.startsWith('<?') || trimmed.startsWith('<!')) {
      result += `${pad.repeat(level)}${trimmed}\n`

    } else if (trimmed.startsWith('<')) {
      const gtIdx      = trimmed.indexOf('>')
      const inlineText = trimmed.slice(gtIdx + 1).trim()

      if (inlineText) {
        const next = nodes[i + 1]?.trim()
        if (next?.startsWith('</')) {
          result += `${pad.repeat(level)}${trimmed.slice(0, gtIdx + 1)}${inlineText}${next}\n`
          i++
        } else {
          result += `${pad.repeat(level)}${trimmed}\n`
          level++
        }
      } else {
        result += `${pad.repeat(level)}${trimmed}\n`
        level++
      }

    } else {
      result += `${pad.repeat(level)}${trimmed}\n`
    }
  }

  return result.trim()
}

// ── Prettier: JS / TS / CSS / HTML / Markdown ─────────────────────────────────

const PRETTIER_MAP: Partial<Record<Language, string>> = {
  javascript: 'babel',
  typescript: 'typescript',
  css:        'css',
  html:       'html',
  markdown:   'markdown',
}

/** Detects XML/SOAP content that must not be touched by Prettier's HTML parser. */
function looksLikeXml(code: string): boolean {
  const head = code.trimStart().slice(0, 200)
  return (
    head.startsWith('<?xml') ||
    /^<[a-zA-Z][a-zA-Z0-9_-]*:[a-zA-Z]/.test(head) ||
    head.includes('xmlns:') ||
    head.includes('SOAP-ENV') ||
    head.includes('soap:')
  )
}

async function loadPrettierPlugins(parser: string) {
  const prettier = await import('prettier/standalone')
  const plugins: unknown[] = []

  if (parser === 'babel') {
    const [babel, estree] = await Promise.all([
      import('prettier/plugins/babel'),
      import('prettier/plugins/estree'),
    ])
    plugins.push(babel.default, estree.default)
  } else if (parser === 'typescript') {
    const [ts, estree] = await Promise.all([
      import('prettier/plugins/typescript'),
      import('prettier/plugins/estree'),
    ])
    plugins.push(ts.default, estree.default)
  } else if (parser === 'css') {
    const p = await import('prettier/plugins/postcss')
    plugins.push(p.default)
  } else if (parser === 'html') {
    const p = await import('prettier/plugins/html')
    plugins.push(p.default)
  } else if (parser === 'markdown') {
    const p = await import('prettier/plugins/markdown')
    plugins.push(p.default)
  }

  return [prettier, plugins as Plugin[]] as const
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Formats `code` for the given language.
 * JSON and XML use native browser APIs; all others use Prettier standalone.
 * Returns the original string unchanged on unsupported language or parse error.
 */
export async function formatCode(code: string, language: Language): Promise<string> {
  if (language === 'json') {
    try { return formatJSON(code) } catch { return code }
  }

  if (language === 'xml') {
    try { return formatXML(code) } catch { return code }
  }

  const parser = PRETTIER_MAP[language]
  if (!parser) return code
  if (parser === 'html' && looksLikeXml(code)) return code

  try {
    const [prettier, plugins] = await loadPrettierPlugins(parser)
    return await prettier.format(code, {
      parser,
      plugins,
      semi:        true,
      singleQuote: true,
      tabWidth:    2,
      printWidth:  100,
    })
  } catch {
    return code
  }
}
