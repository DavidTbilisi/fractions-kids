// A play session: a fixed-length stream of problems for one skill, with the
// adaptive ladder running between answers. UI-agnostic and storage-agnostic —
// the play screen drives it and persists the summary afterwards.

import { generate } from '../fractions/generators.js'
import { adjustTier } from './ladder.js'

export const SESSION_LENGTH = 10

export function createSession({ skillId, startTier = 1, length = SESSION_LENGTH, rng = Math.random } = {}) {
  let tier = startTier
  let recent = [] // booleans, cleared on every tier change
  let served = 0
  let current = null
  const stats = { total: 0, correct: 0, streak: 0, bestStreak: 0 }

  // Produce the next problem, or null when the session is over.
  function next() {
    if (served >= length) {
      current = null
      return null
    }
    current = generate(skillId, tier, rng)
    served++
    return current
  }

  // Grade the current problem. Returns feedback incl. any tier change.
  function answer(value) {
    if (!current) throw new Error('no active problem')
    const correct = current.check(value)
    stats.total++
    if (correct) {
      stats.correct++
      stats.streak++
      stats.bestStreak = Math.max(stats.bestStreak, stats.streak)
    } else {
      stats.streak = 0
    }

    recent.push(correct)
    const adj = adjustTier(tier, recent)
    let tierChange = 'none'
    if (adj.change !== 'none') {
      tier = adj.tier
      tierChange = adj.change
      recent = []
    }

    return { correct, tier, tierChange, answer: current.answer }
  }

  function summary() {
    return {
      skillId,
      finalTier: tier,
      total: stats.total,
      correct: stats.correct,
      bestStreak: stats.bestStreak,
      accuracy: stats.total ? stats.correct / stats.total : 0,
      length,
    }
  }

  return {
    next,
    answer,
    summary,
    get tier() {
      return tier
    },
    get served() {
      return served
    },
    get current() {
      return current
    },
    length,
  }
}
