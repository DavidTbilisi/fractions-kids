// Play screen: drives a session for one skill. Renders each problem (with the
// five-way representation gallery when a visual is present), grades the answer,
// reacts via Pip, fires confetti, shows any level change, then advances. On the
// last problem it records the summary to progress and routes to results.
import { el, clear } from '../dom.js'
import { tierStars } from '../components/stars.js'
import { createMascot } from '../components/mascot.js'
import { renderRepresentationGallery } from '../components/fractionVisual.js'
import { renderComparisonHint } from '../components/comparisonHint.js'
import { renderChoices } from '../components/choices.js'
import { renderNumpad } from '../components/numpad.js'
import { renderFeedback } from '../components/feedback.js'
import { burstConfetti } from '../components/confetti.js'
import { getSkill, skillLabel } from '../../skills/registry.js'
import { t } from '../../i18n/index.js'
import { getSkillProgress, recordSession } from '../../state/progress.js'
import { createSession } from '../../engine/session.js'

function answerText(answer) {
  if (answer && typeof answer === 'object' && 'n' in answer) return `${answer.n}/${answer.d}`
  return String(answer)
}

export function PlayScreen({ nav, progress }, skillId) {
  const skill = getSkill(skillId)
  const startTier = getSkillProgress(progress, skillId).tier
  const session = createSession({ skillId, startTier })
  const root = el('section', { class: 'screen play', 'data-skill': skillId })

  function header(mascot) {
    return el(
      'div',
      { class: 'play-head' },
      el('button', { class: 'back', type: 'button', onClick: () => nav.home() }, '←'),
      el('div', { class: 'play-title' }, `${skill.emoji} ${skillLabel(skill.id)}`),
      mascot,
      el('div', { class: 'play-meta' }, el('span', { class: 'qcount' }, `${session.served}/${session.length}`), tierStars(session.tier)),
    )
  }

  function progressBar() {
    const pct = Math.round((session.served / session.length) * 100)
    return el('div', { class: 'progress-track' }, el('div', { class: 'progress-fill', style: `width:${pct}%` }))
  }

  function finish() {
    const summary = session.summary()
    recordSession(progress, summary)
    nav.results(summary)
  }

  function renderProblem() {
    const problem = session.next()
    if (!problem) return finish()

    clear(root)
    const mascot = createMascot({ size: 72 })
    mascot.setMood('think')
    root.append(header(mascot))
    root.append(progressBar())

    const card = el('div', { class: 'card' }, el('p', { class: 'prompt' }, problem.prompt))
    const gallery = renderRepresentationGallery(problem.visual)
    if (gallery) card.append(el('div', { class: 'visual' }, gallery))

    // Comparison problems carry no visual, so offer a "show me" hint that draws
    // the fractions being compared as stacked equal-width bars.
    if (problem.skill === 'compare' && problem.choices) {
      const hintSlot = el('div', { class: 'hint-slot' })
      const hintBtn = el(
        'button',
        {
          class: 'hint-btn',
          type: 'button',
          onClick: () => {
            hintBtn.remove()
            hintSlot.append(renderComparisonHint(problem.choices.map((c) => c.value)))
          },
        },
        t('play.hint'),
      )
      hintSlot.append(hintBtn)
      card.append(hintSlot)
    }
    root.append(card)

    const inputWrap = el('div', { class: 'input-wrap' })
    const footer = el('div', { class: 'footer' })
    let answered = false

    function handle(value, clickedChoice) {
      if (answered) return
      answered = true
      const result = session.answer(value)
      inputWrap.classList.add('locked')

      if (problem.inputMode === 'choice') {
        const btns = [...inputWrap.querySelectorAll('.choice')]
        btns.forEach((btn, i) => {
          const c = problem.choices[i]
          if (problem.check(c.value)) btn.classList.add('correct')
          else if (c === clickedChoice) btn.classList.add('wrong')
        })
      }

      if (result.correct) {
        mascot.setMood(result.tierChange === 'up' ? 'cheer' : 'happy')
        burstConfetti({ count: result.tierChange === 'up' ? 60 : 28 })
      } else {
        mascot.setMood('sad')
      }

      footer.append(renderFeedback(result.correct, answerText(result.answer)))
      if (result.tierChange === 'up') footer.append(el('div', { class: 'toast up' }, t('play.levelUp')))
      if (result.tierChange === 'down') footer.append(el('div', { class: 'toast down' }, t('play.levelDown')))

      const last = session.served >= session.length
      footer.append(el('button', { class: 'next', type: 'button', onClick: renderProblem }, last ? t('play.seeResults') : t('play.next')))
    }

    if (problem.inputMode === 'choice') {
      inputWrap.append(renderChoices(problem, (choice) => handle(choice.value, choice)))
    } else {
      inputWrap.append(renderNumpad((value) => handle(value, null)))
    }
    root.append(inputWrap)
    root.append(footer)
  }

  renderProblem()
  return root
}
