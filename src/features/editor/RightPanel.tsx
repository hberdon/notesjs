// RightPanel — 290px side panel for JSON tree navigation and Markdown preview.
// Design reference: design/design_handoff_notesjs_v3/README.md § V3RightPanel, V3TreeNode, V3MdPreview

import { useState } from 'react'
import { marked } from 'marked'
import { N2G } from '@/shared/components/N2G'

// ── Public interface ──────────────────────────────────────────────────────────

export interface RightPanelProps {
  type: 'tree' | 'preview'
  content: string   // raw editor content
  onClose: () => void
}

// ── Type-glyph definitions ────────────────────────────────────────────────────

type JsonNodeType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'

interface GlyphDef {
  sym: string
  color: string
}

const TYPE_GLYPHS: Record<JsonNodeType, GlyphDef> = {
  object:  { sym: '{}', color: '#0369a1' },
  array:   { sym: '[]', color: '#7c3aed' },
  string:  { sym: '"a', color: '#b45309' },
  number:  { sym: '#',  color: '#dc2626' },
  boolean: { sym: '✓',  color: '#16a34a' },
  null:    { sym: '∅',  color: '#6b7280' },
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

// Count total nodes recursively
function countNodes(node: JsonNode): number {
  return 1 + node.children.reduce((acc, c) => acc + countNodes(c), 0)
}

// Count visible (rendered) nodes — only children of expanded containers
function countVisible(node: JsonNode): number {
  if (node.type !== 'object' && node.type !== 'array') return 1
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
  const isContainer = node.type === 'object' || node.type === 'array'
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
          if (isContainer) onToggle(path)
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
        {isContainer ? (
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
        {isContainer ? (
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 10.5,
              color: 'var(--muted)',
            }}
          >
            {node.type === 'array'
              ? `[${node.children.length}]`
              : `{${node.children.length}}`}
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
      {isContainer && node.expanded && (
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

// ── RightPanelTree ────────────────────────────────────────────────────────────

interface RightPanelTreeProps {
  content: string
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

function RightPanelTree({ content }: RightPanelTreeProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  let parsedOk = false
  let parsed: unknown = null

  try {
    parsed = JSON.parse(content)
    parsedOk = true
  } catch {
    parsedOk = false
  }

  const [tree, setTree] = useState<JsonNode | null>(() => {
    if (!parsedOk || parsed === null) return null
    return buildTree(parsed, null, 0)
  })

  // If content changed, rebuild tree
  // We use a ref to compare previous content without re-subscribing
  const [lastContent, setLastContent] = useState(content)
  if (content !== lastContent) {
    setLastContent(content)
    try {
      const newParsed = JSON.parse(content)
      setTree(buildTree(newParsed, null, 0))
    } catch {
      setTree(null)
    }
  }

  if (!parsedOk || tree === null) {
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
        JSON inválido
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

export function RightPanel({ type, content, onClose }: RightPanelProps) {
  // For the tree chip we need node counts; track them via a simple parse here
  // so the header can display them without re-doing the full tree render.
  let chipLabel: string
  if (type === 'tree') {
    try {
      const parsed = JSON.parse(content)
      const root = buildTree(parsed, null, 0)
      const total = countNodes(root)
      const visible = countVisible(root)
      chipLabel = `${visible} / ${total} nodos`
    } catch {
      chipLabel = 'JSON inválido'
    }
  } else {
    chipLabel = 'Markdown'
  }

  const title = type === 'tree' ? 'Árbol JSON' : 'Vista previa'
  const iconName = type === 'tree' ? 'chev-right' : 'eye'
  const footerText =
    type === 'preview'
      ? 'se actualiza al escribir · ⌘⇧V para alternar'
      : 'click en una clave para saltar al editor'

  return (
    <div
      style={{
        width: 290,
        flexShrink: 0,
        borderLeft: '1px solid #e5e7eb',
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
        {type === 'tree' && <RightPanelTree content={content} />}
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
