// i18n runtime — a tiny dictionary lookup over ./translations.js. Pure: no DOM
// and no storage, so it works unchanged in Node (the generators import it).
//
//   t(key, params)  -> string  ('home.answered' with {n: 7})
//   tList(key)       -> array   ('feedback.cheers')
//   getLang()/setLang(code)     read/select the active language
//
// Persistence of the chosen language lives in ../state/lang.js (UI layer) and
// is wired up at app boot — this module just holds the current selection.
import { translations, LANGS, DEFAULT_LANG } from './translations.js'

export { LANGS, DEFAULT_LANG }

let current = DEFAULT_LANG

export function getLang() {
  return current
}

export function isLang(code) {
  return Object.prototype.hasOwnProperty.call(translations, code)
}

// Switch the active language. Unknown codes are ignored so a stale stored value
// can never break the app. Returns the language actually in effect.
export function setLang(code) {
  if (isLang(code)) current = code
  return current
}

// Resolve a dot-path ('results.level') against an object, or undefined.
function resolve(obj, key) {
  return key.split('.').reduce((o, part) => (o == null ? undefined : o[part]), obj)
}

// Look up `key` in the active language, falling back to English, then the raw
// key. Used by both t() (strings) and tList() (arrays).
function lookup(key) {
  const hit = resolve(translations[current], key)
  if (hit !== undefined) return hit
  const fallback = resolve(translations[DEFAULT_LANG], key)
  return fallback !== undefined ? fallback : key
}

function interpolate(str, params) {
  if (!params) return str
  return str.replace(/\{(\w+)\}/g, (m, name) => (name in params ? String(params[name]) : m))
}

// Translate a key to a string, interpolating any {placeholders} from `params`.
export function t(key, params) {
  const value = lookup(key)
  return typeof value === 'string' ? interpolate(value, params) : String(value)
}

// Translate a key whose value is a list (e.g. feedback cheers/tries).
export function tList(key) {
  const value = lookup(key)
  return Array.isArray(value) ? value : []
}
