// notesjs V3 — TIER FREE · sustituto de Notepad/Notas
// Menús estrechos tipo dropdown clásico (más ligeros que V2), funcionalidades mínimas.
// Compartir = enlace público tipo pastebin (sin colaboración en vivo).
// Reusa los tokens N2 (Nunito) de window.

const { N2: T, N2_FONT: TFS, N2_MONO: TFM, N2G: TG, N2I: TI, N2Avatar: TAv } = window;

// ============================================================
// LOGIN SCREEN
// ============================================================
function V3LoginButton({ icon, label, sub, primary, ghost }) {
  return (
    <button style={{
      display: 'flex', alignItems: 'center', gap: 12,
      width: '100%', padding: '11px 14px',
      border: `1px solid ${primary ? T.accentDeep : T.border}`,
      borderRadius: 7,
      background: primary ? T.accent : (ghost ? 'transparent' : '#fff'),
      color: primary ? '#fff' : T.ink,
      fontFamily: TFS, fontSize: 13.5, fontWeight: 700,
      cursor: 'pointer',
      textAlign: 'left',
      boxShadow: primary ? '0 1px 0 rgba(0,0,0,0.04), 0 1px 2px rgba(16,185,129,0.25)' : '0 1px 0 rgba(0,0,0,0.02)',
      transition: 'transform .12s',
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: 4,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: primary ? 'rgba(255,255,255,0.18)' : (ghost ? T.chrome : T.chrome),
        color: primary ? '#fff' : T.ink2,
      }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ lineHeight: 1.15 }}>{label}</div>
        {sub && (
          <div style={{
            fontSize: 11.5, fontWeight: 500, marginTop: 2,
            color: primary ? 'rgba(255,255,255,0.85)' : T.ink3,
          }}>{sub}</div>
        )}
      </div>
      <TG d={TI.chevR} size={13} color={primary ? '#fff' : T.muted} sw={2} />
    </button>
  );
}

// Brand icons (inline svg, monochrome-styled)
const V3_GOOGLE_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M21.6 12.23c0-.7-.06-1.36-.18-2H12v3.78h5.4a4.62 4.62 0 0 1-2 3.03v2.51h3.24c1.9-1.75 2.96-4.32 2.96-7.32z" fill="#4285F4" />
    <path d="M12 22c2.7 0 4.97-.9 6.62-2.43l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22z" fill="#34A853" />
    <path d="M6.41 13.9a6 6 0 0 1 0-3.8V7.5H3.07a10 10 0 0 0 0 9l3.34-2.6z" fill="#FBBC05" />
    <path d="M12 5.94a5.4 5.4 0 0 1 3.84 1.5l2.87-2.86A10 10 0 0 0 12 2a10 10 0 0 0-8.93 5.5l3.34 2.6C7.2 7.7 9.4 5.94 12 5.94z" fill="#EA4335" />
  </svg>
);

const V3_GITHUB_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={T.ink}>
    <path d="M12 .5C5.65.5.5 5.66.5 12.04c0 5.09 3.29 9.4 7.86 10.92.57.1.78-.25.78-.55v-1.95c-3.2.7-3.87-1.36-3.87-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.78 2.7 1.27 3.36.97.1-.76.4-1.27.73-1.56-2.55-.3-5.24-1.29-5.24-5.74 0-1.27.45-2.3 1.18-3.12-.12-.3-.51-1.48.11-3.08 0 0 .97-.32 3.18 1.2.92-.26 1.91-.39 2.9-.4 1 0 1.98.14 2.9.4 2.21-1.51 3.18-1.2 3.18-1.2.63 1.6.23 2.78.11 3.08.74.82 1.18 1.85 1.18 3.12 0 4.46-2.7 5.43-5.27 5.72.42.36.78 1.07.78 2.17v3.21c0 .3.21.66.79.55C20.21 21.43 23.5 17.13 23.5 12.04 23.5 5.66 18.35.5 12 .5z" />
  </svg>
);

const V3_MAIL_ICON = <TG d={<><rect x="3" y="6" width="18" height="13" rx="2" /><path d="m3 8 9 6 9-6" /></>} size={14} color={T.ink2} />;
const V3_GUEST_ICON = <TG d={TI.user} size={14} color={T.ink2} />;

function V3Login() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: `radial-gradient(circle at 20% 0%, ${T.accentSoft} 0%, transparent 40%), radial-gradient(circle at 100% 100%, #e0f2fe 0%, transparent 35%), ${T.chrome}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: TFS, color: T.ink,
      padding: 24, boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle dot pattern */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(${T.borderD} 1px, transparent 1px)`,
        backgroundSize: '22px 22px',
        opacity: 0.25,
      }} />

      <div style={{ display: 'flex', gap: 60, alignItems: 'center', maxWidth: 880, position: 'relative' }}>
        {/* Left — pitch */}
        <div style={{ flex: 1, maxWidth: 360 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: T.accent, color: '#fff',
              display: 'grid', placeItems: 'center',
              fontFamily: TFM, fontWeight: 800, fontSize: 17, letterSpacing: -1,
            }}>nj</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}>
              notes<span style={{ color: T.accent }}>.js</span>
            </div>
          </div>
          <div style={{ marginTop: 14, fontSize: 26, fontWeight: 800, lineHeight: 1.15, letterSpacing: -0.6 }}>
            Tu bloc de notas, en cualquier navegador.
          </div>
          <div style={{ marginTop: 10, fontSize: 14, color: T.ink2, lineHeight: 1.45 }}>
            Como el Bloc de notas de Windows o Notas de Mac, pero web. <b>Sin instalación</b>, abre una pestaña y empieza a escribir. Tus notas te siguen donde inicies sesión.
          </div>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Cero descargas', 'funciona en cualquier navegador moderno'],
              ['Sincroniza al iniciar sesión', 'tus notas aparecen en cualquier dispositivo'],
              ['Comparte por enlace', 'genera un enlace público estilo pastebin'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: T.accentSoft, color: T.accentDeep,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 1,
                }}>
                  <TG d={TI.check} size={11} color={T.accentDeep} sw={2.4} />
                </span>
                <div style={{ fontSize: 13, color: T.ink2 }}>
                  <b style={{ color: T.ink }}>{k}.</b> {v}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — login card */}
        <div style={{
          width: 360,
          background: '#fff',
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: 22,
          boxShadow: '0 12px 30px -12px rgba(15,23,42,0.18), 0 2px 4px rgba(15,23,42,0.04)',
        }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: T.ink, letterSpacing: -0.2 }}>
            Empieza a escribir
          </div>
          <div style={{ fontSize: 13, color: T.ink3, marginTop: 3 }}>
            Crea una cuenta o entra como invitado.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            <V3LoginButton icon={V3_GOOGLE_ICON}  label="Continuar con Google" />
            <V3LoginButton icon={V3_GITHUB_ICON}  label="Continuar con GitHub" />
            <V3LoginButton icon={V3_MAIL_ICON}    label="Crear cuenta con email" sub="email + contraseña" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 10px' }}>
            <span style={{ flex: 1, height: 1, background: T.border }} />
            <span style={{ fontSize: 11, color: T.muted, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 700 }}>o</span>
            <span style={{ flex: 1, height: 1, background: T.border }} />
          </div>

          <V3LoginButton icon={V3_GUEST_ICON} label="Continuar como invitado" sub="tus notas se quedan en este navegador" ghost />

          <div style={{ fontSize: 12, color: T.ink3, marginTop: 14, lineHeight: 1.45 }}>
            ¿Ya tienes cuenta? <a href="#" style={{ color: T.accentDeep, fontWeight: 700, textDecoration: 'none' }}>Inicia sesión →</a>
          </div>

          <div style={{
            marginTop: 14, paddingTop: 12, borderTop: `1px dashed ${T.border}`,
            fontSize: 11, color: T.muted, lineHeight: 1.5,
          }}>
            Al continuar aceptas los <a href="#" style={{ color: T.ink2 }}>términos</a> y la <a href="#" style={{ color: T.ink2 }}>política de privacidad</a>.
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// V3 EDITOR APP — light & narrow
// ============================================================

// ---- Tabs (no presence, no shared) ----
function V3Tab({ name, active, dirty }) {
  const b = window.n2Badge(name);
  return (
    <div style={{
      position: 'relative',
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '0 10px',
      height: 30,
      borderRight: `1px solid ${T.border}`,
      background: active ? '#fff' : 'transparent',
      color: active ? T.ink : T.ink2,
      fontFamily: TFS, fontSize: 13, fontWeight: active ? 700 : 500,
      cursor: 'pointer',
      maxWidth: 200,
    }}>
      <span style={{
        height: 16, padding: '0 5px', borderRadius: 3,
        background: b.c, color: b.t,
        fontFamily: TFM, fontWeight: 700, fontSize: 9.5,
        display: 'inline-flex', alignItems: 'center',
        textTransform: 'uppercase', letterSpacing: 0.2,
        flexShrink: 0,
      }}>{b.l}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      {dirty ? (
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.accent, flexShrink: 0 }} />
      ) : (
        <span style={{ display: 'inline-grid', placeItems: 'center', width: 14, height: 14, opacity: active ? 0.8 : 0.5, flexShrink: 0 }}>
          <TG d={TI.x} size={10} color={T.ink3} />
        </span>
      )}
      {active && (
        <span style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 2, background: T.accent }} />
      )}
    </div>
  );
}

function V3TabBar({ tabs, activeIdx, plan = 'free', user = { in: 'AD', c: T.uAda } }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch',
      height: 30,
      background: T.chromeD,
      borderBottom: `1px solid ${T.border}`,
      fontFamily: TFS,
    }}>
      {/* Logo + plan chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', borderRight: `1px solid ${T.border}`, background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 16, height: 16, borderRadius: 4,
            background: T.accent, color: '#fff',
            display: 'grid', placeItems: 'center',
            fontFamily: TFM, fontWeight: 800, fontSize: 8.5, letterSpacing: -0.5,
          }}>nj</div>
          <span style={{ fontSize: 13, fontWeight: 800, color: T.ink, letterSpacing: -0.2 }}>
            notes<span style={{ color: T.accent }}>.js</span>
          </span>
        </div>
        <span style={{
          fontFamily: TFS, fontSize: 10, color: T.ink3, fontWeight: 700,
          padding: '1px 6px', background: T.chrome, border: `1px solid ${T.border}`, borderRadius: 999,
          textTransform: 'uppercase', letterSpacing: 0.6,
        }}>{plan}</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'stretch', flex: 1, overflow: 'hidden' }}>
        {tabs.map((t, i) => <V3Tab key={t.name + i} {...t} active={i === activeIdx} />)}
        <button title="Nueva nota (⌘N)" style={{
          padding: '0 10px', height: 30,
          border: 0, borderRight: `1px solid ${T.border}`,
          background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center',
        }}>
          <TG d={TI.plus} size={12} color={T.ink3} />
        </button>
      </div>

      {/* Right: account avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', borderLeft: `1px solid ${T.border}`, background: '#fff' }}>
        <span style={{ fontSize: 11.5, color: T.ink3 }}>ada@notesjs.dev</span>
        <TAv initials={user.in} color={user.c} size={20} />
      </div>
    </div>
  );
}

// ---- Menu strip (sheets are NARROW + anchored under the item) ----
const V3_MENUS = [
  { id: 'archivo',   label: 'Archivo',   width: 260, anchor: 6   },
  { id: 'editar',    label: 'Editar',    width: 240, anchor: 80  },
  { id: 'buscar',    label: 'Buscar',    width: 260, anchor: 146 },
  { id: 'compartir', label: 'Compartir', width: 300, anchor: 214 },
  { id: 'ver',       label: 'Ver',       width: 250, anchor: 304 },
  { id: 'ayuda',     label: 'Ayuda',     width: 230, anchor: 358 },
];

function V3MenuStrip({ openId }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch',
      height: 28,
      background: '#fff',
      borderBottom: `1px solid ${T.border}`,
      fontFamily: TFS,
      paddingLeft: 4,
      position: 'relative',
    }}>
      {V3_MENUS.map((m) => {
        const on = m.id === openId;
        return (
          <div key={m.id} style={{
            position: 'relative',
            padding: '0 12px',
            display: 'inline-flex', alignItems: 'center',
            fontSize: 12.5, fontWeight: on ? 700 : 600,
            color: on ? T.ink : T.ink2,
            background: on ? T.chrome : 'transparent',
            borderLeft: on ? `1px solid ${T.border}` : '1px solid transparent',
            borderRight: on ? `1px solid ${T.border}` : '1px solid transparent',
            marginBottom: on ? -1 : 0,
            cursor: 'pointer',
          }}>
            {m.label}
          </div>
        );
      })}
      <div style={{ flex: 1 }} />

      {/* right: just ⌘K + autosave chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontFamily: TFS, fontSize: 11, color: T.accentDeep, fontWeight: 600,
        }}>
          <TG d={TI.cloudCk} size={11} color={T.accentDeep} sw={1.8} />
          guardado
        </span>
        <span style={{
          fontFamily: TFM, fontSize: 10, color: T.ink3,
          padding: '1px 5px', background: T.chrome, border: `1px solid ${T.border}`, borderRadius: 3,
        }}>⌘K</span>
      </div>
    </div>
  );
}

// ---- Narrow sheet primitives ----
function V3MItem({ icon, label, shortcut, sub, danger, accent, on }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '16px 1fr auto', alignItems: 'center', gap: 9,
      padding: '5px 10px', borderRadius: 4,
      background: on ? T.accentSoft : 'transparent',
      fontFamily: TFS, color: danger ? T.err : T.ink,
      cursor: 'pointer',
    }}>
      <span style={{ display: 'inline-flex', justifyContent: 'center' }}>
        {icon && <TG d={icon} size={13} color={on ? T.accentDeep : (accent ? T.accent : T.ink3)} sw={1.7} />}
      </span>
      <div style={{ minWidth: 0, lineHeight: 1.15 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
        {sub && <div style={{ fontSize: 10.5, color: T.muted, marginTop: 1 }}>{sub}</div>}
      </div>
      {shortcut && (
        <span style={{ fontFamily: TFM, fontSize: 10, color: T.ink3, whiteSpace: 'nowrap' }}>{shortcut}</span>
      )}
    </div>
  );
}

function V3MSection({ title, children }) {
  return (
    <div style={{ padding: '6px 0' }}>
      {title && (
        <div style={{
          padding: '0 10px 4px',
          fontFamily: TFS, fontSize: 10, fontWeight: 700, color: T.ink3,
          textTransform: 'uppercase', letterSpacing: 0.8,
        }}>{title}</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>{children}</div>
    </div>
  );
}

function V3MDivider() {
  return <div style={{ height: 1, background: T.border, margin: '2px 6px' }} />;
}

// ============================================================
// V3 SHEETS — narrow, anchored dropdowns
// ============================================================

function V3SheetArchivo() {
  return (
    <>
      <V3MSection title="Nuevo">
        <V3MItem icon={TI.fileNew} label="Nuevo documento" shortcut="⌘N" accent />
      </V3MSection>
      <V3MDivider />
      <V3MSection title="Archivo">
        <V3MItem icon={TI.upload}   label="Subir archivo local" sub=".txt · .md · .js" />
        <V3MItem icon={TI.download} label="Descargar copia" sub="txt · md" />
        <V3MItem icon={TI.print}    label="Imprimir…" shortcut="⌘P" />
      </V3MSection>
      <V3MDivider />
      <V3MSection title="Organizar">
        <V3MItem icon={TI.rename}   label="Renombrar" shortcut="F2" />
        <V3MItem icon={TI.trash}    label="Mover a papelera" shortcut="⌘⌫" danger />
      </V3MSection>
      <V3MDivider />
      <V3MSection title="Recientes">
        <V3MItem icon={TI.dot} label="ideas.md"  sub="hace 12 m" />
        <V3MItem icon={TI.dot} label="todo.md"   sub="hace 1 h" />
        <V3MItem icon={TI.dot} label="lista.txt" sub="ayer" />
      </V3MSection>
    </>
  );
}

function V3SheetEditar() {
  return (
    <>
      <V3MSection>
        <V3MItem icon={TI.undo} label="Deshacer" shortcut="⌘Z" accent />
        <V3MItem icon={TI.redo} label="Rehacer" shortcut="⌘⇧Z" />
      </V3MSection>
      <V3MDivider />
      <V3MSection>
        <V3MItem icon={TI.cut}   label="Cortar" shortcut="⌘X" />
        <V3MItem icon={TI.copy}  label="Copiar" shortcut="⌘C" />
        <V3MItem icon={TI.paste} label="Pegar"  shortcut="⌘V" />
        <V3MItem icon={TI.paste} label="Pegar sin formato" shortcut="⌘⇧V" />
      </V3MSection>
      <V3MDivider />
      <V3MSection>
        <V3MItem icon={TI.dot}     label="Seleccionar todo" shortcut="⌘A" />
        <V3MItem icon={TI.comment} label="Comentar línea" shortcut="⌘/" />
      </V3MSection>
      <V3MDivider />
      <V3MSection title="Formato">
        <V3MItem icon={<><path d="M5 6h14M5 12h9M5 18h14" /></>} label="Formatear documento" shortcut="⌘⇧F" sub="aplica indent y comas correctas" accent />
        <V3MItem icon={<><path d="M4 9h16M4 15h10" /></>} label="Minimizar" shortcut="⌘⇧M" sub="elimina espacios y saltos" />
      </V3MSection>
    </>
  );
}

function V3SheetBuscar() {
  return (
    <>
      <V3MSection title="En este documento">
        <div style={{ padding: '2px 8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 8px',
            border: `1px solid ${T.accentBorder}`, borderRadius: 5,
            background: '#fff',
          }}>
            <TG d={TI.search} size={12} color={T.accentDeep} />
            <span style={{ fontFamily: TFM, fontSize: 12, color: T.ink }}>draft|</span>
            <span style={{ marginLeft: 'auto', fontFamily: TFM, fontSize: 10.5, color: T.ink3 }}>3 / 12</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginTop: 4,
            padding: '5px 8px',
            border: `1px solid ${T.border}`, borderRadius: 5,
            background: T.chrome,
          }}>
            <TG d={TI.refresh} size={12} color={T.ink3} />
            <span style={{ flex: 1, fontFamily: TFM, fontSize: 12, color: T.muted }}>reemplazar con…</span>
          </div>
        </div>
      </V3MSection>
      <V3MSection>
        <V3MItem icon={TI.dot} label="Caso sensible" />
        <V3MItem icon={TI.dot} label="Palabra completa" />
        <V3MItem icon={TI.dot} label="Regex" />
        <V3MItem label="Reemplazar todo" shortcut="⌘⌥↵" accent />
      </V3MSection>
    </>
  );
}

function V3SheetCompartir() {
  return (
    <>
      <V3MSection title="Compartir por enlace público">
        <div style={{ padding: '2px 10px 6px', fontFamily: TFS, fontSize: 11.5, color: T.ink3, lineHeight: 1.45 }}>
          Estilo <b style={{ color: T.ink }}>pastebin</b> — cualquiera con el enlace verá el contenido. Sin colaboración en vivo.
        </div>

        {/* link */}
        <div style={{ padding: '0 8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 8px',
            background: T.chrome, border: `1px solid ${T.border}`, borderRadius: 5,
          }}>
            <TG d={TI.link} size={12} color={T.ink3} />
            <span style={{ flex: 1, fontFamily: TFM, fontSize: 11.5, color: T.ink2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              notes.js/p/8kF2Q…7QwP
            </span>
            <button style={{ border: 0, background: 'transparent', cursor: 'pointer', color: T.accentDeep, fontFamily: TFS, fontSize: 11.5, fontWeight: 700, padding: 0 }}>
              copiar
            </button>
          </div>
        </div>
      </V3MSection>

      <V3MDivider />

      <V3MSection title="Opciones">
        {/* caducidad */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 10px', fontFamily: TFS,
        }}>
          <TG d={TI.history} size={13} color={T.ink3} />
          <span style={{ flex: 1, fontSize: 12.5, color: T.ink, fontWeight: 600 }}>Caducidad</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 7px', border: `1px solid ${T.border}`, borderRadius: 4,
            background: '#fff', fontSize: 11.5, fontWeight: 600, color: T.ink2,
          }}>
            7 días
            <TG d={TI.chev} size={10} color={T.ink3} sw={2} />
          </span>
        </div>

        {/* password */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 10px', fontFamily: TFS,
        }}>
          <TG d={TI.lock} size={13} color={T.ink3} />
          <span style={{ flex: 1, fontSize: 12.5, color: T.ink, fontWeight: 600 }}>Proteger con contraseña</span>
          <span style={{
            display: 'inline-block', width: 26, height: 14, borderRadius: 999,
            background: T.chromeDD, border: `1px solid ${T.borderD}`, position: 'relative',
          }}>
            <span style={{ position: 'absolute', left: 1, top: 0.5, width: 11, height: 11, borderRadius: '50%', background: '#fff', border: `1px solid ${T.borderD}` }} />
          </span>
        </div>

        {/* permisos */}
        <div style={{ padding: '6px 10px', fontFamily: TFS }}>
          <div style={{ fontSize: 12, color: T.ink3, marginBottom: 5 }}>Permite a quien lo abra:</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { l: 'Solo ver', on: true },
              { l: 'Ver + descargar' },
            ].map((o) => (
              <span key={o.l} style={{
                padding: '3px 9px',
                border: `1px solid ${o.on ? T.accent : T.border}`,
                background: o.on ? T.accentSoft : '#fff',
                color: o.on ? T.accentDeep : T.ink2,
                fontSize: 11.5, fontWeight: 700, borderRadius: 999,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                {o.on && <TG d={TI.check} size={9} color={T.accentDeep} sw={2.5} />}
                {o.l}
              </span>
            ))}
          </div>
        </div>
      </V3MSection>

      <V3MDivider />

      <div style={{ padding: '6px 8px 8px' }}>
        <button style={{
          width: '100%',
          padding: '7px 10px',
          border: `1px solid ${T.accentDeep}`, borderRadius: 5,
          background: T.accent, color: '#fff',
          fontFamily: TFS, fontSize: 12.5, fontWeight: 800,
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <TG d={TI.link} size={11} color="#fff" sw={2} />
          Crear enlace público
        </button>
        <div style={{ fontSize: 10.5, color: T.muted, textAlign: 'center', marginTop: 5 }}>
          podrás revocarlo en cualquier momento
        </div>
      </div>
    </>
  );
}

function V3SheetVer() {
  return (
    <>
      <V3MSection title="Tema">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, padding: '2px 8px 4px' }}>
          {[
            { n: 'Claro',  bg: '#ffffff', fg: '#111827', a: '#10b981', on: true },
            { n: 'Oscuro', bg: '#0f172a', fg: '#e2e8f0', a: '#34d399' },
            { n: 'Auto',   bg: 'linear-gradient(135deg,#fff 0 50%,#0f172a 50% 100%)', fg: '#111827', a: '#10b981' },
          ].map((t) => (
            <div key={t.n} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              cursor: 'pointer',
            }}>
              <div style={{
                width: '100%', height: 32, borderRadius: 4,
                border: `${t.on ? 2 : 1}px solid ${t.on ? T.accent : T.border}`,
                background: t.bg, position: 'relative',
              }}>
                <span style={{ position: 'absolute', right: 3, bottom: 3, width: 5, height: 5, borderRadius: '50%', background: t.a }} />
              </div>
              <span style={{ fontFamily: TFS, fontSize: 11, fontWeight: t.on ? 700 : 500, color: t.on ? T.ink : T.ink2 }}>
                {t.n}
              </span>
            </div>
          ))}
        </div>
      </V3MSection>
      <V3MDivider />
      <V3MSection title="Editor">
        <V3MItem icon={TI.hash} label="Números de línea" on />
        <V3MItem icon={TI.map}  label="Minimapa" />
        <V3MItem icon={TI.wrap} label="Ajustar línea" on />
      </V3MSection>
      <V3MDivider />
      <V3MSection title="Tamaño de fuente">
        <div style={{ padding: '4px 10px 6px' }}>
          <div style={{ display: 'flex', fontFamily: TFS, fontSize: 11.5, color: T.ink2 }}>
            <span>14 px</span>
            <span style={{ marginLeft: 'auto', color: T.muted, fontFamily: TFM, fontSize: 10.5 }}>10 – 24</span>
          </div>
          <div style={{ position: 'relative', height: 14, marginTop: 4 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 6, height: 2, borderRadius: 2, background: T.chromeDD }} />
            <div style={{ position: 'absolute', left: 0, top: 6, height: 2, width: '32%', borderRadius: 2, background: T.accent }} />
            <div style={{ position: 'absolute', left: '32%', top: 1, width: 12, height: 12, marginLeft: -6, borderRadius: '50%', background: '#fff', border: `1.5px solid ${T.accent}` }} />
          </div>
        </div>
      </V3MSection>
    </>
  );
}

function V3SheetAyuda() {
  return (
    <>
      <V3MSection>
        <V3MItem icon={TI.keyboard} label="Atajos de teclado" shortcut="⌘?" accent />
        <V3MItem icon={TI.info}     label="Tour rápido" sub="2 min" />
        <V3MItem icon={TI.star}     label="Novedades" />
      </V3MSection>
      <V3MDivider />
      <V3MSection>
        <V3MItem icon={TI.send}    label="Contactar soporte" />
        <V3MItem icon={TI.dot}     label="Estado del servicio" sub="todo operativo" />
      </V3MSection>
      <V3MDivider />
      <div style={{ padding: '8px 10px', background: T.accentSoft, margin: '4px 6px 6px', borderRadius: 5, border: `1px solid ${T.accentBorder}` }}>
        <div style={{ fontFamily: TFS, fontSize: 12, fontWeight: 800, color: T.accentDeep }}>
          ¿Trabajas en equipo?
        </div>
        <div style={{ fontFamily: TFS, fontSize: 11.5, color: T.accentDeep, marginTop: 2, lineHeight: 1.4 }}>
          Pásate a <b>notes.js Pro</b>: edición colaborativa en vivo, carpetas, versiones y más.
        </div>
        <button style={{
          marginTop: 6, padding: '4px 9px',
          border: `1px solid ${T.accentDeep}`, borderRadius: 4,
          background: '#fff', color: T.accentDeep,
          fontFamily: TFS, fontSize: 11.5, fontWeight: 800, cursor: 'pointer',
        }}>
          Ver Pro →
        </button>
      </div>
    </>
  );
}

// ---- Anchored sheet container ----
function V3MenuSheet({ id, dimEditor }) {
  if (!id) return null;
  const m = V3_MENUS.find((x) => x.id === id);
  if (!m) return null;
  return (
    <div style={{
      position: 'absolute',
      top: 30 + 28, // tab bar + menu strip
      left: m.anchor,
      width: m.width,
      background: '#fff',
      border: `1px solid ${T.border}`,
      borderTop: `2px solid ${T.accent}`,
      borderRadius: '0 6px 6px 6px',
      boxShadow: '0 10px 24px -8px rgba(15,23,42,0.22), 0 2px 4px rgba(15,23,42,0.05)',
      padding: '4px 0',
      zIndex: 5,
      fontFamily: TFS,
    }}>
      {id === 'archivo'   && <V3SheetArchivo />}
      {id === 'editar'    && <V3SheetEditar />}
      {id === 'buscar'    && <V3SheetBuscar />}
      {id === 'compartir' && <V3SheetCompartir />}
      {id === 'ver'       && <V3SheetVer />}
      {id === 'ayuda'     && <V3SheetAyuda />}
    </div>
  );
}

// ============================================================
// V3 EDITOR — format-aware (highlight · right panel · header pill)
// ============================================================

function V3Editor({ tab, caretLine = 13, caretCol = 18, dimmed, rightPanel = null }) {
  const fmt = window.v3DetectFormat(tab.name);
  const ext = (tab.name.split('.').pop() || 'txt').toLowerCase();
  const contentMap = {
    js:   window.V3_CONTENT_JS,
    json: window.V3_CONTENT_JSON,
    md:   window.V3_CONTENT_MD,
    txt:  window.V3_CONTENT_TXT,
  };
  const content = contentMap[ext] || window.V3_CONTENT_TXT;
  // Markdown shows plain in editor; the preview panel renders it.
  const plain = !fmt.highlight || ext === 'md' || ext === 'txt';

  return (
    <div style={{
      flex: 1, display: 'flex', minHeight: 0,
      background: '#fff',
      opacity: dimmed ? 0.55 : 1,
      transition: 'opacity .18s',
    }}>
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 0 22px', minWidth: 0 }}>
        <window.V3CodeBody lines={content} caretLine={caretLine} caretCol={caretCol} plain={plain} />
      </div>
      {rightPanel && fmt.panel === rightPanel && (
        <window.V3RightPanel kind={rightPanel} fmt={fmt} />
      )}
    </div>
  );
}

// ---- Status bar ----
function V3StatusBar({ caret = '13 : 18', words = 78, chars = 412, fmt }) {
  return (
    <div style={{
      height: 22,
      borderTop: `1px solid ${T.border}`,
      background: T.chromeD,
      padding: '0 12px',
      display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: TFS, fontSize: 11.5, color: T.ink2,
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: T.accentDeep, fontWeight: 600 }}>
        <TG d={TI.cloudCk} size={11} color={T.accentDeep} sw={1.8} />
        Guardado · hace 6 s
      </span>
      <span style={{ color: T.borderD }}>|</span>
      <span style={{ fontFamily: TFM }}>L {caret}</span>
      <div style={{ flex: 1 }} />
      {fmt && <window.V3FormatPill fmt={fmt} size="s" />}
      <span style={{ color: T.muted }}>·</span>
      <span style={{ fontFamily: TFM }}>{words} palabras · {chars} car.</span>
      <span style={{ color: T.muted }}>·</span>
      <span style={{ fontFamily: TFM }}>UTF-8</span>
    </div>
  );
}

// ---- Frame ----
const V3_TABS = [
  { name: 'main.js',     dirty: true  },
  { name: 'config.json', dirty: false },
  { name: 'reunión.md',  dirty: true  },
  { name: 'lista.txt',   dirty: false },
];

function V3Frame({ openMenu = null, activeIdx = 0, rightPanel = null }) {
  const tab = V3_TABS[activeIdx];
  const fmt = window.v3DetectFormat(tab.name);
  // If the format doesn't support the requested panel, ignore.
  const panel = fmt.panel && rightPanel === fmt.panel ? rightPanel : null;
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#fff',
      display: 'flex', flexDirection: 'column',
      fontFamily: TFS, color: T.ink,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <V3TabBar tabs={V3_TABS} activeIdx={activeIdx} />
      <V3MenuStrip openId={openMenu} />
      <window.V3EditorHeader name={tab.name} fmt={fmt} rightPanel={panel} />
      <V3Editor tab={tab} dimmed={!!openMenu} rightPanel={panel} />
      <V3StatusBar fmt={fmt} />
      <V3MenuSheet id={openMenu} />
    </div>
  );
}

Object.assign(window, { V3Login, V3Frame });
