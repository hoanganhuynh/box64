import { describe, it, expectTypeOf } from 'vitest'
import type { Product, Order, Promotion, DesignState } from '@/lib/types'

describe('Product type', () => {
  it('has required fields', () => {
    const p: Product = {
      id: '1',
      type: 'box_catalog',
      name: 'Test Box',
      slug: 'test-box',
      price: 150000,
      images: ['https://example.com/img.jpg'],
      stock: 10,
      status: 'active',
    }
    expectTypeOf(p.type).toMatchTypeOf<'box_catalog' | 'box_custom' | 'accessory'>()
    expectTypeOf(p.status).toMatchTypeOf<'active' | 'pre_order' | 'out_of_stock'>()
  })
})

describe('Order type', () => {
  it('has required fields', () => {
    const o: Order = {
      id: '1',
      profile_id: 'user-1',
      status: 'pending',
      items: [],
      shipping: { name: 'A', line1: 'B', city: 'HCM', country: 'VN', phone: '0901234567' },
      total: 300000,
      payment_method: 'momo',
      created_at: new Date().toISOString(),
    }
    expectTypeOf(o.status).toMatchTypeOf<'pending' | 'printing' | 'shipped' | 'delivered' | 'cancelled'>()
    expectTypeOf(o.payment_method).toMatchTypeOf<'vnpay' | 'momo' | 'paypal'>()
  })
})

describe('Promotion type', () => {
  it('has required fields', () => {
    const promo: Promotion = {
      id: '1',
      type: 'sale',
      label: 'SALE 20% OFF',
      discount_pct: 20,
      starts_at: new Date().toISOString(),
      ends_at: new Date().toISOString(),
      product_ids: null,
      priority: 1,
    }
    expectTypeOf(promo.type).toMatchTypeOf<'sale' | 'pre_order' | 'flash_sale'>()
  })
})

describe('DesignState type', () => {
  it('has canvas fields', () => {
    const d: DesignState = {
      car_image_url: null,
      car_name: 'Lamborghini',
      specs_line: '1:64 · Gold',
      warning_text: 'WARNING: CHOKING HAZARD',
      logo_variant: 'minigt',
      custom_logo_url: null,
      bg_color: '#111212',
      accent_color: '#C9A84C',
      text_color: '#FFFFFF',
      logo_tint: '#FFFFFF',
      box_size: 'minigt',
      quantity: 1,
    }
    expectTypeOf(d.logo_variant).toMatchTypeOf<'minigt' | 'poprace' | 'custom'>()
    expectTypeOf(d.box_size).toMatchTypeOf<'minigt' | 'poprace'>()
  })
})
