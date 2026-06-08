// Comparison hint for the "Bigger or Smaller" skill. Two ways to *see* the same
// comparison, switchable with a little Bars/Grid toggle:
//
//  • Bars  — each fraction is an equal-width segmented bar stacked on the others.
//    Every bar spans one whole, so the coloured length is directly comparable by
//    eye. Tapping a bar drops a dashed "finish line" down its filled edge.
//  • Grid  — the multiplication (area) model. Each fraction is scaled up to the
//    common denominator (the LCM of all the denominators) and drawn as an
//    identical rows×cols grid of squares with that many coloured. Because every
//    grid is the same size, you just count the coloured squares — and the
//    "n/d = m/D" label makes the equivalent-fraction step explicit.
import { el, clear } from '../dom.js'
import { fractionGlyph } from './glyph.js'
import { t } from '../../i18n/index.js'

export function renderComparisonHint(fractions) {
  const cmp = el('div', { class: 'cmp' })
  const caption = el('p', { class: 'cmp-caption' })
  const stage = el('div', { class: 'cmp-stage' })

  const views = {
    bars: { build: () => buildBarsView(fractions), caption: 'hint.compareCaption' },
    grid: { build: () => buildGridView(fractions), caption: 'hint.gridCaption' },
  }

  const tabs = el('div', { class: 'cmp-tabs' })
  const tabBtns = {}
  function show(name) {
    clear(stage)
    stage.append(views[name].build())
    caption.textContent = t(views[name].caption)
    Object.entries(tabBtns).forEach(([k, b]) => b.classList.toggle('active', k === name))
  }
  for (const name of ['grid', 'bars']) {
    const btn = el('button', { class: 'cmp-tab', type: 'button', onClick: () => show(name) }, t(`hint.view.${name}`))
    tabBtns[name] = btn
    tabs.append(btn)
  }

  cmp.append(tabs, caption, stage)
  show('grid')
  return cmp
}

// ---- Bars view: stacked equal-width segmented bars ------------------------

function buildBarsView(fractions) {
  // Every label has a fixed width (CSS), so all tracks start at the same x and
  // span the same width. The guide overlay is inset to sit exactly over that
  // track column; its line is then positioned as a % of the track width.
  const bars = el('div', { class: 'cmp-bars' })
  const guideLine = el('div', { class: 'cmp-guide-line' })
  const guide = el('div', { class: 'cmp-guide', style: 'opacity:0' }, guideLine)

  const rows = fractions.map((f, idx) => {
    const track = el('div', { class: 'cmp-track' })
    for (let i = 0; i < f.d; i++) {
      track.append(
        el('span', {
          class: `cmp-cell ${i < f.n ? 'on' : ''}`,
          style: `animation-delay:${0.045 * i + 0.14 * idx}s`,
        }),
      )
    }
    const row = el(
      'button',
      { class: 'cmp-row', type: 'button', style: `--row-delay:${0.14 * idx}s` },
      el('span', { class: 'cmp-label' }, fractionGlyph(f.n, f.d, { size: 'md' })),
      track,
    )
    row.addEventListener('click', () => {
      const turningOn = !row.classList.contains('active')
      rows.forEach((r) => r.classList.remove('active'))
      if (turningOn) {
        row.classList.add('active')
        guideLine.style.left = `${(f.n / f.d) * 100}%`
        guide.style.opacity = '1'
      } else {
        guide.style.opacity = '0'
      }
    })
    return row
  })

  rows.forEach((r) => bars.append(r))
  bars.append(guide)
  return bars
}

// ---- Grid view: the multiplication / common-denominator area model --------

function gcd(a, b) {
  while (b) [a, b] = [b, a % b]
  return a
}
function lcm(a, b) {
  return (a / gcd(a, b)) * b
}

// Lay D cells out as near-square rows×cols (cols >= rows reads as a wide grid).
function gridShape(D) {
  let rows = 1
  for (let r = Math.floor(Math.sqrt(D)); r >= 1; r--) {
    if (D % r === 0) {
      rows = r
      break
    }
  }
  return { rows, cols: D / rows }
}

function buildGridView(fractions) {
  const D = fractions.reduce((acc, f) => lcm(acc, f.d), 1)
  const { cols } = gridShape(D)
  const wrap = el('div', { class: 'cmp-grids' })

  const tiles = fractions.map((f, idx) => {
    const filled = (f.n * D) / f.d
    const grid = el('div', { class: 'cmp-grid', style: `--cols:${cols}` })
    for (let i = 0; i < D; i++) {
      grid.append(
        el('span', {
          class: `cmp-gcell ${i < filled ? 'on' : ''}`,
          style: `animation-delay:${0.012 * i + 0.12 * idx}s`,
        }),
      )
    }
    const tile = el(
      'button',
      { class: 'cmp-tile', type: 'button', style: `--row-delay:${0.12 * idx}s` },
      grid,
      el(
        'span',
        { class: 'cmp-eq' },
        fractionGlyph(f.n, f.d, { size: 'md' }),
        el('span', { class: 'cmp-eq-sign' }, '='),
        fractionGlyph(filled, D, { size: 'md' }),
      ),
    )
    tile.addEventListener('click', () => {
      const turningOn = !tile.classList.contains('active')
      tiles.forEach((t2) => t2.classList.remove('active'))
      if (turningOn) tile.classList.add('active')
    })
    return tile
  })

  tiles.forEach((tl) => wrap.append(tl))
  return wrap
}
