// Problem generators, one per skill, parameterized by `tier` (1 = easiest).
// Every generator returns a Problem:
//
//   {
//     skill, tier,
//     prompt,                       // question text
//     visual: {type:'pie'|'bar', n, d} | null,
//     inputMode: 'choice' | 'fraction',
//     choices: [{key, label, value}] | null,   // present when inputMode==='choice'
//     answer,                       // canonical answer (fraction or primitive) for display/debug
//     check(value) -> boolean,      // grades a learner's answer
//   }
//
// For 'choice' problems, check() receives the chosen choice's `value`.
// For 'fraction' problems, check() receives a {n, d} object from the numpad.
//
// Generators accept an `rng` (defaults to Math.random) so tests can seed them.

import { frac, simplify, equals, compare, add, sub, mul, div, isLowestTerms, toString } from './fraction.js'
import { t } from '../i18n/index.js'

function randInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1))
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)]
}

function shuffle(rng, arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Build a unique, shuffled choice list. The answer goes in first; distractors
// follow but are dropped if they duplicate (by string) OR equal the answer's
// value (different representation) — guaranteeing exactly one correct choice.
function fractionChoices(rng, answer, distractors) {
  const seen = new Set([toString(answer)])
  const out = [{ key: toString(answer), label: toString(answer), value: answer }]
  for (const f of distractors) {
    const key = toString(f)
    if (seen.has(key) || equals(f, answer)) continue
    seen.add(key)
    out.push({ key, label: key, value: f })
  }
  return shuffle(rng, out)
}

// Plausible wrong fractions near `answer` (proper, positive, distinct).
function fractionDistractors(rng, answer, count) {
  const candidates = [
    frac(answer.n + 1, answer.d),
    frac(Math.max(1, answer.n - 1), answer.d),
    frac(answer.n, answer.d + 1),
    frac(answer.d, answer.n || 1), // flipped
    frac(answer.n + 1, answer.d + 1),
  ]
  const out = []
  for (const c of shuffle(rng, candidates)) {
    if (c.n < 1 || c.n >= c.d) continue // keep proper for young learners
    if (equals(c, answer)) continue
    if (out.some((o) => equals(o, c))) continue
    out.push(c)
    if (out.length === count) break
  }
  // Backfill if we ran short. Vary the denominator so there's always room for
  // a fresh proper fraction, and bound the loop so it can never spin forever.
  for (let g = 0; out.length < count && g < 60; g++) {
    const dd = answer.d + 2 + (g % 5)
    const nn = 1 + (g % (dd - 1))
    const c = frac(nn, dd)
    if (!equals(c, answer) && !out.some((o) => equals(o, c))) out.push(c)
  }
  return out
}

// ---- Identify & equivalence ------------------------------------------------

function genIdentify(tier, rng) {
  const skill = 'identify'

  if (tier <= 2) {
    // Name the shaded fraction from a visual.
    const d = tier === 1 ? randInt(rng, 2, 4) : randInt(rng, 2, 6)
    const n = randInt(rng, 1, d - 1)
    const answer = frac(n, d)
    const choices = fractionChoices(rng, answer, fractionDistractors(rng, answer, 3))
    return {
      skill,
      tier,
      prompt: t('prompt.whatShaded'),
      visual: { type: tier === 1 ? 'pie' : 'bar', n, d },
      inputMode: 'choice',
      choices,
      answer,
      check: (v) => equals(v, answer),
    }
  }

  if (tier === 3) {
    // Pick the fraction equivalent to a given one.
    const d = randInt(rng, 2, 5)
    const n = randInt(rng, 1, d - 1)
    const base = frac(n, d)
    const k = randInt(rng, 2, 3)
    const answer = frac(n * k, d * k)
    const distractors = [frac(n * k + 1, d * k), frac(n * k, d * k + 1), frac(n + 1, d + 1)]
    const choices = fractionChoices(rng, answer, distractors)
    return {
      skill,
      tier,
      prompt: t('prompt.equalTo', { frac: toString(base) }),
      visual: { type: 'bar', n, d },
      inputMode: 'choice',
      choices,
      answer,
      check: (v) => equals(v, base),
    }
  }

  // tier 4: simplify to lowest terms (typed answer).
  const d = randInt(rng, 2, 6)
  const n = randInt(rng, 1, d - 1)
  const k = randInt(rng, 2, 4)
  const given = frac(n * k, d * k)
  const answer = simplify(given)
  return {
    skill,
    tier,
    prompt: t('prompt.simplest', { frac: toString(given) }),
    visual: null,
    inputMode: 'fraction',
    choices: null,
    answer,
    check: (v) => equals(v, answer) && isLowestTerms(v),
  }
}

// ---- Compare & order -------------------------------------------------------

function genCompare(tier, rng) {
  const skill = 'compare'

  if (tier === 1) {
    // Same denominator: tap the bigger fraction.
    const d = randInt(rng, 3, 8)
    let a = randInt(rng, 1, d - 1)
    let b = randInt(rng, 1, d - 1)
    while (a === b) b = randInt(rng, 1, d - 1)
    const fa = frac(a, d)
    const fb = frac(b, d)
    const bigger = compare(fa, fb) > 0 ? fa : fb
    const choices = shuffle(rng, [fa, fb]).map((f) => ({ key: toString(f), label: toString(f), value: f }))
    return {
      skill,
      tier,
      prompt: t('prompt.tapBigger'),
      visual: null,
      inputMode: 'choice',
      choices,
      answer: bigger,
      check: (v) => equals(v, bigger),
    }
  }

  if (tier <= 3) {
    // Unlike denominators: tap the bigger fraction.
    const max = tier === 2 ? 6 : 10
    const da = randInt(rng, 2, max)
    const db = randInt(rng, 2, max)
    const fa = frac(randInt(rng, 1, da - 1), da)
    let fb = frac(randInt(rng, 1, db - 1), db)
    // Retry a bounded number of times, then force inequality by bumping the
    // denominator (db === 2 has only one proper fraction, so a plain retry loop
    // could never terminate when fa is also 1/2).
    for (let tries = 0; equals(fa, fb) && tries < 20; tries++) {
      fb = frac(randInt(rng, 1, db - 1), db)
    }
    if (equals(fa, fb)) fb = frac(fb.n, fb.d + 1)
    const bigger = compare(fa, fb) > 0 ? fa : fb
    const choices = shuffle(rng, [fa, fb]).map((f) => ({ key: toString(f), label: toString(f), value: f }))
    return {
      skill,
      tier,
      prompt: t('prompt.tapBigger'),
      visual: null,
      inputMode: 'choice',
      choices,
      answer: bigger,
      check: (v) => equals(v, bigger),
    }
  }

  // tier 4: tap the smallest of three.
  const make = () => {
    const d = randInt(rng, 2, 9)
    return frac(randInt(rng, 1, d - 1), d)
  }
  const set = []
  while (set.length < 3) {
    const f = make()
    if (!set.some((s) => equals(s, f))) set.push(f)
  }
  const smallest = set.reduce((m, f) => (compare(f, m) < 0 ? f : m), set[0])
  const choices = shuffle(rng, set).map((f) => ({ key: toString(f), label: toString(f), value: f }))
  return {
    skill,
    tier,
    prompt: t('prompt.tapSmallest'),
    visual: null,
    inputMode: 'choice',
    choices,
    answer: smallest,
    check: (v) => equals(v, smallest),
  }
}

// ---- Add & subtract --------------------------------------------------------

function genAddSub(tier, rng) {
  const skill = 'addsub'
  const op = tier === 1 ? 'add' : pick(rng, ['add', 'sub'])

  let fa, fb
  if (tier <= 2) {
    // Like denominators.
    const d = randInt(rng, 2, 8)
    let a = randInt(rng, 1, d - 1)
    let b = randInt(rng, 1, d - 1)
    if (op === 'sub' && b > a) [a, b] = [b, a] // keep result >= 0
    if (op === 'add' && a + b >= d) a = randInt(rng, 1, Math.max(1, d - b - 1)) // keep proper-ish
    fa = frac(a, d)
    fb = frac(b, d)
  } else {
    // Unlike denominators. Tier 3 keeps one denominator a multiple of the other.
    const d1 = randInt(rng, 2, tier === 3 ? 5 : 8)
    const d2 = tier === 3 ? d1 * randInt(rng, 2, 3) : randInt(rng, 2, 8)
    fa = frac(randInt(rng, 1, d1 - 1), d1)
    fb = frac(randInt(rng, 1, d2 - 1), d2)
    if (op === 'sub' && compare(fb, fa) > 0) [fa, fb] = [fb, fa]
  }

  const answer = op === 'add' ? add(fa, fb) : sub(fa, fb)
  const symbol = op === 'add' ? '+' : '−'
  const prompt = `${toString(fa)} ${symbol} ${toString(fb)} = ?`

  // An equation visual: the two operands drawn as bars with the operator. The
  // result is deliberately left out (a "?") so it never reveals a typed answer.
  const visual = { type: 'addsub', op, a: { n: fa.n, d: fa.d }, b: { n: fb.n, d: fb.d } }

  if (tier <= 2) {
    // Multiple choice with common-mistake distractors.
    const wrongAddDen =
      op === 'add' ? frac(fa.n + fb.n, fa.d + fb.d) : frac(Math.abs(fa.n - fb.n), Math.abs(fa.d - fb.d) || 1)
    const distractors = [simplify(wrongAddDen), frac(answer.n + 1, answer.d), frac(Math.max(1, answer.n - 1), answer.d)]
    const choices = fractionChoices(rng, answer, distractors)
    return { skill, tier, prompt, visual, inputMode: 'choice', choices, answer, check: (v) => equals(v, answer) }
  }

  // Typed answer for harder tiers.
  return {
    skill,
    tier,
    prompt: prompt + t('prompt.simplestSuffix'),
    visual,
    inputMode: 'fraction',
    choices: null,
    answer,
    check: (v) => equals(v, answer) && isLowestTerms(v),
  }
}

// ---- Multiply & divide -----------------------------------------------------

function genMulDiv(tier, rng) {
  const skill = 'muldiv'
  const op = tier <= 2 ? 'mul' : pick(rng, ['mul', 'div'])

  const da = randInt(rng, 2, tier <= 2 ? 5 : 6)
  const db = randInt(rng, 2, tier <= 2 ? 5 : 6)
  const fa = frac(randInt(rng, 1, da - 1), da)
  const fb = frac(randInt(rng, 1, db - 1), db)

  const answer = op === 'mul' ? mul(fa, fb) : div(fa, fb)
  const symbol = op === 'mul' ? '×' : '÷'
  const prompt = `${toString(fa)} ${symbol} ${toString(fb)} = ?`

  // Multiply → area model; divide → the unified-grid ratio strip.
  const visual = { type: op, a: { n: fa.n, d: fa.d }, b: { n: fb.n, d: fb.d } }

  if (tier === 1) {
    // Multiple choice for the gentlest multiply tier.
    const distractors = [
      simplify(frac(fa.n + fb.n, fa.d + fb.d)),
      frac(answer.n + 1, answer.d + 1),
      simplify(frac(fa.n * fb.d, fa.d * fb.n)), // confusing mul with div
    ]
    const choices = fractionChoices(rng, answer, distractors)
    return { skill, tier, prompt, visual, inputMode: 'choice', choices, answer, check: (v) => equals(v, answer) }
  }

  return {
    skill,
    tier,
    prompt: prompt + t('prompt.simplestSuffix'),
    visual,
    inputMode: 'fraction',
    choices: null,
    answer,
    check: (v) => equals(v, answer) && isLowestTerms(v),
  }
}

export const generators = {
  identify: genIdentify,
  compare: genCompare,
  addsub: genAddSub,
  muldiv: genMulDiv,
}

// Generate a problem for a skill at a tier. Tier is clamped to [1, 4].
export function generate(skillId, tier, rng = Math.random) {
  const gen = generators[skillId]
  if (!gen) throw new Error(`unknown skill: ${skillId}`)
  const t = Math.min(4, Math.max(1, tier))
  return gen(t, rng)
}
