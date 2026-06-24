// StatusBar — bottom chrome strip, 22px tall
// Design reference: design/design_handoff_notesjs_v3/README.md § V3StatusBar
//
// Layout: [save pill] [L:C] [spacer] [format pill (s)] [· N palabras · N car.] [· UTF-8]

import { N2G } from '@/shared/components/N2G'
import { FormatPill } from '@/shared/components/FormatPill'
import { useEditorContentStore } from '@/store/editorContentStore'
import { useSaveStatusStore } from '@/store/saveStatusStore'

export interface StatusBarProps {
  language: string
  cursorLine: number    // 1-based
  cursorCol: number     // 1-based
}

// ── Word-like rotating spinner ──────────────────────────────────────────────

function SaveSpinner({ color }: { color: string }) {
  return (
    <svg className="nj-spin" width={15} height={15} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="#d1d5db" strokeWidth={3} opacity={0.4} />
      <path d="M12 3 a9 9 0 0 1 9 9" stroke={color} strokeWidth={3} strokeLinecap="round" />
    </svg>
  )
}

// ── Relative time helper ────────────────────────────────────────────────────

function timeAgo(ts: number): string {
  const diffSec = Math.floor((Date.now() - ts) / 1000)
  if (diffSec < 60)   return `hace ${diffSec} s`
  if (diffSec < 3600) return `hace ${Math.floor(diffSec / 60)} min`
  return `hace ${Math.floor(diffSec / 3600)} h`
}

// ── Component ───────────────────────────────────────────────────────────────

export function StatusBar({
  language,
  cursorLine,
  cursorCol,
}: StatusBarProps) {
  // Live editor content — subscribed here (leaf) so keystrokes don't re-render
  // EditorPage or the surrounding chrome.
  const content = useEditorContentStore((s) => s.content)

  // Save status — subscribed here (leaf) so save ticks stay out of EditorPage.
  const saveStatus  = useSaveStatusStore((s) => s.status)
  const lastSavedAt = useSaveStatusStore((s) => s.lastSavedAt)

  // Word / char counts
  const wordCount = content.trim() === ''
    ? 0
    : content.trim().split(/\s+/).filter(Boolean).length
  const charCount = content.length

  // Save pill content
  const isSaving = saveStatus === 'saving'
  const pillColor = isSaving ? '#6b7280' : '#047857'
  const pillLabel = isSaving
    ? 'guardando…'
    : lastSavedAt !== null
      ? `Guardado · ${timeAgo(lastSavedAt)}`
      : 'Guardado'

  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        gap:            '0.857rem',
        height:         '1.571rem',
        minHeight:      '1.571rem',
        background:     '#eef0f3',
        borderTop:      '1px solid #e5e7eb',
        padding:        '0 0.857rem',
        fontSize:       '0.821rem',
        color:          '#374151',
        fontFamily:     'var(--font-ui)',
        flexShrink:     0,
        userSelect:     'none',
      }}
    >
      {/* Save pill */}
      <span
        style={{
          display:    'inline-flex',
          alignItems: 'center',
          gap:        '0.286rem',
          color:      pillColor,
          fontSize:   '0.821rem',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        {isSaving ? (
          <SaveSpinner color={pillColor} />
        ) : (
          <N2G name="cloud-check" size={15} stroke={1.8} color={pillColor} />
        )}
        {pillLabel}
      </span>

      {/* Cursor position L:C */}
      <span
        style={{
          fontSize:   '0.821rem',
          color:      '#374151',
          whiteSpace: 'nowrap',
        }}
      >
        L {cursorLine} : {cursorCol}
      </span>

      {/* Spacer */}
      <span style={{ flex: 1 }} />

      {/* Format pill (small) */}
      <FormatPill ext={language} size="s" />

      {/* Word + char counts */}
      <span style={{ fontSize: '0.821rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
        · {wordCount} palabras · {charCount} car.
      </span>

      {/* Encoding */}
      <span style={{ fontSize: '0.821rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>· UTF-8</span>
    </div>
  )
}
