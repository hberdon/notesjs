// notesjs V2 — versión seria y compacta · editor online colaborativo
// Nunito · paleta limpia · foco en sincronización y compartir documentos.

const { useState: useStateV2N } = React;

// ---------------- Tokens ----------------
const N2 = {
  ink: '#111827', ink2: '#374151', ink3: '#6b7280', muted: '#9ca3af', mutedL: '#cbd5e1',
  bg: '#ffffff', chrome: '#f7f7f9', chromeD: '#eef0f3', chromeDD: '#e5e7eb',
  border: '#e5e7eb', borderD: '#d1d5db',
  accent: '#10b981', accentDeep: '#047857', accentSoft: '#ecfdf5', accentBorder: '#a7f3d0', accentText: '#065f46',
  warn: '#f59e0b', err: '#ef4444',
  // collaborator hues (kept consistent across views)
  uAda:   '#10b981',  // emerald (me)
  uMarco: '#3b82f6',  // blue
  uSofia: '#ec4899',  // pink
  uIvan:  '#f59e0b',  // amber
};
const N2_FONT = '"Nunito", "Nunito Sans", system-ui, -apple-system, "Segoe UI", sans-serif';
const N2_MONO = '"JetBrains Mono", "Fira Code", ui-monospace, monospace';

// ---------------- Glyph (line-icon) ----------------
function N2G({ d, size = 14, color = N2.ink2, sw = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ flex: '0 0 auto' }}>
      {d}
    </svg>
  );
}

const N2I = {
  plus:    <><path d="M12 5v14M5 12h14" /></>,
  x:       <><path d="M6 6l12 12M18 6L6 18" /></>,
  chev:    <><path d="m6 9 6 6 6-6" /></>,
  chevR:   <><path d="m9 6 6 6-6 6" /></>,
  search:  <><circle cx="11" cy="11" r="6.5" /><path d="m20.5 20.5-4.6-4.6" /></>,
  cloud:   <><path d="M7 18a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.7 1A3.8 3.8 0 0 1 17 18z" /></>,
  cloudCk: <><path d="M7 18a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.7 1A3.8 3.8 0 0 1 17 18z" /><path d="m9 13 2 2 4-4" /></>,
  cloudUp: <><path d="M7 18a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.7 1A3.8 3.8 0 0 1 17 18z" /><path d="m9 14 3-3 3 3" /><path d="M12 11v6" /></>,
  fileNew: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /><path d="M12 11v6M9 14h6" /></>,
  open:    <><path d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></>,
  folder:  <><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></>,
  download:<><path d="M12 4v11" /><path d="m7 10 5 5 5-5" /><path d="M5 19h14" /></>,
  upload:  <><path d="M12 19V8" /><path d="m7 13 5-5 5 5" /><path d="M5 4h14" /></>,
  duplicate:<><rect x="8" y="3" width="13" height="13" rx="2" /><path d="M16 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h3" /></>,
  rename:  <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M14 6l4 4" /></>,
  move:    <><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M8 13h8M13 10l3 3-3 3" /></>,
  trash:   <><path d="M4 7h16M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13M9 7V4h6v3" /></>,
  history: <><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /><path d="M4 9a8 8 0 0 1 8-5" /></>,
  star:    <><path d="m12 4 2.6 5.4 6 .8-4.4 4.1 1.1 5.9L12 17.3 6.7 20.2l1.1-5.9L3.4 10.2l6-.8z" /></>,
  print:   <><rect x="6" y="3" width="12" height="6" /><rect x="3" y="9" width="18" height="9" rx="1.5" /><rect x="7" y="14" width="10" height="6" /></>,
  undo:    <><path d="M9 7 4 12l5 5" /><path d="M4 12h11a5 5 0 1 1 0 10h-3" /></>,
  redo:    <><path d="m15 7 5 5-5 5" /><path d="M20 12H9a5 5 0 1 0 0 10h3" /></>,
  cut:     <><circle cx="6" cy="6" r="2.6" /><circle cx="6" cy="18" r="2.6" /><path d="m8.3 7.7 11.7 11.7M8.3 16.3 20 4.6" /></>,
  copy:    <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  paste:   <><rect x="6" y="5" width="12" height="16" rx="1.5" /><rect x="9" y="3" width="6" height="4" rx="1" /></>,
  comment: <><path d="M5 7h14M5 12h11M5 17h8" /><path d="m17 14-3 6 3-2 3 2z" /></>,
  bold:    <><path d="M7 5h6a3 3 0 0 1 0 6H7zM7 11h7a3 3 0 0 1 0 6H7z" /></>,
  italic:  <><path d="M10 4h8M6 20h8M14 4 10 20" /></>,
  link:    <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7L11 7" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7L13 17" /></>,
  share:   <><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8 11 8-4M8 13l8 4" /></>,
  user:    <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  users:   <><circle cx="9" cy="9" r="3.5" /><circle cx="17" cy="10" r="2.8" /><path d="M3 19c0-3 3-5 6-5s6 2 6 5" /><path d="M15 19c0-2 2-4 4-4s3 1 3 3" /></>,
  globe:   <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5a13 13 0 0 1 0 17M12 3.5a13 13 0 0 0 0 17" /></>,
  lock:    <><rect x="5" y="11" width="14" height="9" rx="1.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  eye:     <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  edit:    <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M14 6l4 4" /></>,
  sun:     <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></>,
  moon:    <><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></>,
  type:    <><path d="M5 7V5h14v2M9 5v15M15 9v11M11 20h6" /></>,
  wrap:    <><path d="M4 6h16M4 12h13a3 3 0 0 1 0 6H10l3-3M4 18h6" /></>,
  hash:    <><path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16" /></>,
  map:     <><path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2z" /><path d="M9 4v16M15 6v16" /></>,
  keyboard:<><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10" /></>,
  info:    <><circle cx="12" cy="12" r="9" /><path d="M12 16v-5" /><circle cx="12" cy="8.2" r="0.8" fill="currentColor" stroke="none" /></>,
  send:    <><path d="m4 4 16 8-16 8 3-8z" /></>,
  check:   <><path d="m5 12 4 4 10-10" /></>,
  dot:     <><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" /></>,
  refresh: <><path d="M4 12a8 8 0 0 1 13.7-5.7L20 9" /><path d="M20 4v5h-5" /><path d="M20 12a8 8 0 0 1-13.7 5.7L4 15" /><path d="M4 20v-5h5" /></>,
  bell:    <><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
};

// ---------------- Avatar ----------------
function N2Avatar({ initials = 'AD', color = N2.uAda, size = 22, online, ring }) {
  return (
    <span style={{
      position: 'relative', display: 'inline-flex',
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      fontFamily: N2_FONT, fontWeight: 700, fontSize: size * 0.43,
      alignItems: 'center', justifyContent: 'center',
      boxShadow: ring ? `0 0 0 2px #fff, 0 0 0 ${ring === 'thick' ? 3.5 : 2.8}px ${color}` : 'none',
      flexShrink: 0,
    }}>
      {initials}
      {online && (
        <span style={{
          position: 'absolute', right: -1, bottom: -1,
          width: Math.max(6, size * 0.28), height: Math.max(6, size * 0.28),
          borderRadius: '50%',
          background: '#22c55e', boxShadow: '0 0 0 1.5px #fff',
        }} />
      )}
    </span>
  );
}

function N2AvatarStack({ users, size = 22, max = 4 }) {
  const show = users.slice(0, max);
  const extra = users.length - show.length;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {show.map((u, i) => (
        <span key={i} style={{ marginLeft: i === 0 ? 0 : -7, zIndex: show.length - i }}>
          <N2Avatar initials={u.in} color={u.c} size={size} online={u.on} />
        </span>
      ))}
      {extra > 0 && (
        <span style={{
          marginLeft: -7,
          width: size, height: size, borderRadius: '50%',
          background: '#fff', border: `1.5px solid ${N2.borderD}`,
          color: N2.ink2, fontFamily: N2_FONT, fontSize: size * 0.4, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>+{extra}</span>
      )}
    </span>
  );
}

// ---------------- Logo ----------------
function N2Logo({ size = 18 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: N2_FONT }}>
      <div style={{
        width: size, height: size,
        borderRadius: 5,
        display: 'grid', placeItems: 'center',
        background: N2.accent, color: '#fff',
        fontFamily: N2_MONO, fontWeight: 700, fontSize: size * 0.5,
        letterSpacing: -0.5,
      }}>nj</div>
      <div style={{ fontSize: size * 0.86, fontWeight: 800, color: N2.ink, letterSpacing: -0.2 }}>
        notes<span style={{ color: N2.accent }}>.js</span>
      </div>
    </div>
  );
}

// ---------------- File badge (ext label) ----------------
const N2_BADGES = {
  js:   { l: 'js',   c: '#f7c948', t: '#604c0c' },
  jsx:  { l: 'jsx',  c: '#94d3ff', t: '#0b3a5b' },
  ts:   { l: 'ts',   c: '#7dabff', t: '#0a2554' },
  md:   { l: 'md',   c: '#cfd6dc', t: '#243245' },
  json: { l: '{}',   c: '#ffc59a', t: '#5c2a08' },
  css:  { l: 'css',  c: '#d4b3ff', t: '#2e0c63' },
  html: { l: 'html', c: '#ff9b8a', t: '#5b1408' },
  yml:  { l: 'yml',  c: '#b6e7a8', t: '#1d4d12' },
  txt:  { l: 'txt',  c: '#e5e7eb', t: '#374151' },
};
function n2Badge(name) {
  const ext = (name.split('.').pop() || 'txt').toLowerCase();
  return N2_BADGES[ext] || N2_BADGES.txt;
}

// ---------------- Tabs ----------------
function N2Tab({ name, active, dirty, shared, onlineUsers = [] }) {
  const b = n2Badge(name);
  return (
    <div style={{
      position: 'relative',
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '0 10px',
      height: 30,
      borderRight: `1px solid ${N2.border}`,
      background: active ? N2.bg : 'transparent',
      color: active ? N2.ink : N2.ink2,
      fontFamily: N2_FONT, fontSize: 13, fontWeight: active ? 700 : 500,
      cursor: 'pointer',
      maxWidth: 220,
    }}>
      <span style={{
        height: 16, padding: '0 5px', borderRadius: 3,
        background: b.c, color: b.t,
        fontFamily: N2_MONO, fontWeight: 700, fontSize: 9.5,
        display: 'inline-flex', alignItems: 'center',
        textTransform: 'uppercase', letterSpacing: 0.2,
        flexShrink: 0,
      }}>{b.l}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      {shared && (
        <N2G d={N2I.users} size={11} color={active ? N2.accent : N2.ink3} />
      )}
      {onlineUsers.length > 0 && (
        <span style={{ display: 'inline-flex', marginLeft: -2 }}>
          {onlineUsers.slice(0, 2).map((u, i) => (
            <span key={i} style={{ marginLeft: i === 0 ? 0 : -4 }}>
              <N2Avatar initials={u.in} color={u.c} size={14} />
            </span>
          ))}
        </span>
      )}
      {dirty ? (
        <span title="cambios sin guardar" style={{
          width: 7, height: 7, borderRadius: '50%', background: N2.accent,
          flexShrink: 0,
        }} />
      ) : (
        <span style={{
          display: 'inline-grid', placeItems: 'center',
          width: 14, height: 14, borderRadius: 3, opacity: active ? 0.8 : 0.5,
          flexShrink: 0,
        }}>
          <N2G d={N2I.x} size={10} color={N2.ink3} />
        </span>
      )}
      {active && (
        <span style={{
          position: 'absolute', left: 0, right: 0, bottom: -1,
          height: 2, background: N2.accent,
        }} />
      )}
    </div>
  );
}

function N2TabBar({ tabs, activeIdx, presence }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch',
      height: 30,
      background: N2.chromeD,
      borderBottom: `1px solid ${N2.border}`,
      fontFamily: N2_FONT,
    }}>
      {/* Left: logo + sync state */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 14px',
        borderRight: `1px solid ${N2.border}`,
        background: N2.bg,
      }}>
        <N2Logo size={16} />
        <span title="todo sincronizado · web · sin instalación" style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 11, color: N2.accentDeep,
          padding: '2px 7px', background: N2.accentSoft, border: `1px solid ${N2.accentBorder}`,
          borderRadius: 999, fontWeight: 600,
        }}>
          <N2G d={N2I.cloudCk} size={11} color={N2.accentDeep} sw={1.7} />
          sincronizado
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'stretch', flex: 1, overflow: 'hidden' }}>
        {tabs.map((t, i) => (
          <N2Tab key={t.name + i} {...t} active={i === activeIdx} />
        ))}
        <button title="Nueva pestaña (⌘T)" style={{
          padding: '0 10px', height: 30,
          border: 0, borderRight: `1px solid ${N2.border}`,
          background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center',
        }}>
          <N2G d={N2I.plus} size={12} color={N2.ink3} />
        </button>
      </div>

      {/* Right: presence + share */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 12px',
        borderLeft: `1px solid ${N2.border}`,
        background: N2.bg,
      }}>
        {presence && <N2AvatarStack users={presence} size={20} />}
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', height: 22,
          border: `1px solid ${N2.accentDeep}`, borderRadius: 5,
          background: N2.accent, color: '#fff',
          fontFamily: N2_FONT, fontSize: 12, fontWeight: 700,
          cursor: 'pointer',
        }}>
          <N2G d={N2I.share} size={11} color="#fff" sw={2} />
          Compartir
        </button>
      </div>
    </div>
  );
}

Object.assign(window, {
  N2, N2_FONT, N2_MONO, N2G, N2I, N2Avatar, N2AvatarStack, N2Logo, N2Tab, N2TabBar, n2Badge, N2_BADGES,
});
