// FormatPill — colored badge per file extension / language id
// Design reference: design/design_handoff_notesjs_v3/README.md § "Format pills"

import type React from 'react'

interface FormatPillProps {
  ext: string      // file extension or language id — e.g. 'ts', '.ts', 'typescript'
  size?: 's' | 'm' | 'l' // default 'm'
}

// ── Language aliases ─────────────────────────────────────────────────────────

const ALIASES: Record<string, string> = {
  typescript: 'ts',
  javascript: 'js',
  markdown:   'md',
  python:     'py',
  rust:       'rs',
  text:       'txt',
  yaml:       'yml',
}

// ── Color tokens per extension ────────────────────────────────────────────────

interface PillTokens {
  bg:  string
  fg:  string
  dot: string
}

const TOKENS: Record<string, PillTokens> = {
  js:   { bg: '#fef3c7', fg: '#854d0e', dot: '#eab308' },
  jsx:  { bg: '#dbeafe', fg: '#1e40af', dot: '#3b82f6' },
  ts:   { bg: '#dbeafe', fg: '#1e3a8a', dot: '#2563eb' },
  tsx:  { bg: '#dbeafe', fg: '#1e3a8a', dot: '#2563eb' },
  py:   { bg: '#fef3c7', fg: '#854d0e', dot: '#eab308' },
  json: { bg: '#fed7aa', fg: '#7c2d12', dot: '#f97316' },
  xml:  { bg: '#fecaca', fg: '#7f1d1d', dot: '#ef4444' },
  yml:  { bg: '#dcfce7', fg: '#14532d', dot: '#22c55e' },
  yaml: { bg: '#dcfce7', fg: '#14532d', dot: '#22c55e' },
  md:   { bg: '#ede9fe', fg: '#5b21b6', dot: '#8b5cf6' },
  css:  { bg: '#e9d5ff', fg: '#581c87', dot: '#a855f7' },
  html: { bg: '#ffe4e6', fg: '#9f1239', dot: '#f43f5e' },
  txt:  { bg: '#e5e7eb', fg: '#374151', dot: '#6b7280' },
  java: { bg: '#fed7aa', fg: '#7c2d12', dot: '#f97316' },
  rs:   { bg: '#fecaca', fg: '#7f1d1d', dot: '#ef4444' },
}

const DEFAULT_TOKENS: PillTokens = { bg: '#e5e7eb', fg: '#374151', dot: '#6b7280' }

// ── Size scale ────────────────────────────────────────────────────────────────

const SIZES: Record<'s' | 'm' | 'l', React.CSSProperties & { fontFamily: string }> = {
  s: {
    padding:       '1px 0.429rem',
    fontSize:      '0.714rem',
    fontWeight:    800,
    letterSpacing: '0.2px',
    borderRadius:  '0.214rem',
    fontFamily:    '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
  },
  m: {
    padding:       '2px 0.571rem',
    fontSize:      '0.786rem',
    fontWeight:    800,
    letterSpacing: '0.2px',
    borderRadius:  '0.286rem',
    fontFamily:    '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
  },
  l: {
    padding:       '3px 0.714rem',
    fontSize:      '0.857rem',
    fontWeight:    800,
    letterSpacing: '0.2px',
    borderRadius:  '0.357rem',
    fontFamily:    '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
  },
}

// ── Component ─────────────────────────────────────────────────────────────────

export function FormatPill({ ext, size = 'm' }: FormatPillProps) {
  // Normalise: strip leading dot, lowercase, resolve alias
  const raw     = ext.toLowerCase().replace(/^\./, '')
  const key     = ALIASES[raw] ?? raw
  const tokens  = TOKENS[key] ?? DEFAULT_TOKENS
  // Use known label for mapped keys, otherwise truncate to 4 chars uppercase
  const label   = TOKENS[key] ? key.toUpperCase().slice(0, 4) : key.toUpperCase().slice(0, 4)
  const sz      = SIZES[size]

  return (
    <span
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            '0.357rem',
        padding:        sz.padding,
        borderRadius:   sz.borderRadius,
        background:     tokens.bg,
        color:          tokens.fg,
        fontFamily:     sz.fontFamily,
        fontSize:       sz.fontSize,
        fontWeight:     sz.fontWeight,
        letterSpacing:  sz.letterSpacing,
        whiteSpace:     'nowrap',
        border:         `1px solid ${tokens.fg}22`,
        lineHeight:     1,
      }}
    >
      {/* dot with ring in pill bg color — inner glow effect */}
      <span
        style={{
          width:        '0.429rem',
          height:       '0.429rem',
          borderRadius: '50%',
          background:   tokens.dot,
          flexShrink:   0,
          boxShadow:    `0 0 0 1.5px ${tokens.bg}`,
        }}
      />
      {label}
    </span>
  )
}
