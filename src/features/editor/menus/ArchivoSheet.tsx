// ArchivoSheet — 260px @ anchored to button left
// Design reference: design/design_handoff_notesjs_v3/README.md § F — Archivo

import { useRef } from 'react'
import { useUIStore } from '@/store/uiStore'
import { MItem, MDivider, MSection, MenuSheet } from './MenuPrimitives'

export interface ArchivoSheetProps {
  left: number
  onNewTab: () => void
  onOpenFile: (filename: string, content: string) => void
  onRenameTab: () => void
  onDeleteTab: () => void
}

// Fake recent items — will be replaced with real data in a future phase
const RECENTES = [
  { name: 'config.json',   time: 'hace 5 min' },
  { name: 'reunion.md',    time: 'hace 1 h' },
  { name: 'lista.txt',     time: 'ayer' },
]

const ACCEPT = [
  '.txt', '.md', '.mdx',
  '.js', '.jsx', '.mjs', '.cjs',
  '.ts', '.tsx',
  '.py', '.pyw',
  '.html', '.htm',
  '.css', '.scss', '.sass', '.less',
  '.json', '.jsonc',
  '.java',
  '.rs',
  '.xml', '.yaml', '.yml',
  '.sh', '.bash', '.zsh',
  '.sql', '.csv',
].join(',')

export function ArchivoSheet({ left, onNewTab, onOpenFile, onRenameTab, onDeleteTab }: ArchivoSheetProps) {
  const closeMenu = useUIStore((s) => s.closeMenu)
  const inputRef  = useRef<HTMLInputElement>(null)

  function handleOpenClick() {
    closeMenu()
    inputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      onOpenFile(file.name, reader.result as string)
    }
    reader.readAsText(file, 'utf-8')
    e.target.value = ''
  }

  return (
    <>
      {/* Hidden file input — lives outside the sheet to avoid positioning issues */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <MenuSheet width="18.571rem" left={left}>
        {/* Nuevo */}
        <MSection>
          <MItem
            icon="file-new"
            label="Nuevo documento"
            shortcut="⌘N"
            variant="accent"
            onClick={onNewTab}
          />
        </MSection>

        <MDivider />

        {/* Archivo */}
        <MSection label="Archivo">
          <MItem
            icon="folder-open"
            label="Abrir"
            sub="archivo local"
            onClick={handleOpenClick}
          />
          <MItem
            icon="download"
            label="Descargar copia"
            sub="txt · md"
          />
          <MItem
            icon="type"
            label="Imprimir…"
            shortcut="⌘P"
          />
        </MSection>

        <MDivider />

        {/* Organizar */}
        <MSection label="Organizar">
          <MItem
            icon="rename"
            label="Renombrar"
            shortcut="F2"
            onClick={onRenameTab}
          />
          <MItem
            icon="trash"
            label="Mover a papelera"
            shortcut="⌘⌫"
            variant="danger"
            onClick={onDeleteTab}
          />
        </MSection>

        <MDivider />

        {/* Recientes */}
        <MSection label="Recientes">
          {RECENTES.map((r) => (
            <MItem
              key={r.name}
              icon="dot"
              label={r.name}
              sub={r.time}
            />
          ))}
        </MSection>
      </MenuSheet>
    </>
  )
}
