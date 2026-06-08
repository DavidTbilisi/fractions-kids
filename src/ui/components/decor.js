// Drifting background "stickers" — soft, blurred candy shapes that float behind
// everything to give the world depth and atmosphere. Mounted once, lives in a
// fixed layer below #app. Purely decorative (aria-hidden, pointer-events:none).
import { el } from './../dom.js'

const STICKERS = [
  { ch: '🍕', x: 6, y: 14, s: 3.2, d: 0 },
  { ch: '🍫', x: 86, y: 22, s: 2.6, d: 1.4 },
  { ch: '🐸', x: 78, y: 70, s: 2.4, d: 2.1 },
  { ch: '🥤', x: 12, y: 74, s: 2.8, d: 0.7 },
  { ch: '⭐', x: 46, y: 8, s: 2.0, d: 1.1 },
  { ch: '🍭', x: 90, y: 48, s: 2.4, d: 2.6 },
  { ch: '🔵', x: 4, y: 44, s: 2.0, d: 1.8 },
  { ch: '🍩', x: 60, y: 84, s: 2.6, d: 0.4 },
]

export function mountDecor() {
  if (document.querySelector('.decor-layer')) return
  const layer = el('div', { class: 'decor-layer', 'aria-hidden': 'true' })
  for (const s of STICKERS) {
    layer.append(
      el(
        'span',
        {
          class: 'decor-bit',
          style: `left:${s.x}%; top:${s.y}%; font-size:${s.s}rem; animation-delay:${s.d}s`,
        },
        s.ch,
      ),
    )
  }
  document.body.prepend(layer)
}
