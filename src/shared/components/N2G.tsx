// N2G — inline SVG icon renderer
// Design reference: design/design_handoff_notesjs_v3/src/notesjs-shared-primitives.jsx § N2I
// All icons: viewBox "0 0 24 24", stroke-based, fill none, round caps/joins.
// Paths sourced from Lucide / Heroicons / Feather (MIT-licensed open-source sets).

import type { ReactNode } from 'react'

export interface N2GProps {
  name:       string
  size?:      number  // default 16
  stroke?:    number  // default 1.6
  color?:     string  // default 'currentColor'
  className?: string
}

// ── Single-path icons (d attribute only) ─────────────────────────────────────

const SINGLE: Record<string, string> = {
  plus:        'M12 5v14M5 12h14',
  x:           'M6 6l12 12M18 6L6 18',
  'chev-down': 'm6 9 6 6 6-6',
  'chev-right':'m9 6 6 6-6 6',
  moon:        'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  check:       'm5 12 4 4 10-10',
  type:        'M5 7V5h14v2M9 5v15M15 9v11M11 20h6',
  wrap:        'M4 6h16M4 12h13a3 3 0 0 1 0 6H10l3-3M4 18h6',
  hash:        'M5 9h14M5 15h14M10 4 8 20M16 4l-2 16',
  trash:       'M4 7h16M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13M9 7V4h6v3',
  download:    'M12 4v11M7 10l5 5 5-5M5 19h14',
  upload:      'M12 19V8M7 13l5-5 5 5M5 4h14',
}

// ── Multi-element icons (full JSX children) ───────────────────────────────────

const MULTI: Record<string, ReactNode> = {
  'cloud-check': (
    <>
      <path d="M7 18a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.7 1A3.8 3.8 0 0 1 17 18z" />
      <path d="m9 13 2 2 4-4" />
    </>
  ),
  'cloud-up': (
    <>
      <path d="M7 18a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.7 1A3.8 3.8 0 0 1 17 18z" />
      <path d="m9 14 3-3 3 3" />
      <path d="M12 11v6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20.5 20.5-4.6-4.6" />
    </>
  ),
  share: (
    <>
      <circle cx="6"  cy="12" r="2.5" />
      <circle cx="18" cy="6"  r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="m8 11 8-4M8 13l8 4" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
    </>
  ),
  map: (
    <>
      <path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2z" />
      <path d="M9 4v16M15 6v16" />
    </>
  ),
  keyboard: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-5" />
      {/* filled dot — stroke="none" so the parent stroke prop doesn't colour it */}
      <circle cx="12" cy="8.2" r="0.8" fill="currentColor" stroke="none" />
    </>
  ),
  dot: (
    // Tiny filled circle — no stroke.
    <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
  ),
  'file-new': (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
      <path d="M12 11v6M9 14h6" />
    </>
  ),
  rename: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="M14 6l4 4" />
    </>
  ),
  undo: (
    <>
      <path d="M9 7 4 12l5 5" />
      <path d="M4 12h11a5 5 0 1 1 0 10h-3" />
    </>
  ),
  redo: (
    <>
      <path d="m15 7 5 5-5 5" />
      <path d="M20 12H9a5 5 0 1 0 0 10h3" />
    </>
  ),
  cut: (
    <>
      <circle cx="6" cy="6"  r="2.6" />
      <circle cx="6" cy="18" r="2.6" />
      <path d="m8.3 7.7 11.7 11.7M8.3 16.3 20 4.6" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </>
  ),
  paste: (
    <>
      <rect x="6" y="5"  width="12" height="16" rx="1.5" />
      <rect x="9" y="3"  width="6"  height="4"  rx="1"   />
    </>
  ),
  comment: (
    // Two slash lines representing a // comment
    <>
      <path d="M7 4l-4 16" />
      <path d="M13 4l-4 16" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </>
  ),
  'log-out': (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </>
  ),
  'folder-open': (
    <>
      <path d="M2 8a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v2" />
      <path d="M2 8v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2H2z" />
    </>
  ),
  // format — magic wand / indent (wand shaft + sparkle)
  format: (
    <>
      <path d="M15 4l5 5L7 22H2v-5z" />
      <path d="M18 2l2 2-2 2" />
    </>
  ),
  // minimize — compress (inward diagonal arrows)
  minimize: (
    <>
      <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
    </>
  ),
  'hard-drive': (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M2 12h20" />
      <circle cx="7" cy="17" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  'cloud-upload': (
    <>
      <path d="M7 18a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.7 1A3.8 3.8 0 0 1 17 18z" />
      <path d="m9 14 3-3 3 3" />
      <path d="M12 11v6" />
    </>
  ),
}

// ── Component ─────────────────────────────────────────────────────────────────

export function N2G({
  name,
  size   = 16,
  stroke = 1.6,
  color  = 'currentColor',
  className,
}: N2GProps) {
  const multiChildren = MULTI[name]
  const singlePath    = SINGLE[name]

  if (multiChildren === undefined && singlePath === undefined) return null

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: '0 0 auto' }}
      className={className}
    >
      {multiChildren ?? <path d={singlePath} />}
    </svg>
  )
}
