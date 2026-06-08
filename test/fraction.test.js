import { describe, it, expect } from 'vitest'
import { gcd, frac, simplify, equals, compare, add, sub, mul, div, toMixed, isLowestTerms } from '../src/fractions/fraction.js'

describe('gcd', () => {
  it('computes greatest common divisor', () => {
    expect(gcd(12, 8)).toBe(4)
    expect(gcd(7, 5)).toBe(1)
    expect(gcd(0, 5)).toBe(5)
  })
  it('never returns 0', () => {
    expect(gcd(0, 0)).toBe(1)
  })
})

describe('frac', () => {
  it('moves a negative sign onto the numerator', () => {
    expect(frac(1, -2)).toEqual({ n: -1, d: 2 })
  })
  it('rejects a zero denominator', () => {
    expect(() => frac(1, 0)).toThrow()
  })
  it('rejects non-integers', () => {
    expect(() => frac(1.5, 2)).toThrow()
  })
})

describe('simplify / isLowestTerms', () => {
  it('reduces to lowest terms', () => {
    expect(simplify(frac(4, 8))).toEqual({ n: 1, d: 2 })
    expect(simplify(frac(9, 6))).toEqual({ n: 3, d: 2 })
  })
  it('leaves already-reduced fractions alone', () => {
    expect(simplify(frac(3, 5))).toEqual({ n: 3, d: 5 })
    expect(isLowestTerms(frac(3, 5))).toBe(true)
    expect(isLowestTerms(frac(4, 8))).toBe(false)
  })
})

describe('equals / compare', () => {
  it('treats different representations of the same value as equal', () => {
    expect(equals(frac(1, 2), frac(2, 4))).toBe(true)
    expect(equals(frac(1, 2), frac(2, 3))).toBe(false)
  })
  it('orders fractions', () => {
    expect(compare(frac(1, 3), frac(1, 2))).toBe(-1)
    expect(compare(frac(3, 4), frac(2, 3))).toBe(1)
    expect(compare(frac(2, 4), frac(1, 2))).toBe(0)
  })
})

describe('arithmetic', () => {
  it('adds and subtracts with unlike denominators', () => {
    expect(add(frac(1, 2), frac(1, 3))).toEqual({ n: 5, d: 6 })
    expect(sub(frac(3, 4), frac(1, 4))).toEqual({ n: 1, d: 2 })
  })
  it('multiplies and divides', () => {
    expect(mul(frac(2, 3), frac(3, 4))).toEqual({ n: 1, d: 2 })
    expect(div(frac(1, 2), frac(1, 4))).toEqual({ n: 2, d: 1 })
  })
  it('handles negatives', () => {
    expect(sub(frac(1, 4), frac(1, 2))).toEqual({ n: -1, d: 4 })
  })
  it('throws on divide by zero', () => {
    expect(() => div(frac(1, 2), frac(0, 5))).toThrow()
  })
})

describe('toMixed', () => {
  it('splits an improper fraction', () => {
    expect(toMixed(frac(7, 2))).toEqual({ whole: 3, n: 1, d: 2 })
    expect(toMixed(frac(3, 5))).toEqual({ whole: 0, n: 3, d: 5 })
  })
})
