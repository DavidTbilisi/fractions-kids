// Pure, DOM-free fraction model. Every operation returns a new normalized
// fraction object { n, d } — fractions are treated as immutable values.
// The denominator is always kept positive; the sign lives on the numerator.

export function gcd(a, b) {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a || 1
}

export function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b)
}

// Factory. Normalizes sign onto the numerator. Rejects a zero denominator.
export function frac(n, d = 1) {
  if (d === 0) throw new Error('denominator cannot be 0')
  if (!Number.isInteger(n) || !Number.isInteger(d)) {
    throw new Error('fraction parts must be integers')
  }
  if (d < 0) {
    n = -n
    d = -d
  }
  return { n, d }
}

export function simplify(f) {
  const g = gcd(f.n, f.d)
  return { n: f.n / g, d: f.d / g }
}

export function isLowestTerms(f) {
  return gcd(f.n, f.d) === 1
}

// True value equality (cross-multiply), independent of representation.
export function equals(a, b) {
  return a.n * b.d === b.n * a.d
}

// -1 if a < b, 0 if equal, 1 if a > b. Denominators are always positive.
export function compare(a, b) {
  const diff = a.n * b.d - b.n * a.d
  return Math.sign(diff)
}

export function add(a, b) {
  return simplify(frac(a.n * b.d + b.n * a.d, a.d * b.d))
}

export function sub(a, b) {
  return simplify(frac(a.n * b.d - b.n * a.d, a.d * b.d))
}

export function mul(a, b) {
  return simplify(frac(a.n * b.n, a.d * b.d))
}

export function div(a, b) {
  if (b.n === 0) throw new Error('cannot divide by 0')
  return simplify(frac(a.n * b.d, a.d * b.n))
}

// { whole, n, d } where the fractional part is in lowest terms and 0 <= n < d.
export function toMixed(f) {
  const s = simplify(f)
  const whole = Math.trunc(s.n / s.d)
  const remN = Math.abs(s.n % s.d)
  return { whole, n: remN, d: s.d }
}

export function toString(f) {
  return `${f.n}/${f.d}`
}
