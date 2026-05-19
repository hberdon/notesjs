import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme } from '@/shared/types'

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolve the effective visual theme.
 * When theme === 'auto', reads the OS preference via matchMedia.
 */
export function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

function applyThemeToDOM(theme: Theme) {
  document.documentElement.setAttribute('data-theme', getEffectiveTheme(theme))
}

// Singleton cleanup reference for the matchMedia listener
let cleanupMediaListener: (() => void) | null = null

function setupAutoListener(enabled: boolean) {
  // Always remove previous listener first
  if (cleanupMediaListener) {
    cleanupMediaListener()
    cleanupMediaListener = null
  }

  if (!enabled) return

  const mq = window.matchMedia('(prefers-color-scheme: dark)')

  function handleChange() {
    applyThemeToDOM('auto')
  }

  mq.addEventListener('change', handleChange)
  cleanupMediaListener = () => mq.removeEventListener('change', handleChange)
}

// ── Store ─────────────────────────────────────────────────────────────────────

interface ThemeStore {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  /** Returns the effective ('light' | 'dark') value for consumers like CodeMirror. */
  effectiveTheme: () => 'light' | 'dark'
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'light',

      toggleTheme() {
        set((state) => {
          // Cycle: dark → light → auto → dark
          const cycle: Theme[] = ['dark', 'light', 'auto']
          const nextIndex = (cycle.indexOf(state.theme) + 1) % cycle.length
          const next = cycle[nextIndex]
          applyThemeToDOM(next)
          setupAutoListener(next === 'auto')
          return { theme: next }
        })
      },

      setTheme(theme) {
        applyThemeToDOM(theme)
        setupAutoListener(theme === 'auto')
        set({ theme })
      },

      effectiveTheme() {
        return getEffectiveTheme(get().theme)
      },
    }),
    {
      name: 'notesjs-theme',
      // Apply stored theme to DOM immediately on hydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeToDOM(state.theme)
          setupAutoListener(state.theme === 'auto')
        }
      },
    },
  ),
)
