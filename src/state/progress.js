// Progress persistence via localStorage. Versioned key so the schema can evolve
// without choking on old saved data.
//
// Shape:
//   { version: 1, skills: { [skillId]: { tier, total, correct, bestStreak } } }

const KEY = 'fractions-kids/v1'

function emptyProgress() {
  return { version: 1, skills: {} }
}

function emptySkill() {
  return { tier: 1, total: 0, correct: 0, bestStreak: 0 }
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw)
    if (!parsed || parsed.version !== 1 || typeof parsed.skills !== 'object') return emptyProgress()
    return parsed
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress))
  } catch {
    // Storage unavailable (private mode / quota) — degrade silently.
  }
}

export function getSkillProgress(progress, skillId) {
  return { ...emptySkill(), ...(progress.skills[skillId] || {}) }
}

// Fold a finished session's summary into the stored progress and save it.
export function recordSession(progress, summary) {
  const prev = getSkillProgress(progress, summary.skillId)
  progress.skills[summary.skillId] = {
    tier: summary.finalTier,
    total: prev.total + summary.total,
    correct: prev.correct + summary.correct,
    bestStreak: Math.max(prev.bestStreak, summary.bestStreak),
  }
  saveProgress(progress)
  return progress
}

export function resetProgress() {
  const fresh = emptyProgress()
  saveProgress(fresh)
  return fresh
}

// Pick the skill most in need of practice from the given ids: lowest tier first,
// then lowest accuracy, then least practised. Unplayed skills (accuracy 0,
// total 0) naturally sort to the front so breadth gets covered early.
export function pickFocusSkill(progress, skillIds) {
  let best = null
  for (const id of skillIds) {
    const sp = getSkillProgress(progress, id)
    const accuracy = sp.total ? sp.correct / sp.total : 0
    const key = [sp.tier, accuracy, sp.total]
    if (!best) {
      best = { id, key }
      continue
    }
    for (let i = 0; i < key.length; i++) {
      if (key[i] < best.key[i]) {
        best = { id, key }
        break
      }
      if (key[i] > best.key[i]) break
    }
  }
  return best ? best.id : skillIds[0]
}
