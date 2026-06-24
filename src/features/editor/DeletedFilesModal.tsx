import { useEffect, useState } from 'react'
import { useFileStore } from '@/store/fileStore'
import type { FileMeta } from '@/shared/types'
import { FormatPill } from '@/shared/components/FormatPill'
import { N2G } from '@/shared/components/N2G'

interface DeletedFilesModalProps {
  onClose: () => void
  /** Restore a file (un-delete + open as tab). Resolves when done. */
  onRestore: (file: FileMeta) => void | Promise<void>
}

// Logs-style timestamp: "24 jun, 14:10:26" (mirrors the privedge-platform Logs table).
function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  const day   = String(d.getDate()).padStart(2, '0')
  const month = d.toLocaleString('es-ES', { month: 'short' }).replace('.', '')
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${day} ${month}, ${h}:${m}:${s}`
}

/**
 * On-demand "trash" modal. Lists soft-deleted files (is_deleted = true) trashed
 * within the last 7 days and lets the user restore them. "Vaciar papelera"
 * permanently removes EVERY trashed file (visible + hidden older ones).
 * Opened from Archivo → Papelera; overlays and closes on backdrop / Escape.
 */
export function DeletedFilesModal({ onClose, onRestore }: DeletedFilesModalProps) {
  const fetchDeletedFiles = useFileStore((s) => s.fetchDeletedFiles)
  const countTrash        = useFileStore((s) => s.countTrash)
  const emptyTrash        = useFileStore((s) => s.emptyTrash)

  const [loading, setLoading]         = useState(true)
  const [files, setFiles]             = useState<FileMeta[]>([])
  const [totalCount, setTotalCount]   = useState(0)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [emptying, setEmptying]       = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchDeletedFiles(), countTrash()]).then(([list, count]) => {
      if (cancelled) return
      setFiles(list)
      setTotalCount(count)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [fetchDeletedFiles, countTrash])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      // Escape backs out of the confirm step first, then closes the modal.
      if (confirmOpen) setConfirmOpen(false)
      else onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, confirmOpen])

  async function handleRestore(file: FileMeta) {
    setRestoringId(file.id)
    try {
      await onRestore(file)
      const remaining = files.filter((f) => f.id !== file.id)
      setFiles(remaining)
      setTotalCount((n) => Math.max(0, n - 1))
      // Nothing left to show → close the modal automatically.
      if (remaining.length === 0) onClose()
    } catch (err) {
      console.error('[DeletedFilesModal] restore failed:', err)
    } finally {
      setRestoringId(null)
    }
  }

  async function handleEmptyTrash() {
    setEmptying(true)
    try {
      await emptyTrash()
      // Trash is now empty → close the modal automatically.
      onClose()
    } catch (err) {
      console.error('[DeletedFilesModal] empty trash failed:', err)
    } finally {
      setEmptying(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         1000,
        background:     'rgba(0,0,0,0.45)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '1.5rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position:      'relative',
          width:         '100%',
          maxWidth:      '48rem',
          maxHeight:     '80vh',
          display:       'flex',
          flexDirection: 'column',
          background:    'var(--bg)',
          color:         'var(--ink)',
          border:        '1px solid var(--border)',
          borderRadius:  'var(--r-lg)',
          fontFamily:    'var(--font-ui)',
          overflow:      'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '0.5rem',
          padding:      '0.857rem 1rem',
          borderBottom: '1px solid var(--border)',
        }}>
          <N2G name="trash" size={16} stroke={1.8} color="var(--ink)" />
          <span style={{ fontWeight: 800, fontSize: '0.964rem' }}>Papelera</span>
          <span style={{ flex: 1 }} />

          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '1.714rem', height: '1.714rem',
              background: 'transparent', border: 'none', borderRadius: 'var(--r-sm)',
              cursor: 'pointer', color: 'var(--ink3)',
            }}
          >
            <N2G name="x" size={15} stroke={1.8} color="var(--ink3)" />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto' }}>
          {loading && (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--ink3)', fontSize: '0.893rem' }}>
              Cargando…
            </div>
          )}

          {!loading && files.length === 0 && (
            <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--ink3)', fontSize: '0.893rem' }}>
              No hay archivos eliminados.
            </div>
          )}

          {!loading && files.length > 0 && (
            <table className="nj-trash-table">
              <thead>
                <tr>
                  <th>Archivo</th>
                  <th>Eliminado</th>
                  <th style={{ textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id}>
                    {/* Archivo — pill + name (ellipsis on overflow) */}
                    <td style={{ maxWidth: '18rem', overflow: 'hidden' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                        <FormatPill ext={file.language} size="s" />
                        <span style={{
                          fontWeight: 600,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {file.name}
                        </span>
                      </span>
                    </td>

                    {/* Eliminado — logs-style timestamp */}
                    <td style={{ color: 'var(--ink3)' }}>
                      {formatTimestamp(file.deleted_at ?? file.updated_at)}
                    </td>

                    {/* Acciones — restore (icon-only, discreet) */}
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleRestore(file)}
                        disabled={restoringId === file.id}
                        title="Restaurar"
                        aria-label="Restaurar"
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: '1.714rem', height: '1.714rem',
                          background: 'transparent', border: 'none', borderRadius: 'var(--r-sm)',
                          color: 'var(--ink3)',
                          cursor: restoringId === file.id ? 'default' : 'pointer',
                          opacity: restoringId === file.id ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink3)' }}
                      >
                        <N2G name="undo" size={14} stroke={1.8} color="currentColor" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer — Vaciar papelera (bottom-right), inline confirm in place */}
        {totalCount > 0 && (
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'flex-end',
            gap:            '0.5rem',
            padding:        '0.643rem 1rem',
            borderTop:      '1px solid var(--border)',
          }}>
            {!confirmOpen ? (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.357rem',
                  padding: '0.286rem 0.5rem',
                  fontSize: '0.786rem', fontWeight: 600, fontFamily: 'var(--font-ui)',
                  color: 'var(--ink3)', background: 'transparent',
                  border: 'none', borderRadius: 'var(--r-sm)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--err)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink3)' }}
              >
                <N2G name="trash" size={13} stroke={1.8} color="currentColor" />
                Vaciar papelera
              </button>
            ) : (
              <>
                <span style={{ fontSize: '0.786rem', fontWeight: 600, color: 'var(--ink2)', whiteSpace: 'nowrap' }}>
                  ¿Borrar {totalCount} para siempre?
                </span>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  disabled={emptying}
                  style={{
                    padding: '0.286rem 0.643rem',
                    fontSize: '0.786rem', fontWeight: 600, fontFamily: 'var(--font-ui)',
                    color: 'var(--ink3)', background: 'transparent',
                    border: 'none', borderRadius: 'var(--r-sm)',
                    cursor: emptying ? 'default' : 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleEmptyTrash}
                  disabled={emptying}
                  style={{
                    padding: '0.286rem 0.643rem',
                    fontSize: '0.786rem', fontWeight: 600, fontFamily: 'var(--font-ui)',
                    color: 'var(--err)', background: 'transparent',
                    border: '1px solid var(--err)', borderRadius: 'var(--r-sm)',
                    cursor: emptying ? 'default' : 'pointer',
                    opacity: emptying ? 0.7 : 1,
                  }}
                >
                  {emptying ? 'Vaciando…' : 'Vaciar'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
