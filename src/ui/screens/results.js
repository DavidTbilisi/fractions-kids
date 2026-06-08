// Results screen: end-of-session celebration with score, best streak, and the
// level the child reached. Pip cheers, confetti rains for a strong run, and the
// score cells pop in one by one. Offers a replay or a trip back home.
import { el } from '../dom.js'
import { tierStars } from '../components/stars.js'
import { createMascot } from '../components/mascot.js'
import { burstConfetti } from '../components/confetti.js'
import { getSkill, skillLabel } from '../../skills/registry.js'
import { t } from '../../i18n/index.js'

function medal(pct) {
  if (pct >= 90) return { emoji: '🌟', msg: t('results.superstar') }
  if (pct >= 70) return { emoji: '🎉', msg: t('results.great') }
  if (pct >= 50) return { emoji: '👍', msg: t('results.good') }
  return { emoji: '💪', msg: t('results.keep') }
}

function scoreCell(num, label, i) {
  return el(
    'div',
    { class: 'score-cell', style: `--i:${0.12 * i + 0.2}s` },
    el('div', { class: 'score-num' }, num),
    el('div', { class: 'score-label' }, label),
  )
}

export function ResultsScreen({ nav, progress }, summary) {
  const skill = getSkill(summary.skillId)
  const pct = Math.round(summary.accuracy * 100)
  const m = medal(pct)

  const mascot = createMascot({ size: 96 })
  mascot.setMood(pct >= 70 ? 'cheer' : pct >= 50 ? 'happy' : 'think')

  // Celebrate a strong run with a couple of confetti volleys once mounted.
  if (pct >= 70) {
    setTimeout(() => burstConfetti({ count: 70 }), 250)
    setTimeout(() => burstConfetti({ count: 40, x: window.innerWidth * 0.3 }), 650)
    setTimeout(() => burstConfetti({ count: 40, x: window.innerWidth * 0.7 }), 850)
  }

  return el(
    'section',
    { class: 'screen results', 'data-skill': summary.skillId },
    mascot,
    el('div', { class: 'medal' }, m.emoji),
    el('h1', { class: 'title' }, m.msg),
    el('p', { class: 'subtitle' }, `${skill.emoji} ${skillLabel(skill.id)}`),
    el(
      'div',
      { class: 'score-grid' },
      scoreCell(`${summary.correct}/${summary.total}`, t('results.correct'), 0),
      scoreCell(`${pct}%`, t('results.accuracy'), 1),
      scoreCell(`🔥 ${summary.bestStreak}`, t('results.bestStreak'), 2),
    ),
    el('div', { class: 'level-row' }, t('results.level'), tierStars(summary.finalTier)),
    el(
      'div',
      { class: 'result-actions' },
      el('button', { class: 'primary', type: 'button', onClick: () => nav.play(summary.skillId) }, t('results.playAgain')),
      el('button', { class: 'secondary', type: 'button', onClick: () => nav.home() }, t('results.home')),
    ),
  )
}
