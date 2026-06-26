// MenuPrimitives — shared building blocks for all 6 MenuSheets
// Design reference: design/design_handoff_notesjs_v3/README.md § V3MItem / V3MSection / V3MDivider

import type { CSSProperties, ReactNode } from 'react'
import { N2G } from '@/shared/components/N2G'

// ── MItem ────────────────────────────────────────────────────────────────────

export interface MItemProps {
  icon?: string                              // N2G icon name
  label: string
  sub?: string                               // 10.5px muted sub-label
  shortcut?: string                          // keyboard shortcut chip
  variant?: 'default' | 'accent' | 'danger' // color variant
  on?: boolean                               // selected state → accentSoft bg
  onClick?: () => void
  disabled?: boolean
  wip?: boolean                              // "en desarrollo" → disabled + badge
}

export function MItem({
  icon,
  label,
  sub,
  shortcut,
  variant = 'default',
  on = false,
  onClick,
  disabled = false,
  wip = false,
}: MItemProps) {
  // A work-in-progress item is always non-interactive.
  const isDisabled = disabled || wip
  const labelColor =
    variant === 'danger'
      ? 'var(--err)'
      : on
        ? 'var(--accentDeep)'
        : 'var(--ink)'

  const iconColor =
    variant === 'accent' || on ? 'var(--accentDeep)' : 'var(--ink3)'

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      title={wip ? 'En desarrollo' : undefined}
      style={{
        display:         'grid',
        gridTemplateColumns: '1.143rem 1fr auto',
        alignItems:      'center',
        gap:             '0.643rem',
        width:           '100%',
        padding:         '0.357rem 0.714rem',
        background:      on ? 'var(--accentSoft)' : 'transparent',
        border:          'none',
        borderRadius:    '0.286rem',
        cursor:          isDisabled ? 'default' : 'pointer',
        textAlign:       'left',
        color:           labelColor,
        opacity:         isDisabled ? 0.45 : 1,
      } as CSSProperties}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          (e.currentTarget as HTMLButtonElement).style.background = on
            ? 'var(--accentSoft)'
            : 'var(--chrome)'
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = on
          ? 'var(--accentSoft)'
          : 'transparent'
      }}
    >
      {/* Icon slot */}
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.286rem', height: '1.286rem', flexShrink: 0 }}>
        {icon ? <N2G name={icon} size={15} stroke={1.8} color={iconColor} /> : null}
      </span>

      {/* Label + sub-label */}
      <span style={{ display: 'flex', flexDirection: 'column', gap: 1, overflow: 'hidden' }}>
        <span
          style={{
            fontSize:     '0.821rem',
            fontWeight:   400,
            lineHeight:   1,
            whiteSpace:   'nowrap',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            color:        labelColor,
          }}
        >
          {label}
        </span>
        {sub && (
          <span
            style={{
              fontSize:   '0.75rem',
              fontWeight: 400,
              color:      'var(--muted)',
              lineHeight: 1,
              whiteSpace: 'nowrap',
              overflow:   'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {sub}
          </span>
        )}
      </span>

      {/* Right slot — a WIP badge takes precedence over the shortcut chip */}
      {wip ? (
        <span
          style={{
            fontSize:      '0.625rem',
            fontWeight:    700,
            letterSpacing: '0.4px',
            textTransform: 'uppercase',
            color:         'var(--muted)',
            border:        '1px dashed var(--border)',
            borderRadius:  '999px',
            padding:       '0.071rem 0.357rem',
            whiteSpace:    'nowrap',
            flexShrink:    0,
          }}
        >
          beta
        </span>
      ) : shortcut ? (
        <span
          style={{
            fontFamily:   'var(--font-mono)',
            fontSize:     '0.786rem',
            fontWeight:   400,
            color:        'var(--muted)',
            whiteSpace:   'nowrap',
            flexShrink:   0,
          }}
        >
          {shortcut}
        </span>
      ) : null}
    </button>
  )
}

// ── MSection ─────────────────────────────────────────────────────────────────

export interface MSectionProps {
  label?: string       // optional header; if absent just renders children
  children: ReactNode
}

export function MSection({ label, children }: MSectionProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {label && (
        <span
          style={{
            display:       'block',
            padding:       '0.571rem 0.714rem 0.286rem',
            fontSize:      '0.714rem',
            fontWeight:    700,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            color:         'var(--muted)',
            lineHeight:    1,
          }}
        >
          {label}
        </span>
      )}
      {children}
    </div>
  )
}

// ── MDivider ─────────────────────────────────────────────────────────────────

export function MDivider() {
  return (
    <div
      style={{
        height:     '1px',
        background: 'var(--border)',
        margin:     '0.286rem 0.714rem',
        flexShrink: 0,
      }}
    />
  )
}

// ── MToggle — 26×14 track toggle ─────────────────────────────────────────────

export interface MToggleProps {
  value: boolean
  onChange: (v: boolean) => void
  label: string
  icon?: string
}

export function MToggle({ value, onChange, label, icon }: MToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        display:      'grid',
        gridTemplateColumns: '1.143rem 1fr auto',
        alignItems:   'center',
        gap:          '0.643rem',
        width:        '100%',
        height:       '2rem',
        padding:      '0 0.714rem',
        background:   'transparent',
        border:       'none',
        borderRadius: 'var(--r-sm)',
        cursor:       'pointer',
        textAlign:    'left',
        color:        'var(--ink)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--chromeD)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon ? <N2G name={icon} size={13} stroke={1.8} color="var(--ink3)" /> : null}
      </span>

      <span style={{ fontSize: '0.821rem', fontWeight: 400, color: 'var(--ink)' }}>
        {label}
      </span>

      {/* Track */}
      <span
        style={{
          display:         'inline-flex',
          alignItems:      'center',
          width:           '1.857rem',
          height:          '1rem',
          borderRadius:    999,
          background:      value ? 'var(--accent)' : 'var(--chromeDD)',
          transition:      'background 150ms ease',
          padding:         '0 0.143rem',
          flexShrink:      0,
          justifyContent:  value ? 'flex-end' : 'flex-start',
        }}
      >
        {/* Thumb */}
        <span
          style={{
            width:        '0.714rem',
            height:       '0.714rem',
            borderRadius: '50%',
            background:   '#fff',
            flexShrink:   0,
            boxShadow:    '0 1px 2px rgba(0,0,0,0.18)',
          }}
        />
      </span>
    </button>
  )
}

// ── MenuSheet wrapper ─────────────────────────────────────────────────────────

export interface MenuSheetProps {
  width: string
  left: string | number
  children: ReactNode
}

export function MenuSheet({ width, left, children }: MenuSheetProps) {
  return (
    <div
      style={{
        position:     'absolute',
        top:          '100%',
        left,
        width,
        background:   'var(--bg)',
        borderTop:    '2px solid #10b981',
        borderRadius: '0 0.429rem 0.429rem 0.429rem',
        boxShadow:    '0 10px 24px -8px rgba(15,23,42,0.22), 0 2px 4px rgba(15,23,42,0.05)',
        padding:      '0.286rem 0',
        zIndex:       110,
        userSelect:   'none',
      }}
    >
      {children}
    </div>
  )
}
