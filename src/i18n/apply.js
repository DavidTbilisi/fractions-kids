// Glue between the storage-free i18n runtime and the browser: selecting a
// language sets it as active, persists the choice, and updates document chrome
// (<html lang> and the tab <title>). Kept out of ./index.js so that module
// stays DOM- and storage-free for the pure core that imports it.
import { setLang, getLang, t } from './index.js'
import { loadLang, saveLang } from '../state/lang.js'

// Reflect the active language onto the document. Called after every change and
// once at boot.
function syncDocument() {
  const lang = getLang()
  if (typeof document === 'undefined') return
  document.documentElement.lang = lang
  document.title = `${t('app.title')} 🍕`
}

// Select a language, persist it, and update the document. Returns the language
// actually in effect (setLang ignores unknown codes).
export function applyLang(code) {
  const lang = setLang(code)
  saveLang(lang)
  syncDocument()
  return lang
}

// Boot-time: restore the saved language (if any) without re-persisting, then
// sync the document. Falls back to the default when nothing is stored.
export function initLang() {
  const stored = loadLang()
  if (stored) setLang(stored)
  syncDocument()
  return getLang()
}
