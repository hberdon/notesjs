import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Language } from '@/shared/types'

const MAX_RECENTS = 10

export interface RecentEntry {
  id: string
  name: string
  language: Language
  openedAt: number
}

interface RecentStore {
  recents: RecentEntry[]
  addRecent: (entry: Omit<RecentEntry, 'openedAt'>) => void
  updateName: (id: string, name: string, language: Language) => void
}

export const useRecentStore = create<RecentStore>()(
  persist(
    (set) => ({
      recents: [],

      addRecent({ id, name, language }) {
        set((state) => {
          const filtered = state.recents.filter((r) => r.id !== id)
          const next = [{ id, name, language, openedAt: Date.now() }, ...filtered]
          return { recents: next.slice(0, MAX_RECENTS) }
        })
      },

      updateName(id, name, language) {
        set((state) => ({
          recents: state.recents.map((r) => r.id === id ? { ...r, name, language } : r),
        }))
      },
    }),
    { name: 'notesjs-recents' },
  ),
)
