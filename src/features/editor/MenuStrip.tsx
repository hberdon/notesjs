// MenuStrip — 28px tall application menu bar with 6 menus + save pill + ⌘K chip
// Design reference: design/design_handoff_notesjs_v3/README.md § V3MenuStrip

import { useEffect, useRef, useState } from 'react'
import { N2G } from '@/shared/components/N2G'
import { useUIStore } from '@/store/uiStore'
import { ArchivoSheet }   from './menus/ArchivoSheet'
import { EditarSheet }    from './menus/EditarSheet'
import { BuscarSheet }    from './menus/BuscarSheet'
import { CompartirSheet } from './menus/CompartirSheet'
import { VerSheet }       from './menus/VerSheet'
import { AyudaSheet }     from './menus/AyudaSheet'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MenuStripProps {
  saveStatus: 'idle' | 'saving' | 'saved'
  activeTabId: string | null
  /** Passed down to ArchivoSheet */
  onNewTab: () => void
  onOpenFile: () => void
  onRenameTab: () => void
  onDeleteTab: () => void
  /** Passed down to EditarSheet */
  onFormat: () => void
  onMinify: () => void
  /** fileId for CompartirSheet */
  fileId: string | null
}

// ── Menu config ───────────────────────────────────────────────────────────────

type MenuId = 'archivo' | 'editar' | 'buscar' | 'compartir' | 'ver' | 'ayuda'

const MENUS: Array<{ id: MenuId; label: string }> = [
  { id: 'archivo',   label: 'Archivo'   },
  { id: 'editar',    label: 'Editar'    },
  { id: 'buscar',    label: 'Buscar'    },
  { id: 'compartir', label: 'Compartir' },
  { id: 'ver',       label: 'Ver'       },
  { id: 'ayuda',     label: 'Ayuda'     },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function MenuStrip({
  saveStatus,
  activeTabId,
  onNewTab,
  onOpenFile,
  onRenameTab,
  onDeleteTab,
  onFormat,
  onMinify,
  fileId,
}: MenuStripProps) {
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

  // Save pill content
  const isSaving    = saveStatus === 'saving'
  const pillIcon    = isSaving ? 'cloud-up' : 'cloud-check'
  const pillLabel   = isSaving ? 'guardando…' : 'guardado'
  const pillColor   = isSaving ? '#6b7280' : '#10b981'

  return (
    <div
      ref={stripRef}
      style={{
        position:     'relative',   // anchor for absolute sheets
        display:      'flex',
        alignItems:   'center',
        height:       '2.143rem',
        minHeight:    '2.143rem',
        background:   '#ffffff',
        borderTop:    '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        flexShrink:   0,
        userSelect:   'none',
        zIndex:       50,
        paddingLeft:  '0.286rem',
      }}
    >
      {/* ── Left: menu items ── */}
      <div style={{ display: 'flex', alignItems: 'stretch', height: '100%', flex: 1 }}>
        {MENUS.map(({ id, label }) => {
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
                color:        isActive ? '#111827' : '#374151',
                background:   isActive ? '#f7f7f9' : 'transparent',
                border:       'none',
                borderLeft:   isActive ? '1px solid #e5e7eb' : 'none',
                borderRight:  isActive ? '1px solid #e5e7eb' : 'none',
                cursor:       'pointer',
                whiteSpace:   'nowrap',
                flexShrink:   0,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.color = '#111827'
                  ;(e.currentTarget as HTMLButtonElement).style.background = '#f7f7f9'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.color = '#374151'
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                }
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* ── Right: save indicator + ⌘K chip ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.571rem', padding: '0 0.857rem' }}>
        {/* Save indicator — only shown when activeTabId exists */}
        {activeTabId !== null && (
          <span
            style={{
              display:    'inline-flex',
              alignItems: 'center',
              gap:        '0.286rem',
              fontSize:   '0.786rem',
              fontWeight: 600,
              color:      pillColor,
              whiteSpace: 'nowrap',
            }}
          >
            <N2G name={pillIcon} size={13} stroke={1.8} color={pillColor} />
            {pillLabel}
          </span>
        )}

        {/* ⌘K chip */}
        <span
          style={{
            fontFamily:   'var(--font-mono)',
            fontSize:     '0.75rem',
            color:        '#9ca3af',
            padding:      '2px 0.429rem',
            border:       '1px solid #e5e7eb',
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
