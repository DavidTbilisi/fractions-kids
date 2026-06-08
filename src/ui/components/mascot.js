// "Pip" — the Fraction Friend. A little SVG blob with blinking eyes and an
// idle bob, who reacts to how the game is going. Returns the node with a
// `setMood(mood)` method attached: 'idle' | 'think' | 'happy' | 'cheer' | 'sad'.
import { el, svgEl } from '../dom.js'

export function createMascot({ size = 96 } = {}) {
  const svg = svgEl('svg', { width: size, height: size, viewBox: '0 0 100 100', class: 'pip-svg' })

  // Soft ground shadow.
  svg.append(svgEl('ellipse', { cx: 50, cy: 92, rx: 26, ry: 5, fill: 'rgba(0,0,0,0.12)', class: 'pip-shadow' }))

  // Body.
  const body = svgEl('g', { class: 'pip-body' })
  body.append(svgEl('circle', { cx: 50, cy: 52, r: 36, fill: 'var(--pip-body, #ffd23f)', stroke: 'var(--pip-edge, #e8a200)', 'stroke-width': 3 }))
  body.append(svgEl('ellipse', { cx: 42, cy: 40, rx: 14, ry: 10, fill: 'rgba(255,255,255,0.45)' }))
  // Little ear-nubs.
  body.append(svgEl('circle', { cx: 26, cy: 24, r: 7, fill: 'var(--pip-body, #ffd23f)', stroke: 'var(--pip-edge, #e8a200)', 'stroke-width': 3 }))
  body.append(svgEl('circle', { cx: 74, cy: 24, r: 7, fill: 'var(--pip-body, #ffd23f)', stroke: 'var(--pip-edge, #e8a200)', 'stroke-width': 3 }))

  // Cheeks (shown when happy).
  body.append(svgEl('circle', { cx: 31, cy: 60, r: 6, fill: '#ff8fb0', class: 'pip-cheek' }))
  body.append(svgEl('circle', { cx: 69, cy: 60, r: 6, fill: '#ff8fb0', class: 'pip-cheek' }))

  // Eyes (blink as a group).
  const eyes = svgEl('g', { class: 'pip-eyes' })
  for (const x of [38, 62]) {
    eyes.append(svgEl('circle', { cx: x, cy: 48, r: 9, fill: '#fff', stroke: '#3a2a5d', 'stroke-width': 2 }))
    eyes.append(svgEl('circle', { cx: x + 1.5, cy: 49, r: 4, fill: '#3a2a5d', class: 'pip-pupil' }))
    eyes.append(svgEl('circle', { cx: x + 3, cy: 47, r: 1.4, fill: '#fff' }))
  }
  body.append(eyes)

  // Mouths — CSS shows exactly one per mood.
  body.append(svgEl('path', { d: 'M40 66 Q50 74 60 66', fill: 'none', stroke: '#3a2a5d', 'stroke-width': 3, 'stroke-linecap': 'round', class: 'pip-mouth m-idle' }))
  body.append(svgEl('path', { d: 'M38 64 Q50 82 62 64 Q50 72 38 64 Z', fill: '#c0395b', stroke: '#3a2a5d', 'stroke-width': 2, 'stroke-linejoin': 'round', class: 'pip-mouth m-happy' }))
  body.append(svgEl('path', { d: 'M41 72 Q50 64 59 72', fill: 'none', stroke: '#3a2a5d', 'stroke-width': 3, 'stroke-linecap': 'round', class: 'pip-mouth m-sad' }))

  svg.append(body)

  const node = el('div', { class: 'pip mood-idle' }, svg)

  node.setMood = (mood) => {
    node.className = 'pip' // reset so reaction animations replay
    void node.offsetWidth // force reflow
    node.classList.add(`mood-${mood}`)
  }

  return node
}
