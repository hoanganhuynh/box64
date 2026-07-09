// Pure spin-wheel math — no I/O so it's unit-testable. The server action
// layers DB reads/writes on top of this.

export const SPIN_REWARD_KEYS = ['slow_product', 'freeship', 'brand', 'color', 'nothing'] as const
export type SpinRewardKey = (typeof SPIN_REWARD_KEYS)[number]

export type SpinWeights = Record<SpinRewardKey, number>

export const DEFAULT_SPIN_WEIGHTS: SpinWeights = {
  slow_product: 5,
  freeship: 25,
  brand: 15,
  color: 15,
  nothing: 40,
}

// Sanitizes arbitrary jsonb into usable weights: unknown keys are dropped,
// missing/negative/non-finite values become 0. An all-zero result falls back
// to defaults so a broken config can never make the wheel unspinnable.
export function normalizeWeights(raw: unknown): SpinWeights {
  const src = (raw ?? {}) as Record<string, unknown>
  const out = {} as SpinWeights
  let total = 0
  for (const key of SPIN_REWARD_KEYS) {
    const v = Number(src[key])
    out[key] = Number.isFinite(v) && v > 0 ? v : 0
    total += out[key]
  }
  return total > 0 ? out : { ...DEFAULT_SPIN_WEIGHTS }
}

// rand ∈ [0, 1). Rewards whose weight is 0 can never be picked.
export function pickWeightedReward(weights: SpinWeights, rand: number): SpinRewardKey {
  const total = SPIN_REWARD_KEYS.reduce((s, k) => s + weights[k], 0)
  let cursor = Math.min(Math.max(rand, 0), 0.999999) * total
  for (const key of SPIN_REWARD_KEYS) {
    cursor -= weights[key]
    if (cursor < 0) return key
  }
  return 'nothing'
}

// Rewards that can't currently be fulfilled (no slow product configured, no
// brands/colors in catalog) are zeroed out so their probability mass
// redistributes to the remaining segments instead of granting dead prizes.
export function excludeUnavailable(weights: SpinWeights, unavailable: SpinRewardKey[]): SpinWeights {
  const out = { ...weights }
  for (const key of unavailable) {
    if (key !== 'nothing') out[key] = 0
  }
  const total = SPIN_REWARD_KEYS.reduce((s, k) => s + out[k], 0)
  return total > 0 ? out : { ...DEFAULT_SPIN_WEIGHTS, slow_product: 0, freeship: 0, brand: 0, color: 0, nothing: 1 }
}
