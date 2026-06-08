// On-screen fraction entry (higher tiers). Two slots — numerator and
// denominator — plus digit keys and a Check button. Calls onSubmit({n, d}).
import { el } from '../dom.js'

export function renderNumpad(onSubmit) {
  let active = 'n'
  let nStr = ''
  let dStr = ''

  const nBox = el('button', { class: 'np-slot active', type: 'button', onClick: () => setActive('n') }, '?')
  const dBox = el('button', { class: 'np-slot', type: 'button', onClick: () => setActive('d') }, '?')

  function refresh() {
    nBox.textContent = nStr || '?'
    dBox.textContent = dStr || '?'
    nBox.classList.toggle('active', active === 'n')
    dBox.classList.toggle('active', active === 'd')
  }

  function setActive(field) {
    active = field
    refresh()
  }

  function digit(x) {
    if (active === 'n') {
      if (nStr.length < 2) nStr += x
      if (nStr.length === 1) active = 'n' // stay until they move on
    } else if (dStr.length < 2) {
      dStr += x
    }
    refresh()
  }

  function back() {
    if (active === 'n') nStr = nStr.slice(0, -1)
    else dStr = dStr.slice(0, -1)
    refresh()
  }

  function submit() {
    const n = parseInt(nStr, 10)
    const d = parseInt(dStr, 10)
    if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) return
    onSubmit({ n, d })
  }

  const display = el(
    'div',
    { class: 'np-display' },
    nBox,
    el('span', { class: 'np-bar' }),
    dBox,
  )

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'].map((label) => {
    const handler = label === '⌫' ? back : label === '✓' ? submit : () => digit(label)
    const cls = label === '✓' ? 'np-key np-check' : label === '⌫' ? 'np-key np-back' : 'np-key'
    return el('button', { class: cls, type: 'button', onClick: handler }, label)
  })

  return el('div', { class: 'numpad' }, display, el('div', { class: 'np-grid' }, ...keys))
}
