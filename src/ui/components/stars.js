// Tier shown as filled/empty stars out of MAX_TIER.
import { el } from '../dom.js'
import { MAX_TIER } from '../../skills/registry.js'

export function tierStars(tier) {
  let s = ''
  for (let i = 1; i <= MAX_TIER; i++) s += i <= tier ? '★' : '☆'
  return el('span', { class: 'stars' }, s)
}
