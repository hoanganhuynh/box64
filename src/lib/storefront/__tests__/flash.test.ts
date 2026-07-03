import { describe, it, expect } from 'vitest'
import { pickWinningFlashItems, type FlashItemRow } from '../flash'

function row(over: Partial<FlashItemRow>): FlashItemRow {
  return {
    id: 'i1', product_id: 'p1', sale_price: 100000,
    quantity_limit: null, sold_count: 0,
    starts_at: '2026-07-01T00:00:00Z', ends_at: '2026-07-10T00:00:00Z',
    ...over,
  }
}

describe('pickWinningFlashItems', () => {
  it('maps product to its flash item', () => {
    const m = pickWinningFlashItems([row({})])
    expect(m.get('p1')?.sale_price).toBe(100000)
  })

  it('lowest sale price wins when a product is in overlapping sales', () => {
    const m = pickWinningFlashItems([
      row({ id: 'a', sale_price: 150000 }),
      row({ id: 'b', sale_price: 120000 }),
      row({ id: 'c', sale_price: 180000 }),
    ])
    expect(m.get('p1')?.id).toBe('b')
  })

  it('excludes sold-out items (limit reached)', () => {
    const m = pickWinningFlashItems([row({ quantity_limit: 10, sold_count: 10 })])
    expect(m.has('p1')).toBe(false)
  })

  it('sold-out cheaper item yields to in-stock pricier one', () => {
    const m = pickWinningFlashItems([
      row({ id: 'cheap', sale_price: 90000, quantity_limit: 5, sold_count: 5 }),
      row({ id: 'ok', sale_price: 110000 }),
    ])
    expect(m.get('p1')?.id).toBe('ok')
  })

  it('unlimited items (null limit) are never sold out', () => {
    const m = pickWinningFlashItems([row({ quantity_limit: null, sold_count: 99999 })])
    expect(m.has('p1')).toBe(true)
  })
})
