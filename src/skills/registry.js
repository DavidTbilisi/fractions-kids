// Skill catalog. Each entry ties an id to its language-neutral display info
// (emoji) and difficulty range. The human-readable label and blurb are
// localized — see `skill.<id>.label/blurb` in ../i18n/translations.js, read via
// skillLabel()/skillBlurb() below. Problem generation lives in
// ../fractions/generators.js (keyed by the same id).
import { t } from '../i18n/index.js'

export const MAX_TIER = 4

export const SKILLS = [
  { id: 'identify', emoji: '🍕' },
  { id: 'compare', emoji: '⚖️' },
  { id: 'addsub', emoji: '➕' },
  { id: 'muldiv', emoji: '✖️' },
]

export const SKILL_IDS = SKILLS.map((s) => s.id)

export function getSkill(id) {
  return SKILLS.find((s) => s.id === id) || null
}

// Localized name and one-line description for a skill, in the active language.
export function skillLabel(id) {
  return t(`skill.${id}.label`)
}

export function skillBlurb(id) {
  return t(`skill.${id}.blurb`)
}
