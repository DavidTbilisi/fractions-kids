// A stacked fraction glyph: numerator over a bar over denominator.
import { el } from '../dom.js'

export function fractionGlyph(n, d, { size = 'md' } = {}) {
  return el(
    'span',
    { class: `frac frac-${size}` },
    el('span', { class: 'frac-n' }, n),
    el('span', { class: 'frac-bar' }),
    el('span', { class: 'frac-d' }, d),
  )
}
