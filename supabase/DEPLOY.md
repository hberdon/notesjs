# Supabase — Guía de despliegue

## 1. Crear proyecto en Supabase

1. Entra en [supabase.com](https://supabase.com) y crea un nuevo proyecto.
2. Anota la **Project URL** y la **anon public key** (Settings → API).

---

## 2. Aplicar el schema

Todo el schema está en un único archivo: `supabase/migrations/001_files.sql`.

### Opción A — SQL Editor (recomendado para primer despliegue)

1. Ve a **SQL Editor** en el dashboard de Supabase.
2. Pega y ejecuta el contenido de `supabase/migrations/001_files.sql`.

El script es idempotente (`CREATE TABLE IF NOT EXISTS`) y crea:
- Tabla `files` con RLS — cada usuario solo accede a sus archivos (`owner_all`). No hay lectura pública directa sobre `files`.
- Trigger `updated_at` en `files`.
- Tabla `public_links` con RLS — **una sola** policy `owner_all`: el propietario gestiona sus propios links. No hay policy de lectura pública sobre esta tabla.
- Función `get_shared_file(token, password)` `SECURITY DEFINER` con `search_path` fijado — **único** camino de lectura anónima de contenido compartido. Verifica la contraseña con bcrypt server-side y nunca expone `password_hash` ni el `token` al cliente.

> ⚠️ Versiones previas de este doc describían policies `public_read` y `public_read_via_link`. Se eliminaron: filtraban el hash bcrypt y los tokens a cualquiera con la anon key. El RPC es ahora el único portero de lo público.

### Opción B — Supabase CLI

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

> `project-ref` es el ID del proyecto (Settings → General).

---

## 3. Configurar Google OAuth

1. Crea credenciales OAuth 2.0 en [Google Cloud Console](https://console.cloud.google.com):
   - **Authorized redirect URIs**: `https://<project-ref>.supabase.co/auth/v1/callback`
2. En Supabase → **Authentication → Providers → Google**:
   - Pega el **Client ID** y **Client Secret**.
3. En Supabase → **Authentication → URL Configuration**:
   - **Site URL**: URL de producción (p. ej. `https://notesjs.vercel.app`)
   - **Redirect URLs**: `https://notesjs.vercel.app/auth/callback`

> Para desarrollo local añade también `http://localhost:5174` y `http://localhost:5174/auth/callback`.

---

## 4. Variables de entorno

Crea un archivo de variables locales en la raíz (no commitear) con estas dos claves:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

Para Vercel: **Settings → Environment Variables**, añade las mismas dos variables.

---

## 5. Configuración de auth (PKCE)

En `src/lib/supabase.ts` el cliente ya usa **PKCE** — no hay que cambiar nada:

```ts
auth: {
  detectSessionInUrl: false,  // AuthCallback hace el exchange manual del ?code
  persistSession: true,
  autoRefreshToken: true,
  flowType: 'pkce',
},
```

> `detectSessionInUrl` está en `false` a propósito: con PKCE, si el SDK auto-consume
> el `?code` antes de que corra `exchangeCodeForSession()` en `AuthCallback`, se obtiene
> un error "auth code already used". El exchange manual es el único dueño del code.
>
> En el proyecto cloud hosteado, PKCE funciona sin problemas. (El stack local del CLI
> en versiones antiguas tenía limitaciones con PKCE; las versiones actuales lo soportan.)

---

## 6. Desarrollo local con Supabase CLI

```bash
supabase start          # Levanta Postgres + Auth + Studio en local
supabase db reset       # Aplica migrations desde cero (útil al cambiar el schema)
supabase stop           # Para los contenedores
```

Al ejecutar `supabase start`, el CLI imprime la URL local y la anon key para usar en el archivo de variables de entorno local. Studio queda disponible en `localhost:54323`.

---

## 7. Despliegue en Vercel

```bash
vercel --prod
```

O conecta el repositorio en el dashboard de Vercel para CI/CD automático desde `main`.

Asegúrate de que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén configuradas en Vercel antes del primer deploy.
