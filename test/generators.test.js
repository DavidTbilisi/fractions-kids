import { describe, it, expect } from 'vitest'
import { generate, generators } from '../src/fractions/generators.js'
import { SKILL_IDS, MAX_TIER } from '../src/skills/registry.js'

// Deterministic RNG (mulberry32) so test runs are reproducible.
function rngFrom(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const isFraction = (x) => x && typeof x === 'object' && 'n' in x && 'd' in x

describe('every generated problem is self-consistent', () => {
  for (const skill of SKILL_IDS) {
    for (let tier = 1; tier <= MAX_TIER; tier++) {
      it(`${skill} tier ${tier}: canonical answer passes its own check`, () => {
        const rng = rngFrom(skill.length * 100 + tier)
        for (let i = 0; i < 60; i++) {
          const p = generate(skill, tier, rng)
          expect(p.check(p.answer)).toBe(true)

          if (p.inputMode === 'choice') {
            // exactly one choice is correct, and denominators are valid
            const correct = p.choices.filter((c) => p.check(c.value))
            expect(correct.length).toBe(1)
            for (const c of p.choices) {
              if (isFraction(c.value)) expect(c.value.d).toBeGreaterThan(0)
            }
          }
        }
      })
    }
  }
})

describe('tier controls difficulty', () => {
  it('identify low tiers keep denominators small and visual', () => {
    const rng = rngFrom(7)
    for (let i = 0; i < 40; i++) {
      const t1 = generators.identify(1, rng)
      expect(t1.visual.d).toBeGreaterThanOrEqual(2)
      expect(t1.visual.d).toBeLessThanOrEqual(4)
      const t2 = generators.identify(2, rng)
      expect(t2.visual.d).toBeLessThanOrEqual(6)
    }
  })

  it('input mode shifts from choice to typed at higher tiers', () => {
    const rng = rngFrom(3)
    expect(generators.addsub(1, rng).inputMode).toBe('choice')
    expect(generators.addsub(2, rng).inputMode).toBe('choice')
    expect(generators.addsub(3, rng).inputMode).toBe('fraction')
    expect(generators.muldiv(1, rng).inputMode).toBe('choice')
    expect(generators.muldiv(3, rng).inputMode).toBe('fraction')
    expect(generators.identify(4, rng).inputMode).toBe('fraction')
    expect(generators.compare(1, rng).inputMode).toBe('choice')
  })
})

describe('generate()', () => {
  it('clamps tier into range', () => {
    expect(() => generate('identify', 99)).not.toThrow()
    expect(() => generate('identify', -5)).not.toThrow()
  })
  it('throws on unknown skill', () => {
    expect(() => generate('nope', 1)).toThrow()
  })
})
