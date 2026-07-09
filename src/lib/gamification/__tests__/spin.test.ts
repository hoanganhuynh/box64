import { describe, it, expect } from 'vitest'
import {
  normalizeWeights, pickWeightedReward, excludeUnavailable,
  DEFAULT_SPIN_WEIGHTS, SPIN_REWARD_KEYS,
} from '../spin'

describe('normalizeWeights', () => {
  it('keeps valid weights and drops unknown keys', () => {
    const w = normalizeWeights({ slow_product: 1, freeship: 2, brand: 3, color: 4, nothing: 5, bogus: 99 })
    expect(w).toEqual({ slow_product: 1, freeship: 2, brand: 3, color: 4, nothing: 5 })
  })

  it('treats missing, negative and non-numeric values as 0 (while any valid weight remains)', () => {
    const w = normalizeWeights({ nothing: 10, freeship: -3, brand: 'x', color: NaN })
    expect(w.nothing).toBe(10)
    expect(w.freeship).toBe(0)
    expect(w.brand).toBe(0)
    expect(w.color).toBe(0)
    expect(w.slow_product).toBe(0)
  })

  it('falls back to defaults when everything is zero or config is garbage', () => {
    expect(normalizeWeights({})).toEqual(DEFAULT_SPIN_WEIGHTS)
    expect(normalizeWeights(null)).toEqual(DEFAULT_SPIN_WEIGHTS)
    expect(normalizeWeights('junk')).toEqual(DEFAULT_SPIN_WEIGHTS)
    expect(normalizeWeights({ slow_product: 0, freeship: 0, brand: 0, color: 0, nothing: 0 })).toEqual(DEFAULT_SPIN_WEIGHTS)
  })
})

describe('pickWeightedReward', () => {
  const even = { slow_product: 1, freeship: 1, brand: 1, color: 1, nothing: 1 }

  it('maps rand ranges to segments in declared key order', () => {
    expect(pickWeightedReward(even, 0)).toBe('slow_product')
    expect(pickWeightedReward(even, 0.19)).toBe('slow_product')
    expect(pickWeightedReward(even, 0.2)).toBe('freeship')
    expect(pickWeightedReward(even, 0.5)).toBe('brand')
    expect(pickWeightedReward(even, 0.65)).toBe('color')
    expect(pickWeightedReward(even, 0.99)).toBe('nothing')
  })

  it('never picks a zero-weight reward', () => {
    const w = { slow_product: 0, freeship: 0, brand: 0, color: 0, nothing: 1 }
    for (let r = 0; r < 1; r += 0.05) {
      expect(pickWeightedReward(w, r)).toBe('nothing')
    }
  })

  it('clamps out-of-range rand instead of crashing', () => {
    expect(SPIN_REWARD_KEYS).toContain(pickWeightedReward(even, -1))
    expect(pickWeightedReward(even, 1)).toBe('nothing')
    expect(pickWeightedReward(even, 99)).toBe('nothing')
  })

  it('respects heavy skew', () => {
    const w = { slow_product: 0, freeship: 0, brand: 0, color: 0, nothing: 100 }
    expect(pickWeightedReward(w, 0.5)).toBe('nothing')
  })
})

describe('excludeUnavailable', () => {
  it('zeroes unavailable rewards so mass shifts to the rest', () => {
    const w = excludeUnavailable({ ...DEFAULT_SPIN_WEIGHTS }, ['slow_product', 'brand'])
    expect(w.slow_product).toBe(0)
    expect(w.brand).toBe(0)
    expect(w.freeship).toBe(DEFAULT_SPIN_WEIGHTS.freeship)
  })

  it('never zeroes the "nothing" segment', () => {
    const w = excludeUnavailable({ ...DEFAULT_SPIN_WEIGHTS }, ['nothing'])
    expect(w.nothing).toBe(DEFAULT_SPIN_WEIGHTS.nothing)
  })

  it('degrades to nothing-only when every reward is unavailable and weights had no nothing mass', () => {
    const w = excludeUnavailable(
      { slow_product: 1, freeship: 1, brand: 1, color: 1, nothing: 0 },
      ['slow_product', 'freeship', 'brand', 'color'],
    )
    expect(pickWeightedReward(w, 0.3)).toBe('nothing')
  })
})
