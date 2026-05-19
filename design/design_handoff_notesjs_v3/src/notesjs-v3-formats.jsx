// notesjs V3 — format detection · syntax highlight · right panel (tree / md preview)

const { N2: TF, N2_FONT: TFFS, N2_MONO: TFFM, N2G: TFG, N2I: TFI } = window;

// ============================================================
// FORMAT REGISTRY
// ============================================================
// pill colors per language
const V3_FORMATS = {
  js:   { label: 'JavaScript', short: 'JS',   bg: '#fef3c7', fg: '#854d0e', dot: '#eab308', highlight: true,  panel: null         },
  jsx:  { label: 'JSX',        short: 'JSX',  bg: '#dbeafe', fg: '#1e40af', dot: '#3b82f6', highlight: true,  panel: null         },
  ts:   { label: 'TypeScript', short: 'TS',   bg: '#dbeafe', fg: '#1e3a8a', dot: '#2563eb', highlight: true,  panel: null         },
  json: { label: 'JSON',       short: 'JSON', bg: '#fed7aa', fg: '#7c2d12', dot: '#f97316', highlight: true,  panel: 'tree'       },
  xml:  { label: 'XML',        short: 'XML',  bg: '#fecaca', fg: '#7f1d1d', dot: '#ef4444', highlight: true,  panel: 'tree'       },
  yml:  { label: 'YAML',       short: 'YML',  bg: '#dcfce7', fg: '#14532d', dot: '#22c55e', highlight: true,  panel: 'tree'       },
  md:   { label: 'Markdown',   short: 'MD',   bg: '#ede9fe', fg: '#5b21b6', dot: '#8b5cf6', highlight: true,  panel: 'preview'    },
  css:  { label: 'CSS',        short: 'CSS',  bg: '#e9d5ff', fg: '#581c87', dot: '#a855f7', highlight: true,  panel: null         },
  html: { label: 'HTML',       short: 'HTML', bg: '#ffe4e6', fg: '#9f1239', dot: '#f43f5e', highlight: true,  panel: null         },
  txt:  { label: 'Texto plano',short: 'TXT',  bg: '#e5e7eb', fg: '#374151', dot: '#6b7280', highlight: false, panel: null         },
};

function v3DetectFormat(name) {
  const ext = (name.split('.').pop() || 'txt').toLowerCase();
  return V3_FORMATS[ext] || V3_FORMATS.txt;
}

// ---------- Format pill (prominent, colored) ----------
function V3FormatPill({ fmt, size = 'm' }) {
  const sizes = {
    s: { pad: '1px 6px', fs: 10,  rad: 3 },
    m: { pad: '2px 8px', fs: 11,  rad: 4 },
    l: { pad: '3px 10px', fs: 12, rad: 5 },
  };
  const s = sizes[size];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: s.pad, borderRadius: s.rad,
      background: fmt.bg, color: fmt.fg,
      fontFamily: TFFS, fontWeight: 800, fontSize: s.fs,
      letterSpacing: 0.2, textTransform: 'uppercase',
      border: `1px solid ${fmt.fg}22`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: fmt.dot, boxShadow: `0 0 0 1.5px ${fmt.bg}` }} />
      {fmt.short}
    </span>
  );
}

// ============================================================
// SYNTAX HIGHLIGHTED CONTENT
// ============================================================

// Token color palette — same as V2 for consistency.
const V3_SYN = {
  kw:  '#0369a1', // blue
  fn:  '#7c3aed', // violet
  st:  '#b45309', // amber
  va:  '#111827', // ink
  pa:  '#374151',
  cm:  '#94a3b8', // muted comment
  nu:  '#dc2626', // red number
  bl:  '#16a34a', // bool/null green
  pu:  '#6b7280', // punctuation grey
  key: '#0e7490', // json key teal
};

// Tokenized JS sample (each line is array of [type, text] / strings).
const V3_CONTENT_JS = [
  [['cm', '// main.js — punto de entrada al servidor']],
  [['cm', '// si esto no arranca, mira config.json antes que nada']],
  [],
  [['kw', 'import '], ['va', 'startApp'], [' from '], ['st', '"./app.js"'], [';']],
  [['kw', 'import '], ['va', 'config'  ], [' from '], ['st', '"./config.json"'], [' assert { '], ['va', 'type'], [': '], ['st', '"json"'], [' };']],
  [],
  [['kw', 'function '], ['fn', 'saludo'], ['('], ['pa', 'nombre'], [' = '], ['st', '"dev"'], [') {']],
  [['  '], ['kw', 'return '], ['st', '`hola, ${'], ['va', 'nombre'], ['st', '}!`'], [';']],
  ['}'],
  [],
  [['fn', 'saludo'], ['('], ['va', 'config'], ['.'], ['va', 'user'], [');']],
  [],
  [['fn', 'startApp'], ['('], ['va', 'config'], [')']],
  [['  .then'], ['('], ['pa', 'srv'], [' => '], ['va', 'console'], ['.'], ['fn', 'log'], ['('], ['st', '"escuchando en"'], [', '], ['va', 'srv'], ['.'], ['va', 'port'], ['))']],
  [['  .catch'], ['('], ['va', 'console'], ['.'], ['fn', 'error'], [')'], [';']],
  [],
  [['cm', '// TODO: cargar variables de entorno desde .env']],
];

// Pretty-printed JSON content.
// Lines tokenized with json-aware types.
const V3_CONTENT_JSON = [
  ['{'],
  [['  '], ['key', '"name"'],        ['pu', ': '], ['st', '"ada"'], ['pu', ',']],
  [['  '], ['key', '"tags"'],        ['pu', ': ['], ['st', '"dev"'], ['pu', ', '], ['st', '"design"'], ['pu', '],']],
  [['  '], ['key', '"active"'],      ['pu', ': '], ['bl', 'true'], ['pu', ',']],
  [['  '], ['key', '"createdAt"'],   ['pu', ': '], ['st', '"2026-05-18"'], ['pu', ',']],
  [['  '], ['key', '"preferences"'], ['pu', ': {']],
  [['    '], ['key', '"theme"'],     ['pu', ': '], ['st', '"dark"'], ['pu', ',']],
  [['    '], ['key', '"fontSize"'],  ['pu', ': '], ['nu', '14'], ['pu', ',']],
  [['    '], ['key', '"shortcuts"'], ['pu', ': {']],
  [['      '], ['key', '"save"'],    ['pu', ': '], ['st', '"⌘S"'], ['pu', ',']],
  [['      '], ['key', '"open"'],    ['pu', ': '], ['st', '"⌘O"']],
  [['    }'], ['pu', ',']],
  [['    '], ['key', '"ligatures"'], ['pu', ': '], ['bl', 'true']],
  [['  },']],
  [['  '], ['key', '"drafts"'],      ['pu', ': [']],
  [['    {'], ['key', ' "id"'], ['pu', ': '], ['st', '"a1"'], ['pu', ', '], ['key', '"title"'], ['pu', ': '], ['st', '"primer borrador"'], ['pu', ' },']],
  [['    {'], ['key', ' "id"'], ['pu', ': '], ['st', '"a2"'], ['pu', ', '], ['key', '"title"'], ['pu', ': '], ['st', '"ideas martes"'], ['pu', ' }']],
  [['  ]']],
  ['}'],
];

// Markdown source (lines as plain strings; preview is rendered separately).
const V3_CONTENT_MD = [
  '# Notas reunión equipo',
  '',
  '*18 de mayo · 11:00 · sala 2*',
  '',
  '## Acuerdos',
  '',
  '- Lanzar **v2 pro** la semana del 27',
  '- Revisar diseño con Marco _jueves a las 11_',
  '- Sofía: pruebas de usabilidad antes del viernes',
  '',
  '## Pendientes',
  '',
  '1. Brief de marketing',
  '2. Checklist de QA',
  '3. Email a inversores',
  '',
  '> Recordatorio: avisar a soporte **antes** del despliegue.',
  '',
  '```bash',
  'npm run deploy --prod',
  '```',
  '',
  '---',
  '',
  'Ver [docs internas](https://example.com) para más detalles.',
];

// Sample plain text (fallback to V3_CONTENT_TXT from notesjs-v3.jsx via window if needed)
const V3_CONTENT_TXT = [
  'Lista de la compra · semana',
  '',
  '- huevos',
  '- leche de avena',
  '- pan integral',
  '- aceite de oliva',
  '- garbanzos cocidos',
  '- tomates pera',
  '',
  'Llamar al fontanero el martes',
  '  - preguntar por presupuesto',
  '  - comprobar disponibilidad jueves',
  '',
  'Ideas para el podcast',
  '  - entrevista con Marta',
  '  - temas de marzo: trabajo remoto, herramientas IA',
  '  - probar un episodio en directo',
];

// ---------- Tokenized line renderer ----------
function V3TokenLine({ raw }) {
  // raw : Array<string | [type, text]>
  if (!Array.isArray(raw) || raw.length === 0) return <span>&nbsp;</span>;
  return raw.map((p, i) => {
    if (typeof p === 'string') return <span key={i}>{p}</span>;
    if (Array.isArray(p)) {
      if (p.length === 1) return <span key={i}>{p[0]}</span>;
      const [type, text] = p;
      const color = V3_SYN[type] || TF.ink;
      const italic = type === 'cm';
      return <span key={i} style={{ color, fontStyle: italic ? 'italic' : 'normal' }}>{text}</span>;
    }
    return null;
  });
}

// ---------- Highlighted editor body ----------
function V3CodeBody({ lines, caretLine, caretCol, plain }) {
  return (
    <>
      {lines.map((row, i) => {
        const current = i === caretLine;
        let inner;
        if (plain) {
          inner = (
            <span>
              {current
                ? (() => {
                    const s = row;
                    const a = s.slice(0, caretCol);
                    const b = s.slice(caretCol);
                    return (
                      <>
                        {a}
                        <span style={{
                          display: 'inline-block', width: 1.5, height: '1.05em',
                          background: TF.ink, verticalAlign: 'middle', margin: '0 -0.5px -2px 0',
                          animation: 'njBlink 1.05s steps(2, end) infinite',
                        }} />
                        {b}
                      </>
                    );
                  })()
                : (row === '' ? <>&nbsp;</> : row)}
            </span>
          );
        } else {
          inner = (
            <>
              <V3TokenLine raw={row} />
              {current && (
                <span style={{
                  display: 'inline-block', width: 1.5, height: '1.05em',
                  background: TF.ink, verticalAlign: 'middle', margin: '0 -0.5px -2px 0',
                  animation: 'njBlink 1.05s steps(2, end) infinite',
                }} />
              )}
            </>
          );
        }
        return (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '40px 1fr', alignItems: 'baseline',
            lineHeight: 1.65,
            background: current ? '#f8fafc' : 'transparent',
            borderLeft: current ? `2px solid ${TF.accent}` : '2px solid transparent',
          }}>
            <div style={{
              textAlign: 'right', paddingRight: 10,
              color: current ? TF.ink : TF.muted,
              fontFamily: TFFM, fontSize: 11, fontWeight: current ? 700 : 400,
              userSelect: 'none',
            }}>{i + 1}</div>
            <div style={{ fontFamily: TFFM, fontSize: 13.5, whiteSpace: 'pre' }}>{inner}</div>
          </div>
        );
      })}
    </>
  );
}

// ============================================================
// RIGHT PANEL — JSON tree
// ============================================================
const V3_JSON_TREE = {
  type: 'object', label: 'root', count: 5,
  children: [
    { type: 'string', key: 'name',      value: '"ada"' },
    { type: 'array',  key: 'tags',      count: 2, children: [
      { type: 'string', key: '0', value: '"dev"' },
      { type: 'string', key: '1', value: '"design"' },
    ]},
    { type: 'bool',   key: 'active',    value: 'true' },
    { type: 'string', key: 'createdAt', value: '"2026-05-18"' },
    { type: 'object', key: 'preferences', count: 3, expanded: true, children: [
      { type: 'string', key: 'theme',    value: '"dark"' },
      { type: 'number', key: 'fontSize', value: '14' },
      { type: 'object', key: 'shortcuts', count: 2, expanded: true, children: [
        { type: 'string', key: 'save', value: '"⌘S"', highlight: true },
        { type: 'string', key: 'open', value: '"⌘O"' },
      ]},
      { type: 'bool',   key: 'ligatures', value: 'true' },
    ]},
    { type: 'array',  key: 'drafts',    count: 2, collapsed: true },
  ],
};

const V3_TYPE_GLYPH = {
  object: { sym: '{}', c: '#0369a1' },
  array:  { sym: '[]', c: '#7c3aed' },
  string: { sym: '"a',  c: '#b45309' },
  number: { sym: '#',  c: '#dc2626' },
  bool:   { sym: '✓',  c: '#16a34a' },
  null:   { sym: '∅',  c: '#6b7280' },
};

function V3TreeNode({ node, depth = 0, isLast }) {
  const isContainer = node.type === 'object' || node.type === 'array';
  const expanded = node.expanded !== false && !node.collapsed && isContainer;
  const glyph = V3_TYPE_GLYPH[node.type];
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '2px 6px 2px ' + (8 + depth * 12) + 'px',
        background: node.highlight ? TF.accentSoft : 'transparent',
        borderLeft: node.highlight ? `2px solid ${TF.accent}` : '2px solid transparent',
        cursor: 'pointer',
        fontFamily: TFFM, fontSize: 11.5, lineHeight: 1.4,
      }}>
        {isContainer ? (
          <span style={{
            display: 'inline-flex', justifyContent: 'center', alignItems: 'center',
            width: 12, height: 12, color: TF.ink3, flexShrink: 0,
          }}>
            <TFG d={TFI.chev} size={11} color={TF.ink3} sw={2}
              style={{ transform: expanded ? 'none' : 'rotate(-90deg)' }} />
          </span>
        ) : (
          <span style={{ width: 12, flexShrink: 0 }} />
        )}
        <span style={{
          width: 16, height: 14, flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: glyph.c + '14', color: glyph.c,
          borderRadius: 3, fontSize: 9, fontWeight: 800,
        }}>{glyph.sym}</span>
        <span style={{ color: TF.ink, fontWeight: 600 }}>{node.key}</span>
        {isContainer ? (
          <span style={{ color: TF.muted, fontFamily: TFFS, fontSize: 10.5 }}>
            {node.type === 'array' ? `[${node.count}]` : `{${node.count}}`}
          </span>
        ) : (
          <>
            <span style={{ color: TF.ink3 }}>:</span>
            <span style={{ color: V3_SYN[node.type === 'number' ? 'nu' : (node.type === 'bool' ? 'bl' : 'st')], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {node.value}
            </span>
          </>
        )}
      </div>
      {expanded && node.children && (
        <div>
          {node.children.map((c, i) => (
            <V3TreeNode key={c.key + i} node={c} depth={depth + 1} isLast={i === node.children.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function V3RightPanelTree() {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
      <V3TreeNode node={V3_JSON_TREE} />
    </div>
  );
}

// ============================================================
// RIGHT PANEL — Markdown preview
// ============================================================
function V3MdPreview() {
  // Sketched-out rendered preview. Static, wireframe-fidelity.
  const linkC = TF.accentDeep;
  return (
    <div style={{
      flex: 1, overflow: 'auto', padding: '14px 18px',
      fontFamily: TFFS, color: TF.ink, lineHeight: 1.5,
    }}>
      <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, letterSpacing: -0.3, color: TF.ink }}>
        Notas reunión equipo
      </h1>
      <div style={{ marginTop: 4, fontStyle: 'italic', color: TF.ink3, fontSize: 13 }}>
        18 de mayo · 11:00 · sala 2
      </div>

      <h2 style={{ margin: '18px 0 6px', fontSize: 15, fontWeight: 800, color: TF.ink, borderBottom: `1px solid ${TF.border}`, paddingBottom: 4 }}>
        Acuerdos
      </h2>
      <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: 13.5, color: TF.ink2 }}>
        <li>Lanzar <b style={{ color: TF.ink }}>v2 pro</b> la semana del 27</li>
        <li>Revisar diseño con Marco <i>jueves a las 11</i></li>
        <li>Sofía: pruebas de usabilidad antes del viernes</li>
      </ul>

      <h2 style={{ margin: '18px 0 6px', fontSize: 15, fontWeight: 800, color: TF.ink, borderBottom: `1px solid ${TF.border}`, paddingBottom: 4 }}>
        Pendientes
      </h2>
      <ol style={{ margin: 0, padding: '0 0 0 20px', fontSize: 13.5, color: TF.ink2 }}>
        <li>Brief de marketing</li>
        <li>Checklist de QA</li>
        <li>Email a inversores</li>
      </ol>

      <blockquote style={{
        margin: '14px 0', padding: '8px 12px',
        background: TF.chrome, borderLeft: `3px solid ${TF.accent}`,
        fontSize: 13, color: TF.ink2, borderRadius: '0 4px 4px 0',
      }}>
        Recordatorio: avisar a soporte <b>antes</b> del despliegue.
      </blockquote>

      <pre style={{
        margin: '12px 0',
        padding: '8px 10px', background: '#0f172a', color: '#e2e8f0',
        borderRadius: 5, fontFamily: TFFM, fontSize: 12, overflow: 'auto',
      }}>
        <span style={{ color: '#22d3ee' }}>npm</span> <span style={{ color: '#a3e635' }}>run</span> deploy <span style={{ color: '#f59e0b' }}>--prod</span>
      </pre>

      <hr style={{ margin: '16px 0', border: 0, borderTop: `1px dashed ${TF.borderD}` }} />

      <div style={{ fontSize: 13, color: TF.ink2 }}>
        Ver <a href="#" style={{ color: linkC, fontWeight: 700, textDecoration: 'none', borderBottom: `1px solid ${linkC}55` }}>docs internas</a> para más detalles.
      </div>
    </div>
  );
}

// ============================================================
// RIGHT PANEL — Container
// ============================================================
function V3RightPanel({ kind, fmt }) {
  if (!kind) return null;
  return (
    <div style={{
      width: 290, minWidth: 290,
      borderLeft: `1px solid ${TF.border}`,
      background: kind === 'preview' ? '#fff' : TF.chrome,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 12px',
        height: 28,
        borderBottom: `1px solid ${TF.border}`,
        background: TF.chromeD,
      }}>
        <TFG d={kind === 'preview' ? TFI.eye : TFI.folder} size={12} color={TF.ink2} />
        <span style={{ fontFamily: TFFS, fontSize: 11.5, fontWeight: 700, color: TF.ink }}>
          {kind === 'preview' ? 'Vista previa' : 'Estructura'}
        </span>
        <span style={{ fontFamily: TFFS, fontSize: 10.5, color: TF.ink3 }}>
          {kind === 'preview' ? '· markdown renderizado' : '· navegable'}
        </span>
        <div style={{ flex: 1 }} />
        {kind === 'tree' && (
          <span style={{
            fontFamily: TFFS, fontSize: 10, color: TF.ink3,
            padding: '0 5px', border: `1px solid ${TF.border}`, borderRadius: 3, background: '#fff',
          }}>5 / 12</span>
        )}
        <button title="Cerrar panel" style={{
          width: 18, height: 18, padding: 0,
          border: 0, background: 'transparent', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TFG d={TFI.x} size={10} color={TF.ink3} />
        </button>
      </div>

      {kind === 'tree'    && <V3RightPanelTree />}
      {kind === 'preview' && <V3MdPreview />}

      {/* Footer hint */}
      <div style={{
        padding: '6px 12px',
        borderTop: `1px solid ${TF.border}`,
        background: TF.chromeD,
        fontFamily: TFFS, fontSize: 10.5, color: TF.muted,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <TFG d={TFI.info} size={10} color={TF.muted} />
        {kind === 'preview'
          ? 'se actualiza al escribir · ⌘⇧V para alternar'
          : 'click en una clave para saltar al editor'}
      </div>
    </div>
  );
}

// ============================================================
// EDITOR HEADER — filename + format pill + panel toggle
// ============================================================
function V3EditorHeader({ name, fmt, rightPanel, onToggle }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '0 14px',
      height: 30,
      borderBottom: `1px solid ${TF.border}`,
      background: '#fff',
      fontFamily: TFFS,
    }}>
      <span style={{ fontSize: 13.5, fontWeight: 800, color: TF.ink, letterSpacing: -0.2 }}>{name}</span>
      <V3FormatPill fmt={fmt} size="m" />
      <span style={{ fontFamily: TFFS, fontSize: 11, color: TF.ink3 }}>· detectado automáticamente</span>
      <div style={{ flex: 1 }} />

      {/* Action: format / minify (inline shortcut) */}
      <button title="Formatear documento (⌘⇧F)" style={{
        height: 22, padding: '0 9px',
        border: `1px solid ${TF.border}`, borderRadius: 4,
        background: '#fff', color: TF.ink2,
        fontFamily: TFFS, fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 5,
      }}>
        <TFG d={TFI.format || <><path d="M5 6h14M5 12h9M5 18h14" /></>} size={11} color={TF.ink2} sw={1.8} />
        Formatear
      </button>

      {/* Panel toggle group */}
      {fmt.panel && (
        <div style={{
          display: 'inline-flex',
          border: `1px solid ${TF.border}`, borderRadius: 4, background: '#fff',
          height: 22, overflow: 'hidden',
        }}>
          {[
            { id: null,        ic: <><path d="M3 6h18M3 12h11M3 18h18" /></>, t: 'Solo editor' },
            { id: fmt.panel,   ic: fmt.panel === 'preview' ? TFI.eye : TFI.folder, t: fmt.panel === 'preview' ? 'Vista previa' : 'Árbol' },
          ].map((b) => {
            const on = (rightPanel || null) === (b.id || null);
            return (
              <button key={String(b.id)} title={b.t} style={{
                height: '100%', padding: '0 9px',
                border: 0, borderRight: b.id === null ? `1px solid ${TF.border}` : 0,
                background: on ? TF.accentSoft : 'transparent',
                color: on ? TF.accentDeep : TF.ink3, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontFamily: TFFS, fontSize: 11, fontWeight: 700,
              }}>
                <TFG d={b.ic} size={11} color={on ? TF.accentDeep : TF.ink3} sw={1.8} />
                {b.t}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  V3_FORMATS, v3DetectFormat, V3FormatPill,
  V3_CONTENT_JS, V3_CONTENT_JSON, V3_CONTENT_MD, V3_CONTENT_TXT,
  V3CodeBody, V3RightPanel, V3EditorHeader,
});
