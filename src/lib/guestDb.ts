import { openDB } from 'idb'
import type { IDBPDatabase } from 'idb'

// ── Constants ─────────────────────────────────────────────────────────────────

export const GUEST_MAX_BYTES = 5 * 1024 * 1024   // 5 MB per file

// ── Schema ────────────────────────────────────────────────────────────────────

export interface GuestTabRecord {
  id:        string   // stable UUID — same as Tab.id in tabStore
  filename:  string
  content:   string   // full file text
  updatedAt: number   // Date.now() — used for load ordering
}

interface GuestDbSchema {
  tabs: {
    key: string
    value: GuestTabRecord
    indexes: { by_updated: number }
  }
}

// ── Singleton DB connection ───────────────────────────────────────────────────

let _db: IDBPDatabase<GuestDbSchema> | null = null

function getDb(): Promise<IDBPDatabase<GuestDbSchema>> {
  if (!_db) {
    _db = openDB<GuestDbSchema>('notesjs-guest', 1, {
      upgrade(db) {
        const store = db.createObjectStore('tabs', { keyPath: 'id' })
        store.createIndex('by_updated', 'updatedAt', { unique: false })
      },
    }) as unknown as IDBPDatabase<GuestDbSchema>
  }
  return Promise.resolve(_db)
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Load all persisted guest tabs sorted by updatedAt ascending (oldest first). */
export async function loadGuestTabs(): Promise<GuestTabRecord[]> {
  const db = await getDb()
  return db.getAllFromIndex('tabs', 'by_updated')
}

/**
 * Upsert a tab's content in IndexedDB.
 * Throws if the content exceeds GUEST_MAX_BYTES.
 */
export async function saveGuestTab(
  id: string,
  filename: string,
  content: string,
): Promise<void> {
  const byteLength = new TextEncoder().encode(content).length
  if (byteLength > GUEST_MAX_BYTES) {
    throw new Error(
      `El archivo supera el límite de 5 MB (${(byteLength / 1024 / 1024).toFixed(1)} MB). No se puede guardar en modo invitado.`,
    )
  }

  const db = await getDb()
  await db.put('tabs', { id, filename, content, updatedAt: Date.now() })
}

/** Remove a single tab record from IndexedDB. */
export async function deleteGuestTab(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('tabs', id)
}

/** Wipe all guest tab records (call after guest completes login). */
export async function clearGuestTabs(): Promise<void> {
  const db = await getDb()
  await db.clear('tabs')
}
