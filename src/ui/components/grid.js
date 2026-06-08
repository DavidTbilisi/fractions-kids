// The app's one grid (area) model. A fraction is drawn as `total` equal cells
// laid out near-square (rows × cols), with the first `filled` coloured. The
// compare hint and the add/subtract equation strip both render through this, so
// every grid shares the same cells, the same common-denominator maths, and the
// same look — a single unified grid system.
import { el } from '../dom.js'

// Lay D cells out as near-square rows×cols (cols >= rows reads as a wide grid).
export function gridShape(D) {
  let rows = 1
  for (let r = Math.floor(Math.sqrt(D)); r >= 1; r--) {
    if (D % r === 0) {
      rows = r
      break
    }
  }
  return { rows, cols: D / rows }
}

// A grid of `total` cells with the first `filled` coloured. `cols` defaults to a
// near-square shape but can be forced so sibling grids align column-for-column
// (e.g. the operands of an equation, drawn on a common denominator). `empty`
// renders a dashed placeholder (no fill) for an unknown result.
export function fractionGrid(filled, total, { cols, empty = false, delay = 0 } = {}) {
  const c = cols || gridShape(total).cols
  const grid = el('div', { class: `fg-grid${empty ? ' fg-empty' : ''}`, style: `--cols:${c}` })
  for (let i = 0; i < total; i++) {
    grid.append(
      el('span', {
        class: `fg-cell ${!empty && i < filled ? 'on' : ''}`,
        style: `animation-delay:${0.012 * i + delay}s`,
      }),
    )
  }
  return grid
}
