# Enfoque Open Core para un Editor de Texto y Visualizador Online
## Estrategia de Negocio y Arquitectura de Software (Free / Pro / Enterprise)

Este documento detalla la viabilidad, ventajas, riesgos y la estructura de implementación del modelo **Open Core** aplicado a una aplicación web de edición y visualización rápida de texto con gestión de pestañas.

---

## 1. ¿Qué es el Modelo Open Core?

El modelo **Open Core** consiste en dividir el software en dos partes diferenciadas:
1. **El Núcleo (Core):** Es de código abierto (Open Source), alojado en un repositorio público (ej. GitHub). Contiene las funcionalidades esenciales de la aplicación.
2. **Las Extensiones Comerciales:** Son de código cerrado (Propietario) y privadas. Añaden valor avanzado enfocado en la productividad individual (Pro) y necesidades corporativas (Enterprise).

Para un editor de texto online, este modelo es ideal porque equilibra la confianza técnica que requiere un desarrollador con la sostenibilidad financiera del creador.

---

## 2. Estructura de Repositorios y Código

Para proteger la propiedad intelectual de las funciones de pago y automatizar los despliegues, se recomienda una arquitectura de código bien delimitada:

```
├── [Repo Público] -> frontend-core (React/Vue + CodeMirror/Monaco)
│   └── Editor básico, gestión de pestañas locales (IndexedDB), visualizadores JSON/Markdown.
│
└── [Repo Privado] -> backend-commercial & cloud-features
    └── Sincronización, base de datos de usuarios, pasarela de pago (Stripe), gestión Enterprise.
```

---

## 3. Matriz de Características por Niveles (Tiering)

| Característica | Plan Free (Open Core) | Plan Pro (SaaS Comercial) | Plan Enterprise (B2B) |
| :--- | :---: | :---: | :---: |
| **Código Fuente** | Público (GitHub) | Privado / SaaS | Privado / Auto-alojado |
| **Almacenamiento** | Local (Navegador) | Nube Sincronizada | Nube Dedicada o On-Premise |
| **Gestión de Pestañas** | Ilimitadas en local | Sincronizadas entre dispositivos | Sincronizadas + Compartidas |
| **Herramientas de Texto** | Formateador básico (JSON/MD) | Validadores avanzados, Regex | Reglas de cumplimiento internas |
| **Colaboración** | No disponible | Compartir enlace de lectura | Edición en tiempo real (CRDTs) |
| **Autenticación** | Sin registro / Anónimo | OAuth (Google, GitHub) | SSO / SAML / Directorio Activo |
| **Soporte** | Comunidad (GitHub Issues) | Prioritario por Email | SLA garantizado y canal directo |

---

## 4. Ventajas del Enfoque Open Source para este Proyecto

* **Factor Confianza (Privacidad):** Los usuarios (especialmente desarrolladores y administradores de sistemas) suelen pegar información sensible en editores rápidos (JSONs de configuración, logs de servidores, fragmentos de código, credenciales temporales). Al ser Open Source, cualquiera puede auditar que los datos se procesan **100% en el cliente** (local) y no se envían de forma oculta a ningún servidor en el plan gratuito.
* **Efecto Red y Marketing Orgánico:** GitHub actúa como el canal de adquisición número uno. Las estrellas (*stars*), la aparición en listas "Awesome", y las recomendaciones en comunidades de desarrollo generarán un tráfico orgánico masivo imposible de costear con publicidad tradicional al inicio.
* **Aportaciones de la Comunidad:** Los usuarios reportarán bugs específicos de navegadores, optimizarán el rendimiento de cargas de archivos grandes y propondrán visualizadores para nuevos formatos que tú no habías considerado.

---

## 5. Riesgos y Estrategias de Mitigación

### Riesgo A: Clonación de la Aplicación (*Forking*)
* **El problema:** Alguien duplica tu repositorio público, le cambia el nombre y el logo, y lo despliega bajo su propio dominio para competir contigo.
* **Estrategia de mitigación:** 1. **La Licencia Correcta:** Utiliza una licencia **AGPLv3** o una **BSL 1.1 (Business Source License)**. La BSL permite que cualquiera use y modifique tu código para fines no comerciales, pero prohíbe explícitamente que compitan ofreciendo el mismo servicio web de pago. Tras un tiempo (ej. 3 años), el código pasa a ser GPL.
    2. **Ventaja del Primer Impulso:** Aunque clonen el código, no clonarán la comunidad de GitHub, las estrellas acumuladas, el posicionamiento SEO de tu marca, ni la infraestructura cloud ultra-rápida que tú gestionas en el backend.

### Riesgo B: Canibalización del Plan Pro
* **El problema:** El plan gratuito es tan completo que nadie siente la necesidad de pagar por los planes Pro o Enterprise.
* **Estrategia de mitigación:** Traza una línea clara basada en la **conectividad y el entorno de trabajo**. Todo lo que dependa de almacenamiento local o procesamiento en el navegador pertenece al Core. En el momento en que el flujo de trabajo requiere persistencia multidispositivo, compartir información con terceros o seguridad corporativa, pasa obligatoriamente al ecosistema cerrado.

---

## 6. Recomendación de Licencia de Software

Para un proyecto con ambición comercial bajo la filosofía Open Core, se aconseja evitar licencias ultra-permisivas como MIT o Apache 2.0 si temes la competencia directa de grandes corporaciones (como ocurrió históricamente con Elasticsearch y AWS).

* **Opción Preferida (Orientada a Negocio):** **BSL 1.1 (Business Source License)**. Utilizada por empresas como HashiCorp o MariaDB. Es el estándar moderno para proteger startups comerciales que quieren ser transparentes con su código fuente sin perder el control de su monetización.
* **Opción Estándar (Código Abierto Estricto):** **AGPLv3 (GNU Affero General Public License)**. Permite un modelo puramente abierto pero obliga a cualquier competidor que modifique tu software y lo aloje en la web a liberar el 100% de sus modificaciones bajo la misma licencia.

---

## 7. Línea Free → Pro Concreta (Tiering Operativo)

Esta sección aterriza la matriz de la sección 3 en una división accionable, basada en costos reales de infra y en el diferenciador del producto: **compartir seguro** (links con contraseña/expiración que ni Gists ni Pastebin ofrecen).

### 7.1 Principios rectores

1. **El sync de texto cuesta ~$0 por usuario.** Todo el costo de infra es fijo (piso ~$25/mo de Supabase Pro). Gatear el sync es tacaño y mata la retención → se regala para construir base de usuarios y lock-in.
2. **Lo que se paga es el diferenciador: compartir seguro + poder + colaboración.** No se gatea la conectividad básica, se gatea la cuota, la seguridad de compartir y las features de productividad avanzada.

### 7.2 La línea

| Feature | 🆓 Free | 💎 Pro (€11.99/año ≈ €1/mes · o €4/mo suelto) |
|---------|:-------:|:------------------------:|
| Editor, pestañas ilimitadas, todos los lenguajes | ✅ | ✅ |
| Formatear JSON/MD | ✅ básico | ✅ + validators, regex |
| **Guest 100% local** (sin cuenta, IndexedDB) | ✅ | ✅ |
| **Cloud sync multidispositivo** | ✅ | ✅ |
| Archivos en la nube | **25 archivos** (cap por cantidad) | **Ilimitados** (cap duro 5 MB/archivo, anti-abuso) |
| **Compartir link público** | ✅ **1 activo, sin password, sin expiración** | ✅ **ilimitados** |
| **Password en links** 🎯 | ❌ | ✅ |
| **Expiración de links** 🎯 | ❌ | ✅ |
| Permiso de **edición** en link (no solo lectura) | ❌ | ✅ |
| Historial de versiones | ❌ | ✅ |
| **Dividir pantalla** (split view) | ❌ | ✅ |
| Soporte | Comunidad | Prioritario |

### 7.3 Por qué la línea cae donde cae

**Compartir: lo viral es Free, lo seguro es Pro.**
- Free da **1 link público sin password** → esto es *marketing*, no valor. Cada link compartido lleva un extraño a notesjs (efecto red, sección 4).
- Pro da **password + expiración + links ilimitados + permiso de edición** → esto es *valor* y es exactamente el diferenciador frente a Gists (sin password) y Pastebin (público y con ads). El usuario que necesita mandar algo sensible choca con el muro y paga.
- Regla mnemotécnica: **se regala la adquisición, se vende el valor.**

**Cuota en vez de gatear el sync.**
- Tope de 25 archivos (no "sync solo Pro") porque el sync gratis engancha: el usuario mete sus cosas, vuelve a diario, genera lock-in. Cuando llega al tope ya vive en notesjs y pagar **€11.99/año (≈ €1/mes)** es obvio. Negar sync de entrada = nunca se engancha = nunca paga. **Retención primero, cobro después.**

**Guest 100% local es innegociable en Free.**
- Es la prueba de confianza auditable (open-source, `guestDb.ts`): el dev pega credenciales temporales sin cuenta y *sabe* que no salen del navegador. Es el ancla de marca frente a Pastebin/Gists; no se toca nunca.

### 7.4 Economía del modelo (números verificados — Supabase pricing, jun 2026)

**Free tier Supabase:** 500 MB DB · 1 GB storage · 50.000 MAU · **se pausa tras 1 semana inactivo**.
**Pro:** $25/mo · 8 GB DB incluidos (luego $0.125/GB) · 100 GB storage (luego $0.0213/GB) · 100.000 MAU · nunca se pausa.

- **El contenido vive en Postgres** (`files.content`), no en Storage → el límite relevante es la **DB de 8 GB**, no los 100 GB de Storage.
- **Costo marginal por usuario ≈ $0.** Un usuario con 25 archivos de texto ≈ 250 KB-1 MB. En los 8 GB incluidos entran **~8.000 usuarios** dentro del flat de $25. La infra no obliga a cuotas apretadas → la cuota Free es palanca de monetización, no restricción de costo.
- **Piso de costo:** ~$25/mo (Supabase Pro; frontend estático a Cloudflare Pages = $0). El gatillo para pasar a Pro es la **pausa por inactividad** del Free, no el tamaño.
- **Break-even:** a €11.99/año (neto ~€11.6 tras Stripe) hacen falta **~25 usuarios Pro** para cubrir el piso (~$300/año). Alcanzable con free tier viral + tracción en GitHub.
- **Anti-abuso:** cap duro de 5 MB/archivo en todos los planes evita que un "ilimitado" Pro vuelque GBs a Postgres (no es blob storage barato). Ya existe la base: warn a 500 KB (`fileStore` `SIZE_WARN_BYTES`) y 5 MB/archivo en guest (`guestDb` `GUEST_MAX_BYTES`).
- **Trampa de Stripe:** a precios micro (€2-3/mo) la comisión fija (~€0.25/transacción) se come ~10%. **Mitigación: facturación anual** (una sola comisión al año). El plan ancla es **€11.99/año** (charm pricing; ~3.6% a Stripe, despreciable al ser anual). Mensual suelto €4/mo para empujar al anual (12×4 = €48 vs €11.99 → descuento ~75%, el anual es no-brainer). **No bajar de ~€12/año:** abajo el % de Stripe trepa y se señala "juguete sin valor".

### 7.5 Modelo de Entitlements (gates Cliente + Servidor)

Decisión: **misma barra (`MenuStrip`) para cuenta Free y Pro.** El usuario Free ve los features Pro **bloqueados con candado** (no escondidos) → el candado es el anuncio (*upsell descubrible*: no se puede desear lo que no se ve). El estado de invitado (`LiteBar`, 100% local) se mantiene como tercer estado, sin cambios.

```
Estado de UI:   invitado (LiteBar, local)  →  cuenta (MenuStrip)
Dentro de cuenta:                              Free (features con 🔒)  →  Pro (todo)
```

#### Principio innegociable: dos capas de gate

> `disabled` en React NO es seguridad, es UX. Si solo se gatea en el cliente, cualquiera abre DevTools, llama a Supabase directo y se saltea el límite. **El gate que protege los ingresos vive en el servidor (RLS / RPC chequeando el plan).**

| Capa | Rol | Si falta |
| :--- | :--- | :--- |
| Cliente (`disabled` + 🔒 + tooltip "Pro") | UX, upsell visible | Feo pero no peligroso |
| **Servidor (RLS/RPC chequea `plan`)** | Hace cumplir el límite | **Pro gratis vía DevTools = pérdida de ingresos** |

#### Arquitectura (un solo punto de verdad, NO `if (isPro)` esparcido)

1. **`profiles.plan: 'free' | 'pro'`** — columna nueva en Supabase (default `'free'`). Sin esto no hay tier; es el primer ladrillo del que cuelga todo.
2. **`useEntitlements()`** — hook que lee `plan` y devuelve flags: `{ maxFiles, canPassword, canExpiry, canEditLink, canHistory, canSplitView }`.
3. **UI** consume entitlements: `disabled` + 🔒 + tooltip "Pro" + click → modal de upgrade.
4. **RLS / RPC** en la DB chequea `plan` → el gate real.

#### Mapa de gates

| Feature | Free | Gate cliente | Gate servidor |
| :--- | :---: | :--- | :--- |
| Crear archivo cloud | 25 max | botón disabled al llegar a 25 | RLS rechaza el insert #26 |
| Password en link | 🔒 | campo disabled + candado | RPC/trigger rechaza `password_hash` si free |
| Expiración de link | 🔒 | datepicker disabled | RLS rechaza/ignora `expires_at` si free |
| Permiso edición en link | 🔒 | radio disabled | RLS fuerza `permission='read'` si free |
| Historial de versiones | 🔒 | menú con candado | tabla/RPC vacía si free |
| Split view | 🔒 | toggle con candado | — (solo cliente; no toca datos sensibles) |

Nota: split view es 100% cliente → ahí el gate de cliente alcanza. Todo lo que toca la DB (cuota, password, expiración, permiso) **exige gate de servidor**.

### 7.6 Roadmap de Features Pro

Priorización por **valor × esfuerzo × brand-fit** (on-brand = seguridad + audiencia dev, defendible frente a Gists/Pastebin). Real-time collab (CRDTs/Yjs) se mantiene en Enterprise — alto valor pero esfuerzo desproporcionado para un producto de €11.99; diferido hasta validar pagos.

#### Lote v1 (primero — bajo esfuerzo, máximo on-brand)

**🔥 Burn-after-read links** — link que se ve **una sola vez** y se autodestruye.
- *Por qué:* la audiencia pega credenciales/tokens/secrets temporales. "Te paso la API key, link de un solo uso." Gists y Pastebin no lo hacen. Máximo on-brand (seguridad).
- *Implementación:* columna `burn_after_read` en `public_links` + `DELETE` (o invalidación) en el RPC `get_shared_file` tras servir el contenido la primera vez. Esfuerzo bajo.
- *Gate:* servidor (la destrucción ocurre en el RPC). Cliente: checkbox "Destruir tras leer" con 🔒 para free.

**📡 Raw endpoint** — sirve el contenido **pelado** (sin UI/HTML), con `Content-Type` correcto, para consumo por máquina.
- *Por qué:* convierte notesjs en mini-host de contenido / "JSON as a service": config remota que una app hace `fetch()`, scripts ejecutables vía `curl`, mock API, feeds. Es el botón "Raw" de Gist.
- *Diferencia:* `/s/:token` → página HTML para humano; `/raw/:token` → bytes crudos para programa.
- *Implementación:* RPC público (o edge function) que recibe el token y devuelve `content` con `Content-Type: text/plain` o `application/json`. Esfuerzo bajo.
- *Asterisco operativo:* el raw es **hotlinkeable** → va con **rate-limit** y **CORS** bien configurado para evitar abuso/tráfico parásito.

#### Lote v2 (tras validar que la gente paga)

- **Búsqueda full-text** en todos los archivos del usuario (Cmd+P estilo VS Code) — Postgres `tsvector`. Esfuerzo medio.
- **Diff view** (compara versiones o dos archivos) — combina con historial. CM6 merge addon.
- **Link analytics** (quién/cuándo abrió el link) — esfuerzo bajo, satisfactorio.

#### Backlog (solo si hay demanda real — NO construir por entusiasmo)

- **API + CLI** (pipe del stdout a `njs share` → link). **Degradado de v2 a backlog.** Razón honesta: un `njs share` pelado **no es un wedge de adquisición** — ese nicho ya está cubierto y gratis por herramientas existentes (`gh gist create`, `termbin` y similares paste-and-share). Su única utilidad real es ser la *superficie en terminal* de los features seguros (`--burn`, `--password`) que esos competidores no igualan; pero el valor vive en burn/password, no en el CLI. Es una **capa de conveniencia para power-users que ya pagan**, no una razón para pagar. Construirlo antes de validar pagos = adorno antes que la casa. Reconsiderar solo si usuarios pagos lo piden explícitamente.

#### Premium con asterisco

- **E2E encryption (zero-knowledge)** — máximo trust play, pero **arquitectónicamente excluyente**: si el contenido se cifra client-side, el servidor no puede leerlo → se pierde búsqueda full-text, formateo server-side y verificación de password en share sobre ese dato. Si se implementa, va como **modo "bóveda" opcional por archivo**, no como default. Decisión consciente del trade-off.