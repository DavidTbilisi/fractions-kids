import { describe, it, expect } from 'vitest'
import { adjustTier, LADDER_CONFIG } from '../src/engine/ladder.js'

const T = (n) => Array(n).fill(true)
const F = (n) => Array(n).fill(false)

describe('adjustTier', () => {
  it('promotes after a correct streak', () => {
    const r = adjustTier(1, T(LADDER_CONFIG.promoteStreak))
    expect(r).toEqual({ tier: 2, change: 'up' })
  })

  it('demotes after enough misses in the window', () => {
    const r = adjustTier(3, [true, false, false])
    expect(r).toEqual({ tier: 2, change: 'down' })
  })

  it('holds when results are mixed and short', () => {
    expect(adjustTier(2, [true, false]).change).toBe('none')
  })

  it('does not promote past the max tier', () => {
    const r = adjustTier(LADDER_CONFIG.maxTier, T(LADDER_CONFIG.promoteStreak))
    expect(r.change).toBe('none')
    expect(r.tier).toBe(LADDER_CONFIG.maxTier)
  })

  it('does not demote below the min tier', () => {
    const r = adjustTier(LADDER_CONFIG.minTier, F(LADDER_CONFIG.demoteMisses))
    expect(r.change).toBe('none')
    expect(r.tier).toBe(LADDER_CONFIG.minTier)
  })

  it('prefers promotion when the latest streak qualifies', () => {
    // a miss earlier in the window, but the recent streak is clean
    const recent = [false, ...T(LADDER_CONFIG.promoteStreak)]
    expect(adjustTier(1, recent).change).toBe('up')
  })
})
