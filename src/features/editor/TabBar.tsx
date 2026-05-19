// TabBar — V3 redesign
// Design reference: design/design_handoff_notesjs_v3/README.md § "V3TabBar"

import { useState } from 'react'
import { useAuthStore } from '@/features/auth/authStore'
import { FormatPill } from '@/shared/components/FormatPill'
import { N2G } from '@/shared/components/N2G'
import type { Tab } from '@/shared/types'

// ── Helper: extract extension from filename ───────────────────────────────────

function getExt(filename: string): string {
  const dot = filename.lastIndexOf('.')
  if (dot === -1 || dot === filename.length - 1) return 'txt'
  return filename.slice(dot + 1).toLowerCase()
}

// ── Helper: compute avatar initials from email ────────────────────────────────

function getInitials(email: string | null | undefined): string {
  if (!email) return '?'
  const [local] = email.split('@')
  const parts = local.split(/[._\-+]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return local.slice(0, 2).toUpperCase()
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string | null
  onSelectTab: (id: string) => void
  onCloseTab: (id: string) => void
  onNewTab: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
}: TabBarProps) {
  const user = useAuthStore((s) => s.user)
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null)

  const email = user?.email ?? null
  const initials = getInitials(email)

  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '2.143rem',
        background: '#eef0f3',
        flexShrink: 0,
        overflow: 'hidden',
        fontFamily: 'var(--font-ui)',
      }}
    >
      {/* ── Left zone: logo + plan chip ──────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.571rem',
          flexShrink: 0,
          padding: '0 0.857rem',
          height: '2.143rem',
          background: '#ffffff',
          borderRight: '1px solid #e5e7eb',
        }}
      >
        {/* App name */}
        <span style={{ fontSize: '1.143rem', fontWeight: 800, letterSpacing: -0.4, color: '#111827', lineHeight: 1, whiteSpace: 'nowrap', userSelect: 'none' }}>
          notes<span style={{ color: '#10b981' }}>.js</span>
        </span>

        {/* FREE plan chip */}
        <span
          style={{
            fontSize: '0.714rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            color: '#6b7280',
            background: 'transparent',
            border: '1px solid #d1d5db',
            borderRadius: 999,
            padding: '1px 0.429rem',
            lineHeight: 1,
            userSelect: 'none',
            marginLeft: '0.286rem',
          }}
        >
          FREE
        </span>
      </div>

      {/* ── Center zone: scrollable tabs + new-tab button ─────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          height: '2.143rem',
          overflow: 'hidden',
        }}
      >
        {/* Scrollable tab strip */}
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            height: '2.143rem',
            flex: 1,
          }}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId
            const isHovered = hoveredTabId === tab.id

            return (
              <div
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectTab(tab.id)}
                onMouseEnter={() => setHoveredTabId(tab.id)}
                onMouseLeave={() => setHoveredTabId(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.429rem',
                  padding: '0 0.714rem',
                  height: '2.143rem',
                  maxWidth: '14.286rem',
                  minWidth: '5.714rem',
                  cursor: 'pointer',
                  flexShrink: 0,
                  userSelect: 'none',
                  position: 'relative',
                  background: isActive ? '#ffffff' : 'transparent',
                  borderRight: '1px solid #e5e7eb',
                  boxSizing: 'border-box',
                }}
              >
                {/* Extension badge */}
                <FormatPill ext={getExt(tab.filename)} size="s" />

                {/* Filename */}
                <span
                  style={{
                    fontSize: '0.821rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#111827' : '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    minWidth: 0,
                    lineHeight: 1,
                  }}
                >
                  {tab.filename}
                </span>

                {/* Dirty dot — shown only when dirty AND not hovering */}
                {tab.isDirty && !(isHovered || isActive) && (
                  <span
                    title="Cambios sin guardar"
                    style={{
                      width: '0.429rem',
                      height: '0.429rem',
                      borderRadius: '0.214rem',
                      background: '#f59e0b',
                      flexShrink: 0,
                      display: 'inline-block',
                    }}
                  />
                )}

                {/* Close button — visible on hover or active */}
                {(isHovered || isActive) && (
                  <button
                    aria-label={`Cerrar ${tab.filename}`}
                    title={`Cerrar ${tab.filename}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onCloseTab(tab.id)
                    }}
                    style={{
                      width: '1rem',
                      height: '1rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af',
                      padding: 0,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      lineHeight: 1,
                      fontSize: '0.714rem',
                    }}
                  >
                    <N2G name="x" size={12} stroke={2} />
                  </button>
                )}

                {/* Active underline */}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: '#10b981',
                    }}
                  />
                )}
              </div>
            )
          })}

          {/* New-tab button (⌘T) — inside strip, appears right after last tab */}
          <button
            aria-label="Nuevo documento"
            title="Nuevo documento (⌘T)"
            onClick={onNewTab}
            style={{
              width: '2.143rem',
              height: '2.143rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background = '#e5e7eb'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#374151'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#9ca3af'
            }}
          >
            <N2G name="plus" size={17} stroke={2} />
          </button>
        </div>
      </div>

      {/* ── Right zone: email + avatar ────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.571rem',
          flexShrink: 0,
          padding: '0 0.857rem',
          height: '2.143rem',
          background: '#ffffff',
          borderLeft: '1px solid #e5e7eb',
        }}
      >
        {email && (
          <span
            style={{
              fontSize: '0.821rem',
              color: '#6b7280',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            {email}
          </span>
        )}

        {/* Avatar */}
        <div
          aria-label={email ?? 'Usuario'}
          title={email ?? 'Usuario'}
          style={{
            width: '1.429rem',
            height: '1.429rem',
            borderRadius: '0.714rem',
            background: 'linear-gradient(135deg, #10b981, #047857)',
            fontSize: '0.643rem',
            fontWeight: 700,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            userSelect: 'none',
            lineHeight: 1,
          }}
        >
          {initials}
        </div>
      </div>
    </div>
  )
}
