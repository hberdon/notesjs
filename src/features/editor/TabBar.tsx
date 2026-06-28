// TabBar — V3 redesign
// Design reference: design/design_handoff_notesjs_v3/README.md § "V3TabBar"

import { useState, useRef, useEffect } from 'react'
import { useI18nStore } from '@/store/i18nStore'
import { FormatPill } from '@/shared/components/FormatPill'
import { N2G } from '@/shared/components/N2G'
import { AppHeader } from '@/shared/components/AppHeader'
import type { Tab } from '@/shared/types'

// ── Props ─────────────────────────────────────────────────────────────────────

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string | null
  onSelectTab: (id: string) => void
  onCloseTab: (id: string) => void
  onNewTab: () => void
  isGuest?: boolean
  /** Id of the tab currently being renamed (inline input shown), or null. */
  renamingTabId?: string | null
  /** Begin inline rename of a tab (e.g. on double-click). */
  onRequestRename?: (id: string) => void
  /** Commit a new filename for the tab. */
  onCommitRename?: (id: string, filename: string) => void
  /** Abort the inline rename without changes. */
  onCancelRename?: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  isGuest = false,
  renamingTabId = null,
  onRequestRename,
  onCommitRename,
  onCancelRename,
}: TabBarProps) {
  const t      = useI18nStore((s) => s.t)
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null)

  // ── Inline rename ──────────────────────────────────────────────────────────
  const [draftName, setDraftName] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)

  // When a rename starts, seed the draft with the current name and focus the
  // input, selecting the basename (everything before the extension dot).
  useEffect(() => {
    if (!renamingTabId) return
    const tab = tabs.find((t) => t.id === renamingTabId)
    if (!tab) return
    setDraftName(tab.filename)
    requestAnimationFrame(() => {
      const el = renameInputRef.current
      if (!el) return
      el.focus()
      const dot = tab.filename.lastIndexOf('.')
      el.setSelectionRange(0, dot > 0 ? dot : tab.filename.length)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renamingTabId])

  function commitRename(tabId: string) {
    const name = draftName.trim()
    const tab = tabs.find((t) => t.id === tabId)
    if (name && tab && name !== tab.filename) {
      onCommitRename?.(tabId, name)
    } else {
      onCancelRename?.()
    }
  }

  return (
    <AppHeader isGuest={isGuest}>
      {/* ── Tabs + new-tab button ── */}
      <div
        role="tablist"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            height: '2.143rem',
            flex: 1,
          }}
        >
          {tabs.map((tab, index) => {
            const isActive = tab.id === activeTabId
            const isHovered = hoveredTabId === tab.id
            const isLast = index === tabs.length - 1

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
                  background: isActive ? 'var(--bg)' : 'var(--chromeDD)',
                  borderTop: '1px solid var(--borderD)',
                  borderLeft: '1px solid var(--borderD)',
                  borderRight: isLast ? '1px solid var(--borderD)' : 'none',
                  borderRadius: index === 0 && isLast ? '0.357rem 0.357rem 0 0'
                    : index === 0 ? '0.357rem 0 0 0'
                    : isLast    ? '0 0.357rem 0 0'
                    : 0,
                  marginLeft: index === 0 ? '0.857rem' : 0,
                  boxSizing: 'border-box',
                  opacity: isActive ? 1 : 0.7,
                }}
              >
                <FormatPill ext={tab.language} size="s" />

                {renamingTabId === tab.id ? (
                  <input
                    ref={renameInputRef}
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); commitRename(tab.id) }
                      else if (e.key === 'Escape') { e.preventDefault(); onCancelRename?.() }
                    }}
                    onBlur={() => commitRename(tab.id)}
                    spellCheck={false}
                    style={{
                      fontSize: '0.821rem',
                      fontWeight: 600,
                      fontFamily: 'var(--font-ui)',
                      color: 'var(--ink)',
                      background: 'var(--bg)',
                      border: '1.5px solid var(--accent)',
                      borderRadius: 'var(--r-sm)',
                      outline: 'none',
                      padding: '0 0.214rem',
                      flex: 1,
                      minWidth: 0,
                      lineHeight: 1.4,
                      boxSizing: 'border-box',
                    }}
                  />
                ) : (
                  <span
                    onDoubleClick={(e) => { e.stopPropagation(); onRequestRename?.(tab.id) }}
                    title={t.tabbar.renombrar}
                    style={{
                      fontSize: '0.821rem',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'var(--ink)' : 'var(--ink3)',
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
                )}

                {tab.isDirty && !(isHovered || isActive) && (
                  <span
                    title={t.tabbar.sinGuardar}
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

                {(isHovered || isActive) && (
                  <button
                    aria-label={t.tabbar.cerrar.replace('{filename}', tab.filename)}
                    title={t.tabbar.cerrar.replace('{filename}', tab.filename)}
                    onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id) }}
                    onMouseEnter={(e) => {
                      const btn = e.currentTarget as HTMLButtonElement
                      btn.style.background = '#fee2e2'
                      btn.style.color = '#dc2626'
                    }}
                    onMouseLeave={(e) => {
                      const btn = e.currentTarget as HTMLButtonElement
                      btn.style.background = 'none'
                      btn.style.color = '#9ca3af'
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

          {/* New-tab button */}
          <button
            aria-label={t.tabbar.nuevo}
            title={`${t.tabbar.nuevo} (⌘T)`}
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
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#10b981' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af' }}
          >
            <N2G name="plus" size={17} stroke={2} />
          </button>
        </div>
      </div>
    </AppHeader>
  )
}
