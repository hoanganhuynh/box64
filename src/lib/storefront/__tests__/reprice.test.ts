import { describe, it, expect } from 'vitest'
import { flashClaimPlan } from '../reprice'
import type { FlashItemRow } from '../flash'
import type { CartItem } from '@/lib/types'

function cartItem(over: Partial<CartItem>): CartItem {
  return {
    product_id: 'p1', product_name: 'Box', quantity: 1, unit_price: 150000,
    ...over,
  } as CartItem
}

function flashRow(over: Partial<FlashItemRow>): FlashItemRow {
  return {
    id: 'fi1', product_id: 'p1', sale_price: 100000,
    quantity_limit: 10, sold_count: 0,
    starts_at: '2026-07-01T00:00:00Z', ends_at: '2026-07-10T00:00:00Z',
    ...over,
  }
}

describe('flashClaimPlan', () => {
  it('plans a claim for a flash item', () => {
    const plan = flashClaimPlan([cartItem({ quantity: 2 })], new Map([['p1', flashRow({})]]))
    expect(plan).toEqual([{ index: 0, itemId: 'fi1', qty: 2, salePrice: 100000 }])
  })

  it('skips items without an active flash price', () => {
    expect(flashClaimPlan([cartItem({ product_id: 'p2' })], new Map([['p1', flashRow({})]]))).toEqual([])
  })

  it('skips variant lines — flash prices only apply to the base product', () => {
    const plan = flashClaimPlan(
      [cartItem({ variant_label: 'Custom Poprace' } as Partial<CartItem>)],
      new Map([['p1', flashRow({})]]),
    )
    expect(plan).toEqual([])
  })

  it('plans one claim per matching line', () => {
    const plan = flashClaimPlan(
      [cartItem({}), cartItem({ product_id: 'p2' }), cartItem({ quantity: 3 })],
      new Map([['p1', flashRow({})]]),
    )
    expect(plan.map(p => p.index)).toEqual([0, 2])
    expect(plan[1].qty).toBe(3)
  })
})
