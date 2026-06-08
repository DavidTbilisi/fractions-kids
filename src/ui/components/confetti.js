// Lightweight confetti + star burst. Pure DOM: spawns short-lived pieces into a
// fixed overlay and removes them when their CSS animation ends. No libraries.
import { el } from './../dom.js'

const COLORS = ['#ff5d8f', '#3b9eff', '#37c871', '#a566ff', '#ffb020', '#ff6f5e', '#22c1c3']
const SHAPES = ['▰', '●', '★', '◆', '✦']

function overlay() {
  let layer = document.querySelector('.confetti-layer')
  if (!layer) {
    layer = el('div', { class: 'confetti-layer', 'aria-hidden': 'true' })
    document.body.append(layer)
  }
  return layer
}

// Burst from a point (defaults to top-centre). `count` scales the celebration.
export function burstConfetti({ x = window.innerWidth / 2, y = window.innerHeight * 0.28, count = 36 } = {}) {
  const layer = overlay()
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const dist = 80 + Math.random() * 220
    const dx = Math.cos(angle) * dist
    const dy = Math.sin(angle) * dist - (60 + Math.random() * 120) // bias upward, then gravity
    const piece = el(
      'span',
      {
        class: 'confetti-bit',
        style: [
          `left:${x}px`,
          `top:${y}px`,
          `--dx:${dx.toFixed(0)}px`,
          `--dy:${dy.toFixed(0)}px`,
          `--rot:${(Math.random() * 720 - 360).toFixed(0)}deg`,
          `--dur:${(0.9 + Math.random() * 0.7).toFixed(2)}s`,
          `--delay:${(Math.random() * 0.12).toFixed(2)}s`,
          `color:${COLORS[i % COLORS.length]}`,
          `font-size:${(12 + Math.random() * 14).toFixed(0)}px`,
        ].join(';'),
      },
      SHAPES[i % SHAPES.length],
    )
    piece.addEventListener('animationend', () => piece.remove())
    layer.append(piece)
  }
}

// A quick ring of stars around an element — used for level-ups.
export function starPop(targetEl) {
  const r = targetEl.getBoundingClientRect()
  burstConfetti({ x: r.left + r.width / 2, y: r.top + r.height / 2, count: 18 })
}
