// Multiple-choice answer buttons (low tiers). Each choice carries a `value`
// that is handed back to the session's check(). Fraction-valued choices render
// as stacked glyphs; primitive choices render as plain labels.
import { el } from '../dom.js'
import { fractionGlyph } from './glyph.js'

function choiceContent(choice) {
  const v = choice.value
  if (v && typeof v === 'object' && 'n' in v && 'd' in v) {
    return fractionGlyph(v.n, v.d, { size: 'lg' })
  }
  return el('span', {}, choice.label)
}

export function renderChoices(problem, onPick) {
  const buttons = problem.choices.map((choice, i) =>
    el(
      'button',
      {
        class: 'choice',
        type: 'button',
        style: `--i:${0.06 * i}s`, // staggered entrance
        onClick: (e) => onPick(choice, e.currentTarget),
      },
      choiceContent(choice),
    ),
  )
  return el('div', { class: 'choices' }, ...buttons)
}
