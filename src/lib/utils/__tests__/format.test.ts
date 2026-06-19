import { describe, it, expect } from 'vitest'
import { formatVND, formatCountdown } from '@/lib/utils/format'

describe('formatVND', () => {
  it('formats integer to VND string', () => {
    expect(formatVND(150000)).toBe('150.000₫')
    expect(formatVND(1200000)).toBe('1.200.000₫')
    expect(formatVND(0)).toBe('0₫')
  })
})

describe('formatCountdown', () => {
  it('returns days/hours/mins from future ms delta', () => {
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000 + 25 * 60 * 1000
    const result = formatCountdown(twoDaysMs)
    expect(result.days).toBe(2)
    expect(result.hours).toBe(3)
    expect(result.minutes).toBe(25)
  })

  it('returns zeros for negative delta', () => {
    const result = formatCountdown(-1000)
    expect(result.days).toBe(0)
    expect(result.hours).toBe(0)
    expect(result.minutes).toBe(0)
    expect(result.seconds).toBe(0)
  })
})
