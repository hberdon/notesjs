// RightPanel — 290px side panel for JSON tree navigation and Markdown preview.
// Design reference: design/design_handoff_notesjs_v3/README.md § V3RightPanel, V3TreeNode, V3MdPreview

import { useState } from 'react'
import { marked } from 'marked'
import { N2G } from '@/shared/components/N2G'
import { useEditorContentStore } from '@/store/editorContentStore'

// ── Public interface ──────────────────────────────────────────────────────────

export interface RightPanelProps {
  type: 'tree' | 'preview'
  language?: string
  onClose: () => void
}

// ── Type-glyph definitions ────────────────────────────────────────────────────

type JsonNodeType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  | 'xml-element' | 'xml-attr' | 'xml-text'

interface GlyphDef {
  sym: string
  color: string
}

const TYPE_GLYPHS: Record<JsonNodeType, GlyphDef> = {
  object:       { sym: '{}', color: '#0369a1' },
  array:        { sym: '[]', color: '#7c3aed' },
  string:       { sym: '"a', color: '#b45309' },
  number:       { sym: '#',  color: '#dc2626' },
  boolean:      { sym: '✓',  color: '#16a34a' },
  null:         { sym: '∅',  color: '#6b7280' },
  'xml-element':{ sym: '<>', color: '#0369a1' },
  'xml-attr':   { sym: '@',  color: '#7c3aed' },
  'xml-text':   { sym: '"a', color: '#b45309' },
}

// ── JSON tree node (internal representation) ──────────────────────────────────

interface JsonNode {
  key: string | null
  value: unknown
  type: JsonNodeType
  depth: number
  expanded: boolean
  children: JsonNode[]
}

function classifyType(value: unknown): JsonNodeType {
  if (value === null) return 'null'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'string') return 'string'
  if (Array.isArray(value)) return 'array'
  return 'object'
}

function buildTree(value: unknown, key: string | null, depth: number): JsonNode {
  const type = classifyType(value)
  const isContainer = type === 'object' || type === 'array'
  const children: JsonNode[] = []

  if (isContainer && value !== null) {
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        children.push(buildTree(item, String(i), depth + 1))
      })
    } else {
      Object.entries(value as Record<string, unknown>).forEach(([k, v]) => {
        children.push(buildTree(v, k, depth + 1))
      })
    }
  }

  return {
    key,
    value,
    type,
    depth,
    // Collapse containers at depth >= 3 by default; root always expanded
    expanded: depth < 3,
    children,
  }
}

function isContainer(type: JsonNodeType): boolean {
  return type === 'object' || type === 'array' || type === 'xml-element'
}

function countNodes(node: JsonNode): number {
  return 1 + node.children.reduce((acc, c) => acc + countNodes(c), 0)
}

function countVisible(node: JsonNode): number {
  if (!isContainer(node.type)) return 1
  const selfCount = 1
  if (!node.expanded) return selfCount
  return selfCount + node.children.reduce((acc, c) => acc + countVisible(c), 0)
}

// ── Tree node component ───────────────────────────────────────────────────────

interface TreeNodeProps {
  node: JsonNode
  selectedKey: string | null
  onToggle: (path: string) => void
  onSelect: (path: string) => void
  path: string
}

function TreeNode({ node, selectedKey, onToggle, onSelect, path }: TreeNodeProps) {
  const nodeIsContainer = isContainer(node.type)
  const glyph = TYPE_GLYPHS[node.type]
  const isSelected = selectedKey === path

  const indentPx = node.depth * 12

  // Value preview color for primitives
  function valueColor(type: JsonNodeType): string {
    if (type === 'string') return 'var(--st)'
    if (type === 'number') return 'var(--nu)'
    if (type === 'boolean' || type === 'null') return 'var(--bl)'
    return 'var(--ink3)'
  }

  function valueLabel(node: JsonNode): string {
    if (node.type === 'string') return `"${String(node.value).slice(0, 24)}${String(node.value).length > 24 ? '…' : ''}"`
    if (node.type === 'null') return 'null'
    return String(node.value)
  }

  return (
    <div>
      {/* Row */}
      <div
        onClick={() => {
          if (nodeIsContainer) onToggle(path)
          else onSelect(path)
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          paddingTop: 2,
          paddingBottom: 2,
          paddingRight: 6,
          paddingLeft: 8 + indentPx,
          cursor: 'pointer',
          background: isSelected ? 'var(--accentSoft)' : 'transparent',
          borderLeft: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
          userSelect: 'none',
        }}
      >
        {/* Chevron for containers */}
        {nodeIsContainer ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 12,
              height: 12,
              flexShrink: 0,
              color: 'var(--ink3)',
              transition: 'transform 0.15s',
              transform: node.expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          >
            <N2G name="chev-right" size={11} stroke={2} color="var(--ink3)" />
          </span>
        ) : (
          <span style={{ width: 12, flexShrink: 0 }} />
        )}

        {/* Type glyph chip */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 16,
            height: 14,
            flexShrink: 0,
            background: glyph.color + '14',
            color: glyph.color,
            borderRadius: 'var(--r-xs)',
            fontSize: 9,
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
          }}
        >
          {glyph.sym}
        </span>

        {/* Key label */}
        {node.key !== null && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11.5,
              fontWeight: 600,
              color: 'var(--ink2)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 80,
            }}
          >
            {node.key.length > 20 ? node.key.slice(0, 20) + '…' : node.key}
          </span>
        )}

        {/* Value / count */}
        {nodeIsContainer ? (
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 10.5,
              color: 'var(--muted)',
            }}
          >
            {node.type === 'array'
              ? `[${node.children.length}]`
              : `(${node.children.length})`}
          </span>
        ) : (
          <>
            <span style={{ color: 'var(--ink3)', fontSize: 11 }}>:</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: valueColor(node.type),
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 90,
              }}
            >
              {valueLabel(node)}
            </span>
          </>
        )}
      </div>

      {/* Children (only when expanded) */}
      {nodeIsContainer && node.expanded && (
        <div>
          {node.children.map((child, i) => (
            <TreeNode
              key={`${path}.${child.key ?? i}`}
              node={child}
              selectedKey={selectedKey}
              onToggle={onToggle}
              onSelect={onSelect}
              path={`${path}.${child.key ?? i}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── XML tree builder ──────────────────────────────────────────────────────────

function buildXmlTree(domNode: Element, key: string | null, depth: number): JsonNode {
  const children: JsonNode[] = []

  Array.from(domNode.attributes).forEach((attr) => {
    children.push({
      key: `@${attr.name}`,
      value: attr.value,
      type: 'xml-attr',
      depth: depth + 1,
      expanded: true,
      children: [],
    })
  })

  Array.from(domNode.childNodes).forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      children.push(buildXmlTree(child as Element, child.nodeName, depth + 1))
    } else if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent?.trim()
      if (text) {
        children.push({
          key: '#text',
          value: text,
          type: 'xml-text',
          depth: depth + 1,
          expanded: true,
          children: [],
        })
      }
    }
  })

  return {
    key: key ?? domNode.tagName,
    value: null,
    type: 'xml-element',
    depth,
    expanded: depth < 3,
    children,
  }
}

function parseXml(content: string): JsonNode | null {
  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'text/xml')
  if (doc.querySelector('parsererror')) return null
  const root = doc.documentElement
  if (!root) return null
  return buildXmlTree(root, root.tagName, 0)
}

// ── RightPanelTree ────────────────────────────────────────────────────────────

interface RightPanelTreeProps {
  content: string
  language?: string
}

// Mutate a cloned node tree by toggling expanded at a given path
function toggleNodeAt(node: JsonNode, pathParts: string[], depth: number): JsonNode {
  if (depth === pathParts.length) {
    return { ...node, expanded: !node.expanded }
  }
  const key = pathParts[depth]
  return {
    ...node,
    children: node.children.map((c, i) => {
      const matchKey = c.key ?? String(i)
      if (matchKey === key) {
        return toggleNodeAt(c, pathParts, depth + 1)
      }
      return c
    }),
  }
}

function parseForLanguage(content: string, language?: string): JsonNode | null {
  if (language === 'xml') return parseXml(content)
  try {
    return buildTree(JSON.parse(content), null, 0)
  } catch {
    return null
  }
}

function RightPanelTree({ content, language }: RightPanelTreeProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const [tree, setTree] = useState<JsonNode | null>(() => parseForLanguage(content, language))

  const [lastContent, setLastContent] = useState(content)
  if (content !== lastContent) {
    setLastContent(content)
    setTree(parseForLanguage(content, language))
  }

  if (tree === null) {
    const label = language === 'xml' ? 'XML inválido' : 'JSON inválido'
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          color: 'var(--err)',
          textAlign: 'center',
        }}
      >
        {label}
      </div>
    )
  }

  const totalNodes = countNodes(tree)
  const visibleNodes = countVisible(tree)

  function handleToggle(path: string) {
    if (!tree) return
    // path format: "root.key1.key2"
    const parts = path.split('.').slice(1) // skip "root"
    setTree((prev) => (prev ? toggleNodeAt(prev, parts, 0) : prev))
  }

  return (
    <>
      {/* Node count chip — rendered here so the parent can use it */}
      <div data-node-counts={`${visibleNodes}/${totalNodes}`} style={{ display: 'none' }} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        <TreeNode
          node={tree}
          selectedKey={selectedKey}
          onToggle={handleToggle}
          onSelect={setSelectedKey}
          path="root"
        />
      </div>
    </>
  )
}

// ── MdPreview ─────────────────────────────────────────────────────────────────

interface MdPreviewProps {
  content: string
}

function MdPreview({ content }: MdPreviewProps) {
  const html = marked(content) as string

  return (
    <>
      <style>{MD_STYLES}</style>
      <div
        className="md-preview"
        // marked is a trusted renderer; content is user's own text
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  )
}

const MD_STYLES = `
.md-preview {
  flex: 1;
  overflow-y: auto;
  padding: 14px 18px;
  font-family: var(--font-ui);
  color: var(--ink);
  line-height: 1.5;
  font-size: 13px;
}

.md-preview h1 {
  font-size: 19px;
  font-weight: 800;
  margin-bottom: 8px;
  letter-spacing: -0.3px;
}

.md-preview h2 {
  font-size: 15px;
  font-weight: 800;
  border-bottom: 1px solid var(--border);
  padding-bottom: 4px;
  margin-top: 16px;
  margin-bottom: 6px;
}

.md-preview h3 {
  font-size: 13px;
  font-weight: 700;
  margin-top: 12px;
  margin-bottom: 4px;
}

.md-preview p {
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 8px;
}

.md-preview blockquote {
  border-left: 3px solid var(--accent);
  background: var(--accentSoft);
  padding: 6px 10px;
  margin: 12px 0;
  border-radius: 0 var(--r-sm) var(--r-sm) 0;
  font-size: 13px;
  color: var(--ink2);
}

.md-preview blockquote p {
  margin-bottom: 0;
}

.md-preview code {
  font-family: var(--font-mono);
  font-size: 12px;
  background: var(--chromeD);
  border-radius: var(--r-xs);
  padding: 1px 4px;
}

.md-preview pre {
  margin: 10px 0;
  border-radius: var(--r-sm);
  overflow-x: auto;
}

.md-preview pre code {
  display: block;
  background: #0f172a;
  color: #e2e8f0;
  padding: 10px;
  border-radius: var(--r-sm);
  font-size: 12px;
}

.md-preview a {
  color: var(--accentDeep);
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--accentDeep) 33%, transparent);
}

.md-preview ul,
.md-preview ol {
  padding-left: 20px;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--ink2);
}

.md-preview li {
  line-height: 1.6;
}

.md-preview hr {
  border: 0;
  border-top: 1px dashed var(--borderD);
  margin: 14px 0;
}

.md-preview strong {
  font-weight: 700;
  color: var(--ink);
}

.md-preview em {
  font-style: italic;
}
`

// ── RightPanel (root component) ───────────────────────────────────────────────

export function RightPanel({ type, language, onClose }: RightPanelProps) {
  const content = useEditorContentStore((s) => s.content)

  let chipLabel: string
  if (type === 'tree') {
    const root = parseForLanguage(content, language)
    if (root) {
      chipLabel = `${countVisible(root)} / ${countNodes(root)} nodos`
    } else {
      chipLabel = language === 'xml' ? 'XML inválido' : 'JSON inválido'
    }
  } else {
    chipLabel = 'Markdown'
  }

  const isXml   = language === 'xml'
  const title    = type === 'tree' ? (isXml ? 'Árbol XML' : 'Árbol JSON') : 'Vista previa'
  const iconName = type === 'tree' ? 'chev-right' : 'eye'
  const footerText =
    type === 'preview'
      ? 'se actualiza al escribir · ⌘⇧V para alternar'
      : 'click en una clave para saltar al editor'

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
      }}
    >
      {/* ── Header (28px) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          height: 28,
          padding: '0 12px',
          background: '#eef0f3',
          borderBottom: '1px solid #e5e7eb',
          flexShrink: 0,
        }}
      >
        <N2G name={iconName} size={14} stroke={1.8} color="#6b7280" />

        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            fontWeight: 700,
            color: '#374151',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </span>

        {/* Count chip */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '1px 5px',
            background: '#e5e7eb',
            color: '#6b7280',
            fontSize: 10,
            fontWeight: 600,
            borderRadius: 999,
            whiteSpace: 'nowrap',
            marginLeft: 'auto',
          }}
        >
          {chipLabel}
        </span>

        {/* Close button */}
        <button
          onClick={onClose}
          title="Cerrar panel"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 16,
            height: 16,
            padding: 0,
            border: 0,
            background: 'transparent',
            cursor: 'pointer',
            color: '#9ca3af',
            borderRadius: 2,
            flexShrink: 0,
            fontSize: 11,
          }}
        >
          <N2G name="x" size={11} stroke={1.8} color="#9ca3af" />
        </button>
      </div>

      {/* ── Body (flex-1, scrollable) ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {type === 'tree' && <RightPanelTree content={content} language={language} />}
        {type === 'preview' && <MdPreview content={content} />}
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          background: '#eef0f3',
          borderTop: '1px solid #e5e7eb',
          flexShrink: 0,
        }}
      >
        <N2G name="info" size={12} stroke={1.6} color="#9ca3af" />
        <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'var(--font-ui)' }}>{footerText}</span>
      </div>
    </div>
  )
}
