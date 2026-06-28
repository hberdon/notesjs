import en from './en'
import es from './es'

export type Lang = 'en' | 'es'
export type { Translations } from './en'

const locales = { en, es }

export function getTranslations(lang: Lang) {
  return locales[lang]
}

export function detectLang(): Lang {
  return 'en'
}
