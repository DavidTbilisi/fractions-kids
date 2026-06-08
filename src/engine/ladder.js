// Adaptive difficulty ladder — pure logic, no DOM, no storage.
//
// Given the current tier and a list of recent results (booleans, most recent
// last), decide whether to move the learner up, down, or hold. The caller is
// expected to CLEAR its recent-results buffer whenever the tier changes, so a
// single great streak promotes only one tier at a time.

export const LADDER_CONFIG = {
  promoteStreak: 3, // this many correct in a row -> move up
  demoteMisses: 2, // this many misses within the window -> move down
  windowSize: 5, // how many recent results the demotion check looks at
  minTier: 1,
  maxTier: 4,
}

export function adjustTier(tier, recent, config = LADDER_CONFIG) {
  const tail = recent.slice(-config.promoteStreak)
  if (tail.length === config.promoteStreak && tail.every(Boolean) && tier < config.maxTier) {
    return { tier: tier + 1, change: 'up' }
  }

  const window = recent.slice(-config.windowSize)
  const misses = window.filter((r) => !r).length
  if (misses >= config.demoteMisses && tier > config.minTier) {
    return { tier: tier - 1, change: 'down' }
  }

  return { tier, change: 'none' }
}
