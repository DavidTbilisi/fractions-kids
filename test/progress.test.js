import { describe, it, expect } from 'vitest'
import { pickFocusSkill } from '../src/state/progress.js'
import { SKILL_IDS } from '../src/skills/registry.js'

// pickFocusSkill is pure (no localStorage), so it's safe in the node env.
const prog = (skills) => ({ version: 1, skills })

describe('pickFocusSkill', () => {
  it('falls back to the first skill when nothing has been played', () => {
    expect(pickFocusSkill(prog({}), SKILL_IDS)).toBe(SKILL_IDS[0])
  })

  it('prefers a lower tier over a higher one', () => {
    // identify is far ahead; the weakest is the first remaining tier-1 skill
    const p = prog({ identify: { tier: 4, total: 30, correct: 28, bestStreak: 5 } })
    const picked = pickFocusSkill(p, SKILL_IDS)
    expect(picked).not.toBe('identify')
    expect(picked).toBe(SKILL_IDS[1])
  })

  it('breaks tier ties by lower accuracy', () => {
    const p = prog({
      identify: { tier: 2, total: 10, correct: 5, bestStreak: 2 }, // 50%
      compare: { tier: 2, total: 10, correct: 9, bestStreak: 4 }, // 90%
      addsub: { tier: 2, total: 10, correct: 8, bestStreak: 3 }, // 80%
      muldiv: { tier: 2, total: 10, correct: 9, bestStreak: 3 }, // 90%
    })
    expect(pickFocusSkill(p, SKILL_IDS)).toBe('identify')
  })

  it('treats an unplayed skill as weaker than a strong played one at the same tier', () => {
    const p = prog({ identify: { tier: 1, total: 5, correct: 4, bestStreak: 3 } })
    // compare/addsub/muldiv are unplayed (tier 1, accuracy 0) -> first of those
    expect(pickFocusSkill(p, SKILL_IDS)).toBe('compare')
  })
})
