// TabBar — V3 redesign
// Design reference: design/design_handoff_notesjs_v3/README.md § "V3TabBar"

import { useState, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore, getEffectiveTheme } from '@/store/themeStore'
import { useI18nStore } from '@/store/i18nStore'
import { FormatPill } from '@/shared/components/FormatPill'
import { N2G } from '@/shared/components/N2G'
import { AppHeader } from '@/shared/components/AppHeader'
import type { Tab } from '@/shared/types'


// ── Theme SVG icons ───────────────────────────────────────────────────────────

function SunIcon({ color }: { color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke={color} width="16" height="16" style={{ flexShrink: 0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  )
}

function MoonIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16" style={{ flexShrink: 0, color }}>
      <path fillRule="evenodd" clipRule="evenodd" d="M17.715 15.15A6.5 6.5 0 0 1 9 6.035C6.106 6.922 4 9.645 4 12.867c0 3.94 3.153 7.136 7.042 7.136 3.101 0 5.734-2.032 6.673-4.853Z" fill="currentColor" opacity="0.2" />
      <path d="m17.715 15.15.95.316a1 1 0 0 0-1.445-1.185l.495.869ZM9 6.035l.846.534a1 1 0 0 0-1.14-1.49L9 6.035Zm8.221 8.246a5.47 5.47 0 0 1-2.72.718v2a7.47 7.47 0 0 0 3.71-.98l-.99-1.738Zm-2.72.718A5.5 5.5 0 0 1 9 9.5H7a7.5 7.5 0 0 0 7.5 7.5v-2ZM9 9.5c0-1.079.31-2.082.845-2.93L8.153 5.5A7.47 7.47 0 0 0 7 9.5h2Zm-4 3.368C5 10.089 6.815 7.75 9.292 6.99L8.706 5.08C5.397 6.094 3 9.201 3 12.867h2Zm6.042 6.136C7.718 19.003 5 16.268 5 12.867H3c0 4.48 3.588 8.136 8.042 8.136v-2Zm5.725-4.17c-.81 2.433-3.074 4.17-5.725 4.17v2c3.552 0 6.553-2.327 7.622-5.537l-1.897-.632Z" fill="currentColor" />
      <path fillRule="evenodd" clipRule="evenodd" d="M17 3a1 1 0 0 1 1 1 2 2 0 0 0 2 2 1 1 0 1 1 0 2 2 2 0 0 0-2 2 1 1 0 1 1-2 0 2 2 0 0 0-2-2 1 1 0 1 1 0-2 2 2 0 0 0 2-2 1 1 0 0 1 1-1Z" fill="currentColor" />
    </svg>
  )
}

// ── ThemeToggleButton ─────────────────────────────────────────────────────────

function ThemeToggleButton() {
  const theme    = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const t        = useI18nStore((s) => s.t)
  const [hovered, setHovered] = useState(false)

  const isDark    = getEffectiveTheme(theme) === 'dark'
  const title     = isDark ? t.tabbar.temaClaro : t.tabbar.temaOscuro
  const iconColor = hovered ? 'var(--accent)' : 'var(--ink3)'

  function toggle() {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <button
      type="button"
      title={title}
      onClick={toggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '1.714rem',
        height: '1.714rem',
        background: hovered ? 'var(--chrome)' : 'transparent',
        border: '0px solid var(--border)',
        borderRadius: '20px',
        cursor: 'pointer',
        transition: 'background 120ms',
        flexShrink: 0,
      }}
    >
      {isDark
        ? <SunIcon color={iconColor} />
        : <MoonIcon color={iconColor} />
      }
    </button>
  )
}

// ── GuestLoginButton ──────────────────────────────────────────────────────────

function GuestLoginButton() {
  const navigate = useNavigate()
  const t        = useI18nStore((s) => s.t)
  const [hovered, setHovered] = useState(false)

  return (
    <button
      type="button"
      onClick={() => navigate('/login')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.286rem',
        padding: '0.286rem 0.714rem',
        background: hovered ? 'var(--accentSoft)' : 'transparent',
        border: '1px solid var(--accentBorder)',
        borderRadius: 'var(--r-pill)',
        cursor: 'pointer',
        fontSize: '0.821rem',
        fontWeight: 700,
        color: 'var(--accentDeep)',
        fontFamily: 'var(--font-ui)',
        whiteSpace: 'nowrap',
        transition: 'background 120ms',
        lineHeight: 1,
      }}
    >
      {t.tabbar.login}
    </button>
  )
}

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
