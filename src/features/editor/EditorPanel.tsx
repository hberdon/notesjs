import { useRef } from 'react'
import { useEditorView } from './useEditorView'

interface EditorPanelProps {
  tabId: string | null
  fileId: string | null
  language: string
  isDark: boolean
}

/**
 * Renders the CodeMirror 6 editor inside a flex-filling container.
 *
 * The CM6 EditorView mounts itself into the containerRef div via
 * `useEditorView`. This component's only responsibility is to provide
 * the DOM anchor and relay the required props.
 */
export default function EditorPanel({
  tabId,
  fileId,
  language,
  isDark,
}: EditorPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEditorView(containerRef, tabId, fileId, language, isDark)

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    />
  )
}
