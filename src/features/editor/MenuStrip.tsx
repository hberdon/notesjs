// MenuStrip — 28px tall application menu bar with 6 menus + save pill + ⌘K chip
// Design reference: design/design_handoff_notesjs_v3/README.md § V3MenuStrip

import { useEffect, useRef, useState } from 'react'
import { N2G } from '@/shared/components/N2G'
import { useI18nStore } from '@/store/i18nStore'
import { useUIStore } from '@/store/uiStore'
import { ArchivoSheet }   from './menus/ArchivoSheet'
import { EditarSheet }    from './menus/EditarSheet'
import { BuscarSheet }    from './menus/BuscarSheet'
import { CompartirSheet } from './menus/CompartirSheet'
import { VerSheet }       from './menus/VerSheet'
import { AyudaSheet }     from './menus/AyudaSheet'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MenuStripProps {
  /** Passed down to ArchivoSheet */
  onNewTab: () => void
  onOpenFile: () => void
  onRenameTab: () => void
  onDeleteTab: () => void
  onOpenTrash: () => void
  /** Passed down to EditarSheet */
  onFormat: () => void
  onMinify: () => void
  /** fileId for CompartirSheet */
  fileId: string | null
  /** Right-panel toggle — only rendered for panel-capable formats (json/markdown). */
  hasPanel: boolean
  rightPanel: 'tree' | 'preview' | null
  panelType: 'tree' | 'preview'
  onTogglePanel: (panel: 'tree' | 'preview') => void
}

// ── Menu config ───────────────────────────────────────────────────────────────

type MenuId = 'archivo' | 'editar' | 'buscar' | 'compartir' | 'ver' | 'ayuda'

const MENU_IDS: MenuId[] = ['archivo', 'editar', 'buscar', 'compartir', 'ver', 'ayuda']

// ── Component ─────────────────────────────────────────────────────────────────

export function MenuStrip({
  onNewTab,
  onOpenFile,
  onRenameTab,
  onDeleteTab,
  onOpenTrash,
  onFormat,
  onMinify,
  fileId,
  hasPanel,
  rightPanel,
  panelType,
  onTogglePanel,
}: MenuStripProps) {
  const t           = useI18nStore((s) => s.t)
  const openMenuId  = useUIStore((s) => s.openMenuId)
  const toggleMenu  = useUIStore((s) => s.toggleMenu)
  const closeMenu   = useUIStore((s) => s.closeMenu)

  const stripRef    = useRef<HTMLDivElement>(null)
  const buttonRefs  = useRef<Map<MenuId, HTMLButtonElement>>(new Map())
  const [sheetLeft, setSheetLeft] = useState<number>(0)

  // Close when clicking outside the strip (includes the sheet, which is inside it)
  useEffect(() => {
    if (!openMenuId) return

    function handleMouseDown(e: MouseEvent) {
      if (stripRef.current && !stripRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [openMenuId, closeMenu])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeMenu()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [closeMenu])

  const panelActive = rightPanel !== null
  const panelLabel  = panelType === 'tree' ? t.panel.tree : t.panel.preview
  const panelIcon   = panelType === 'tree' ? 'list-ol' : 'eye'

  return (
    <div
      ref={stripRef}
      style={{
        position:     'relative',   // anchor for absolute sheets
        display:      'flex',
        alignItems:   'center',
        height:       '2.143rem',
        minHeight:    '2.143rem',
        background:   'var(--bg)',
        borderTop:    '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        flexShrink:   0,
        userSelect:   'none',
        zIndex:       50,
        paddingLeft:  '0.286rem',
      }}
    >
      {/* ── Left: menu items ── */}
      <div style={{ display: 'flex', alignItems: 'stretch', height: '100%', flex: 1 }}>
        {MENU_IDS.map((id) => {
          const label    = t.menu[id]
          const isActive = openMenuId === id
          return (
            <button
              key={id}
              type="button"
              ref={(el) => {
                if (el) buttonRefs.current.set(id, el)
                else buttonRefs.current.delete(id)
              }}
              onClick={() => {
                const btn = buttonRefs.current.get(id)
                if (btn) setSheetLeft(btn.offsetLeft)
                toggleMenu(id)
              }}
              style={{
                display:      'flex',
                alignItems:   'center',
                height:       '2.143rem',
                padding:      '0 0.857rem',
                fontSize:     '0.893rem',
                fontWeight:   600,
                fontFamily:   'var(--font-ui)',
                color:        isActive ? 'var(--ink)' : 'var(--ink2)',
                background:   isActive ? 'var(--chrome)' : 'transparent',
                border:       'none',
                borderLeft:   isActive ? '1px solid var(--border)' : 'none',
                borderRight:  isActive ? '1px solid var(--border)' : 'none',
                cursor:       'pointer',
                whiteSpace:   'nowrap',
                flexShrink:   0,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink)'
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--chrome)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink2)'
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                }
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* ── Right: panel toggle + ⌘K chip ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.571rem', padding: '0 0.857rem' }}>
        {/* Panel toggle — only for panel-capable formats (json/markdown) */}
        {hasPanel && (
          <button
            type="button"
            onClick={() => onTogglePanel(panelType)}
            title={panelLabel}
            style={{
              display:      'inline-flex',
              alignItems:   'center',
              gap:          '0.286rem',
              height:       '1.571rem',
              padding:      '0 0.571rem',
              fontSize:     '0.786rem',
              fontWeight:   600,
              fontFamily:   'var(--font-ui)',
              color:        panelActive ? 'var(--accent)' : 'var(--ink2)',
              background:   panelActive ? 'var(--chrome)' : 'transparent',
              border:       '1px solid var(--border)',
              borderRadius: '0.286rem',
              cursor:       'pointer',
              whiteSpace:   'nowrap',
              lineHeight:   1,
              transition:   'color 120ms, background 120ms',
            }}
            onMouseEnter={(e) => {
              if (!panelActive) (e.currentTarget as HTMLButtonElement).style.background = 'var(--chrome)'
            }}
            onMouseLeave={(e) => {
              if (!panelActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            }}
          >
            <N2G name={panelIcon} size={13} stroke={1.8} color={panelActive ? 'var(--accent)' : 'var(--ink2)'} />
            {panelLabel}
          </button>
        )}

        {/* ⌘K chip */}
        <span
          style={{
            fontFamily:   'var(--font-mono)',
            fontSize:     '0.75rem',
            color:        'var(--muted)',
            padding:      '2px 0.429rem',
            border:       '1px solid var(--border)',
            borderRadius: '0.286rem',
            whiteSpace:   'nowrap',
            lineHeight:   1,
          }}
        >
          ⌘K
        </span>
      </div>

      {/* ── Sheets (conditionally rendered) ── */}
      {openMenuId === 'archivo' && (
        <ArchivoSheet
          left={sheetLeft}
          onNewTab={onNewTab}
          onOpenFile={onOpenFile}
          onRenameTab={onRenameTab}
          onDeleteTab={onDeleteTab}
          onOpenTrash={onOpenTrash}
        />
      )}
      {openMenuId === 'editar' && (
        <EditarSheet left={sheetLeft} onFormat={onFormat} onMinify={onMinify} />
      )}
      {openMenuId === 'buscar' && <BuscarSheet left={sheetLeft} />}
      {openMenuId === 'compartir' && <CompartirSheet left={sheetLeft} fileId={fileId} />}
      {openMenuId === 'ver' && <VerSheet left={sheetLeft} />}
      {openMenuId === 'ayuda' && <AyudaSheet left={sheetLeft} />}
    </div>
  )
}
