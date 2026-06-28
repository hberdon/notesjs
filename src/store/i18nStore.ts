import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getTranslations, detectLang } from '@/i18n'
import type { Lang, Translations } from '@/i18n'

interface I18nStore {
  lang: Lang
  t: Translations
  setLang: (lang: Lang) => void
}

const initLang = detectLang()

export const useI18nStore = create<I18nStore>()(
  persist(
    (set) => ({
      lang: initLang,
      t:    getTranslations(initLang),

      setLang(lang) {
        set({ lang, t: getTranslations(lang) })
      },
    }),
    {
      name: 'notesjs-lang',
      partialize: (state) => ({ lang: state.lang }),
      onRehydrateStorage: () => (state) => {
        if (state) state.t = getTranslations(state.lang)
      },
    },
  ),
)
