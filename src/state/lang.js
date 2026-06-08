// Language-choice persistence via localStorage, mirroring progress.js. Kept as
// its own leaf so the i18n runtime stays storage-free. All access is wrapped in
// try/catch so private-mode/quota failures degrade silently (returns null and
// the caller falls back to the default language).

const KEY = 'fractions-kids/lang'

export function loadLang() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function saveLang(code) {
  try {
    localStorage.setItem(KEY, code)
  } catch {
    // Storage unavailable (private mode / quota) — degrade silently.
  }
}
