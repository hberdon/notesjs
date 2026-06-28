// StatusBar — bottom chrome strip, 22px tall
// Design reference: design/design_handoff_notesjs_v3/README.md § V3StatusBar
//
// Layout: [save pill] [L:C] [spacer] [format pill (s)] [· N palabras · N car.] [· UTF-8]

import { N2G } from '@/shared/components/N2G'
import { FormatPill } from '@/shared/components/FormatPill'
import { useEditorContentStore } from '@/store/editorContentStore'
import { useSaveStatusStore } from '@/store/saveStatusStore'
import { useI18nStore } from '@/store/i18nStore'
import type { Translations } from '@/i18n'

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

function timeAgo(ts: number, s: Translations['status']): string {
  const n = Math.floor((Date.now() - ts) / 1000)
  if (n < 60)   return s.agoS.replace('{n}', String(n))
  if (n < 3600) return s.agoMin.replace('{n}', String(Math.floor(n / 60)))
  return s.agoH.replace('{n}', String(Math.floor(n / 3600)))
}

// ── Component ───────────────────────────────────────────────────────────────

export function StatusBar({
  language,
  cursorLine,
  cursorCol,
}: StatusBarProps) {
  const t = useI18nStore((s) => s.t)

  const content = useEditorContentStore((s) => s.content)

  const saveStatus  = useSaveStatusStore((s) => s.status)
  const lastSavedAt = useSaveStatusStore((s) => s.lastSavedAt)

  const wordCount = content.trim() === ''
    ? 0
    : content.trim().split(/\s+/).filter(Boolean).length
  const charCount = content.length

  const isSaving = saveStatus === 'saving'
  const pillColor = isSaving ? '#6b7280' : '#047857'
  const pillLabel = isSaving
    ? t.status.guardando
    : lastSavedAt !== null
      ? t.status.guardadoHace.replace('{time}', timeAgo(lastSavedAt, t.status))
      : t.status.guardado

  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        gap:            '0.857rem',
        height:         '1.571rem',
        minHeight:      '1.571rem',
        background:     'var(--chromeD)',
        borderTop:      '1px solid var(--border)',
        padding:        '0 0.857rem',
        fontSize:       '0.821rem',
        color:          'var(--ink2)',
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
          color:      'var(--ink2)',
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
      <span style={{ fontSize: '0.821rem', color: 'var(--ink3)', whiteSpace: 'nowrap' }}>
        · {t.status.palabras.replace('{n}', String(wordCount))} · {t.status.car.replace('{n}', String(charCount))}
      </span>

      {/* Encoding */}
      <span style={{ fontSize: '0.821rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>· UTF-8</span>
    </div>
  )
}
