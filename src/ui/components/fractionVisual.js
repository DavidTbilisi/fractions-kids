// Fraction visuals. The headline feature for young learners: a *gallery* that
// shows the SAME fraction five different ways at once — pizza (area/circle),
// chocolate bar (area/length), number line (position), gumballs (set), and a
// juice glass (volume). Each representation animates itself in. Seeing one
// quantity under many guises is what builds real fraction sense.
//
// `renderFractionVisual` is kept for callers that want a single classic visual;
// `renderRepresentationGallery` is the rich multi-view used on the play screen.
import { el, svgEl } from '../dom.js'
import { fractionGlyph } from './glyph.js'
import { fractionGrid, gridShape } from './grid.js'
import { lcm } from '../../fractions/fraction.js'
import { t } from '../../i18n/index.js'

// ---- shared bits -----------------------------------------------------------

// A labelled tile wrapping one representation. `i` drives the entrance stagger.
function repCard(name, icon, body, i) {
  return el(
    'figure',
    { class: 'rep', style: `--rep-delay:${0.08 * i + 0.05}s` },
    el('div', { class: 'rep-stage' }, body),
    el('figcaption', { class: 'rep-cap' }, el('span', { class: 'rep-ico' }, icon), name),
  )
}

// ---- 1. Pizza (circle / area) ---------------------------------------------

function piePath(cx, cy, r, a0, a1) {
  const x0 = cx + r * Math.cos(a0)
  const y0 = cy + r * Math.sin(a0)
  const x1 = cx + r * Math.cos(a1)
  const y1 = cy + r * Math.sin(a1)
  const large = a1 - a0 > Math.PI ? 1 : 0
  return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`
}

function renderPie(n, d, size = 116) {
  const r = size / 2 - 7
  const cx = size / 2
  const cy = size / 2
  const svg = svgEl('svg', { width: size, height: size, viewBox: `0 0 ${size} ${size}`, role: 'img', class: 'viz viz-pie' })
  // Crust ring.
  svg.append(svgEl('circle', { cx, cy, r: r + 4, fill: '#f3b765' }))
  const step = (Math.PI * 2) / d
  const start = -Math.PI / 2
  for (let i = 0; i < d; i++) {
    const slice = svgEl('path', {
      d: piePath(cx, cy, r, start + i * step, start + (i + 1) * step),
      fill: i < n ? '#ffcc4d' : '#fff6e3',
      stroke: '#d9822b',
      'stroke-width': 2.5,
      'stroke-linejoin': 'round',
      class: 'pz-slice',
      style: `transform-box:view-box; transform-origin:${cx}px ${cy}px; animation-delay:${0.06 * i}s`,
    })
    svg.append(slice)
    // A tiny pepperoni dot on filled slices for charm.
    if (i < n) {
      const mid = start + (i + 0.5) * step
      svg.append(
        svgEl('circle', {
          cx: cx + r * 0.55 * Math.cos(mid),
          cy: cy + r * 0.55 * Math.sin(mid),
          r: Math.max(2.2, r * 0.09),
          fill: '#e8590c',
          class: 'pz-pep',
          style: `transform-box:view-box; transform-origin:${cx}px ${cy}px; animation-delay:${0.06 * i + 0.2}s`,
        }),
      )
    }
  }
  return svg
}

// ---- 2. Chocolate bar (length / area) -------------------------------------

function renderBar(n, d) {
  const wrap = el('div', { class: 'viz viz-bar' })
  for (let i = 0; i < d; i++) {
    wrap.append(
      el('span', {
        class: `choc ${i < n ? 'on' : 'off'}`,
        style: `animation-delay:${0.05 * i}s`,
      }),
    )
  }
  return wrap
}

// ---- 3. Number line (position) --------------------------------------------

function renderNumberLine(n, d) {
  const pos = (n / d) * 100
  const track = el('div', { class: 'nl-track' })
  for (let i = 0; i <= d; i++) {
    const edge = i === 0 || i === d
    track.append(el('span', { class: `nl-tick ${edge ? 'edge' : ''}`, style: `left:${(i / d) * 100}%` }))
  }
  track.append(el('span', { class: 'nl-fill', style: `--pos:${pos}%` }))
  const frog = el('span', { class: 'nl-frog', style: `--pos:${pos}%` }, '🐸')
  track.append(frog)
  return el(
    'div',
    { class: 'viz viz-nl' },
    track,
    el('div', { class: 'nl-labels' }, el('span', {}, '0'), el('span', {}, '1')),
  )
}

// ---- 4. Gumballs (set model) ----------------------------------------------

const GUMS = ['#ff5d8f', '#3b9eff', '#37c871', '#a566ff', '#ffb020', '#ff6f5e', '#22c1c3', '#f25fd0', '#7ed957']

function renderGumballs(n, d) {
  const wrap = el('div', { class: 'viz viz-gum' })
  for (let i = 0; i < d; i++) {
    const on = i < n
    wrap.append(
      el('span', {
        class: `gum ${on ? 'on' : 'off'}`,
        style: `animation-delay:${0.06 * i}s; ${on ? `--gc:${GUMS[i % GUMS.length]}` : ''}`,
      }),
    )
  }
  return wrap
}

// ---- 5. Juice glass (volume) ----------------------------------------------

function renderGlass(n, d, w = 78, h = 110) {
  const svg = svgEl('svg', { width: w, height: h, viewBox: `0 0 ${w} ${h}`, role: 'img', class: 'viz viz-glass' })
  const pad = 9
  const top = 8
  const bot = h - 8
  const innerH = bot - top
  // Glass body (slightly tapered tumbler).
  const bodyPts = `${pad + 3},${top} ${w - pad - 3},${top} ${w - pad},${bot} ${pad},${bot}`
  svg.append(svgEl('polygon', { points: bodyPts, fill: '#eef6ff', stroke: '#9cc6ff', 'stroke-width': 3, 'stroke-linejoin': 'round' }))
  // Level marks.
  for (let i = 1; i < d; i++) {
    const y = bot - (innerH * i) / d
    svg.append(svgEl('line', { x1: pad + 4, y1: y, x2: w - pad - 4, y2: y, stroke: '#cfe2ff', 'stroke-width': 1.5 }))
  }
  // Liquid: a group scaled up from the bottom for a "rising" fill.
  const fillH = (innerH * n) / d
  const g = svgEl('g', { class: 'jg-rise', style: `transform-box:view-box; transform-origin:center ${bot}px` })
  g.append(svgEl('rect', { x: pad + 1.5, y: bot - fillH, width: w - 2 * pad - 3, height: fillH, fill: '#ffb43d', rx: 3 }))
  g.append(svgEl('ellipse', { cx: w / 2, cy: bot - fillH, rx: (w - 2 * pad - 3) / 2, ry: 4, fill: '#ffc869', class: 'jg-top' }))
  svg.append(g)
  // A straw.
  svg.append(svgEl('line', { x1: w - pad - 14, y1: top - 4, x2: w - pad - 4, y2: bot - 10, stroke: '#ff5d8f', 'stroke-width': 5, 'stroke-linecap': 'round' }))
  return svg
}

// ---- Grid-equation strip (add / subtract / divide) -------------------------

// A term in the equation: a grid with its fraction label below.
function eqTerm(grid, label, i) {
  return el('div', { class: 'eq-term', style: `--eq-delay:${0.14 * i + 0.05}s` }, grid, label)
}

// The label under each operand: the original fraction, plus its equivalent on
// the common denominator when scaling changed it — which is exactly *why* the
// grid is unified (the cells must be the same size before you can combine them).
function eqLabel(n, d, D) {
  const lab = el('div', { class: 'eq-lab' }, fractionGlyph(n, d, { size: 'sm' }))
  if (d !== D) lab.append(el('span', { class: 'eq-eqsign' }, '='), fractionGlyph((n * D) / d, D, { size: 'sm' }))
  return lab
}

// `A [op] B = ?` where both operands are drawn on ONE common-denominator grid,
// so all cells are the same size. Add/subtract combine the cells directly;
// divide reads off the ratio of the two shaded counts (a/b ÷ c/d = the cells of
// A over the cells of B, once both are on the common grid). The result stays a
// "?" (an empty grid) so the visual scaffolds the typed tiers without solving.
function renderGridEquation({ a, b }, opSymbol, opClass) {
  const D = lcm(a.d, b.d)
  const { cols } = gridShape(D)
  return el(
    'div',
    { class: `viz eq-strip ${opClass}` },
    eqTerm(fractionGrid((a.n * D) / a.d, D, { cols }), eqLabel(a.n, a.d, D), 0),
    el('div', { class: 'eq-op' }, opSymbol),
    eqTerm(fractionGrid((b.n * D) / b.d, D, { cols, delay: 0.12 }), eqLabel(b.n, b.d, D), 1),
    el('div', { class: 'eq-op' }, '='),
    eqTerm(fractionGrid(0, D, { cols, empty: true }), el('span', { class: 'eq-q' }, '?'), 2),
  )
}

const renderAddSubVisual = (v) => renderGridEquation(v, v.op === 'add' ? '+' : '−', `eq-${v.op}`)
const renderDivVisual = (v) => renderGridEquation(v, '÷', 'eq-div')

// ---- Multiply: the area (array) model --------------------------------------

// A unit square split into `a.d` columns and `b.d` rows. Shading `a.n` columns
// (fraction A) and `b.n` rows (fraction B), their overlap is the product:
// a.n×b.n cells out of a.d×b.d. Seeing the two strips cross is the whole idea of
// why you multiply numerators and denominators.
function renderMulVisual({ a, b }) {
  const cols = a.d
  const rows = b.d
  const grid = el('div', { class: 'am-grid', style: `--cols:${cols}` })
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const inA = c < a.n
      const inB = r < b.n
      const cls = inA && inB ? 'ab' : inA ? 'a' : inB ? 'b' : ''
      grid.append(el('span', { class: `am-cell ${cls}`, style: `animation-delay:${0.018 * (r * cols + c)}s` }))
    }
  }
  return el(
    'div',
    { class: 'viz mul-area' },
    grid,
    el(
      'div',
      { class: 'eq-lab' },
      fractionGlyph(a.n, a.d, { size: 'sm' }),
      el('span', { class: 'eq-eqsign' }, '×'),
      fractionGlyph(b.n, b.d, { size: 'sm' }),
    ),
  )
}

// ---- public ---------------------------------------------------------------

// Pick the right visual for a problem: the grid-equation strip (add/subtract/
// divide), the multiply area model, or the five-way single-fraction gallery.
export function renderProblemVisual(visual) {
  if (!visual) return null
  switch (visual.type) {
    case 'addsub':
      return renderAddSubVisual(visual)
    case 'mul':
      return renderMulVisual(visual)
    case 'div':
      return renderDivVisual(visual)
    default:
      return renderRepresentationGallery(visual)
  }
}

// Single classic visual (kept for compatibility): pie or bar.
export function renderFractionVisual(visual, size = 180) {
  if (!visual) return null
  return visual.type === 'pie' ? renderPie(visual.n, visual.d, size) : renderBar(visual.n, visual.d)
}

// The five-up gallery. `lead` (the generator's type hint) is shown first.
export function renderRepresentationGallery(visual) {
  if (!visual) return null
  const { n, d } = visual
  const reps = [
    { key: 'pie', name: t('rep.pizza'), icon: '🍕', make: () => renderPie(n, d) },
    { key: 'bar', name: t('rep.chocBar'), icon: '🍫', make: () => renderBar(n, d) },
    { key: 'nl', name: t('rep.numberLine'), icon: '🐸', make: () => renderNumberLine(n, d) },
    { key: 'gum', name: t('rep.gumballs'), icon: '🔴', make: () => renderGumballs(n, d) },
    { key: 'glass', name: t('rep.juice'), icon: '🥤', make: () => renderGlass(n, d) },
  ]
  // Put the generator's own type first so the "official" view leads.
  reps.sort((a, b) => (a.key === visual.type ? -1 : b.key === visual.type ? 1 : 0))
  const gallery = el('div', { class: 'rep-gallery' })
  reps.forEach((r, i) => gallery.append(repCard(r.name, r.icon, r.make(), i)))
  return gallery
}
