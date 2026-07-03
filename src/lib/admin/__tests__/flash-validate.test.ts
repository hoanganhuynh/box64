import { describe, it, expect } from 'vitest'
import { validateFlashSale, type FlashSaleInput } from '../flash-validate'

function input(over: Partial<FlashSaleInput> = {}): FlashSaleInput {
  return {
    name: 'Sale hè',
    starts_at: '2026-07-05T00:00:00Z',
    ends_at: '2026-07-06T00:00:00Z',
    items: [{ product_id: 'p1', sale_price: 100000, quantity_limit: 10, base_price: 150000 }],
    ...over,
  }
}

describe('validateFlashSale', () => {
  it('accepts a valid input', () => {
    expect(validateFlashSale(input())).toBeNull()
  })
  it('rejects empty name', () => {
    expect(validateFlashSale(input({ name: '  ' }))).toMatch(/tên/i)
  })
  it('rejects starts_at >= ends_at', () => {
    expect(validateFlashSale(input({ ends_at: '2026-07-05T00:00:00Z' }))).toMatch(/thời gian/i)
    expect(validateFlashSale(input({ ends_at: '2026-07-04T00:00:00Z' }))).toMatch(/thời gian/i)
  })
  it('rejects invalid dates', () => {
    expect(validateFlashSale(input({ starts_at: 'abc' }))).toMatch(/thời gian/i)
  })
  it('rejects empty item list', () => {
    expect(validateFlashSale(input({ items: [] }))).toMatch(/sản phẩm/i)
  })
  it('rejects sale price not below base price', () => {
    expect(validateFlashSale(input({
      items: [{ product_id: 'p1', sale_price: 150000, quantity_limit: null, base_price: 150000 }],
    }))).toMatch(/giá/i)
  })
  it('rejects non-positive sale price and non-positive limit', () => {
    expect(validateFlashSale(input({
      items: [{ product_id: 'p1', sale_price: 0, quantity_limit: null, base_price: 150000 }],
    }))).toMatch(/giá/i)
    expect(validateFlashSale(input({
      items: [{ product_id: 'p1', sale_price: 1000, quantity_limit: 0, base_price: 150000 }],
    }))).toMatch(/số lượng/i)
  })
  it('rejects duplicate products', () => {
    expect(validateFlashSale(input({
      items: [
        { product_id: 'p1', sale_price: 1000, quantity_limit: null, base_price: 150000 },
        { product_id: 'p1', sale_price: 2000, quantity_limit: null, base_price: 150000 },
      ],
    }))).toMatch(/trùng/i)
  })
})
