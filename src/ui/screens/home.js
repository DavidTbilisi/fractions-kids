// Home screen: a waving title with Pip the mascot, an overall progress strip,
// a Smart Start button, and a card per skill (each in its own colour) showing
// the child's level and best streak. Tapping a card starts a session.
import { el } from '../dom.js'
import { tierStars } from '../components/stars.js'
import { createMascot } from '../components/mascot.js'
import { SKILLS, SKILL_IDS, getSkill, skillLabel, skillBlurb } from '../../skills/registry.js'
import { getSkillProgress, resetProgress, pickFocusSkill } from '../../state/progress.js'
import { t, getLang, LANGS } from '../../i18n/index.js'
import { applyLang } from '../../i18n/apply.js'

function overallStrip(progress) {
  let total = 0
  let correct = 0
  for (const id of Object.keys(progress.skills)) {
    total += progress.skills[id].total
    correct += progress.skills[id].correct
  }
  const pct = total ? Math.round((correct / total) * 100) : 0
  return el(
    'div',
    { class: 'strip' },
    el('span', {}, t('home.answered', { n: total })),
    el('span', {}, total ? t('home.accuracy', { pct }) : t('home.pickToStart')),
  )
}

// Language picker: one chunky pill per supported language. Switching re-applies
// the language (persisting it and updating <title>/<html lang>) then re-renders
// the home screen so every label updates at once.
function languageBar(nav) {
  const current = getLang()
  return el(
    'div',
    { class: 'lang-bar', role: 'group', 'aria-label': t('home.language') },
    ...LANGS.map((lng) =>
      el(
        'button',
        {
          class: `lang-btn${lng.code === current ? ' active' : ''}`,
          type: 'button',
          lang: lng.code,
          'aria-pressed': String(lng.code === current),
          title: lng.name,
          onClick: () => {
            if (lng.code === getLang()) return
            applyLang(lng.code)
            nav.home()
          },
        },
        lng.label,
      ),
    ),
  )
}

function skillCard(skill, progress, nav, i) {
  const sp = getSkillProgress(progress, skill.id)
  return el(
    'button',
    { class: 'skill-card', 'data-skill': skill.id, style: `--i:${0.08 * i + 0.15}s`, type: 'button', onClick: () => nav.play(skill.id) },
    el('div', { class: 'skill-emoji' }, skill.emoji),
    el('div', { class: 'skill-label' }, skillLabel(skill.id)),
    el('div', { class: 'skill-blurb' }, skillBlurb(skill.id)),
    el('div', { class: 'skill-foot' }, tierStars(sp.tier), sp.bestStreak ? el('span', { class: 'best' }, `🔥 ${sp.bestStreak}`) : null),
  )
}

function smartStart(progress, nav) {
  const focusId = pickFocusSkill(progress, SKILL_IDS)
  const focus = getSkill(focusId)
  return el(
    'button',
    { class: 'smart-start', type: 'button', onClick: () => nav.play(focusId) },
    el('span', { class: 'smart-emoji' }, '✨'),
    el(
      'span',
      { class: 'smart-text' },
      el('span', { class: 'smart-title' }, t('home.smartStart')),
      el('span', { class: 'smart-sub' }, t('home.practise', { skill: `${focus.emoji} ${skillLabel(focus.id)}` })),
    ),
    el('span', { class: 'smart-go' }, '▶'),
  )
}

export function HomeScreen({ nav, progress }) {
  const reset = el(
    'button',
    {
      class: 'link-btn',
      type: 'button',
      onClick: () => {
        const fresh = resetProgress()
        progress.skills = fresh.skills
        nav.home()
      },
    },
    t('home.reset'),
  )

  // Two groups so landscape can lay them out as independent side-by-side
  // columns. Stacked (mobile) they fall in natural order: hero, stats, then the
  // games, then reset.
  return el(
    'section',
    { class: 'screen home' },
    languageBar(nav),
    el(
      'div',
      { class: 'home-left' },
      el(
        'div',
        { class: 'home-hero' },
        createMascot({ size: 104 }),
        el('h1', { class: 'title' }, `${t('app.title')} `, el('span', { class: 'wave' }, '🍕')),
        el('p', { class: 'subtitle' }, t('app.subtitle')),
      ),
      overallStrip(progress),
    ),
    el(
      'div',
      { class: 'home-right' },
      smartStart(progress, nav),
      el('div', { class: 'skill-grid' }, ...SKILLS.map((s, i) => skillCard(s, progress, nav, i))),
    ),
    reset,
  )
}
