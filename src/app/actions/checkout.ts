'use server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CartItem } from '@/lib/types'
import { previewDiscount, commitRedemption } from './promotions'
import { getActiveFlashPrices, claimFlashStock, releaseFlashStock } from '@/lib/storefront/flash'
import { flashClaimPlan } from '@/lib/storefront/reprice'

export interface ShippingInput {
  name: string
  phone: string
  address: string
  ward: string
  district: string
  districtCode: number
  city: string
  provinceCode: number
  note?: string
}

export interface PlaceOrderResult {
  success: boolean
  orderId?: string
  error?: string
}

function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `FBX-${ts}-${rand}`
}

export async function placeOrder(
  shipping: ShippingInput,
  items: CartItem[],
  clientSubtotal: number,
  couponCode: string | undefined,
  shippingFee = 0,
  paymentMethod: 'transfer' | 'vietqr' | 'sepay' = 'transfer',
): Promise<PlaceOrderResult> {
  let subtotal = clientSubtotal
  if (!items.length) return { success: false, error: 'No items' }

  const orderId = generateOrderId()

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Flash-sale prices are server truth: re-resolve live prices, atomically
  // claim stock per line, and never trust the client's unit_price for flash
  // items. A failed claim (sold out between cart and checkout) reverts that
  // line to the product's base price.
  const flash = await getActiveFlashPrices(items.map(i => i.product_id))
  const plan = flashClaimPlan(items, flash)
  const claimedStock: Array<{ itemId: string; qty: number }> = []
  if (plan.length > 0) {
    const { data: baseRows, error: baseError } = await supabase
      .from('products')
      .select('id, price')
      .in('id', plan.map(c => items[c.index].product_id))
    if (baseError) console.error('placeOrder base-price lookup error:', baseError)
    const baseById = new Map((baseRows ?? []).map(r => [r.id, r.price]))

    // A missing base price (query error, or a product deleted since being
    // added to the sale) must never fall back to the client-supplied
    // unit_price — that's exactly the value a malicious client controls.
    for (const c of plan) {
      if (!baseById.has(items[c.index].product_id)) {
        return { success: false, error: 'Không xác định được giá sản phẩm, vui lòng thử lại.' }
      }
    }

    for (const c of plan) {
      const ok = await claimFlashStock(c.itemId, c.qty)
      const base = baseById.get(items[c.index].product_id)!
      if (ok) claimedStock.push({ itemId: c.itemId, qty: c.qty })
      items[c.index] = { ...items[c.index], unit_price: ok ? c.salePrice : base }
    }
    subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
  }

  // Discount is never trusted from the client — re-validated here against
  // the code's own rules (scope, expiry, per-user redemption) right before
  // the order total is computed.
  let discount = 0
  let promoCodeId: string | null = null
  if (couponCode && user) {
    const preview = await previewDiscount(user.id, couponCode, items, subtotal, shippingFee)
    discount = preview.discount
    promoCodeId = preview.promoCodeId
  }
  const total = subtotal + shippingFee - discount

  const orderItems = items.map(i => ({
    product_id: i.product_id,
    product_name: i.product_name,
    quantity: i.quantity,
    unit_price: i.unit_price,
    material: i.material,
    brand: i.brand,
    image_url: i.image_url,
    variant_label: i.variant_label,
  }))

  const { error } = await supabase.from('orders').insert({
    id: orderId,
    user_id: user?.id ?? null,
    status: 'pending',
    items: orderItems,
    shipping: {
      name: shipping.name,
      phone: shipping.phone,
      line1: shipping.address,
      ward: shipping.ward || null,
      district: shipping.district,
      district_code: shipping.districtCode,
      city: shipping.city,
      province_code: shipping.provinceCode,
      country: 'VN',
    },
    subtotal,
    total,
    payment_method: paymentMethod,
    coupon_code: couponCode || null,
    discount,
    note: shipping.note || null,
  })

  if (error) {
    console.error('placeOrder error:', error)
    for (const c of claimedStock) await releaseFlashStock(c.itemId, c.qty)
    return { success: false, error: error.message }
  }

  if (promoCodeId && user) {
    await commitRedemption(promoCodeId, user.id, orderId)
  }

  // Send order confirmation email. MUST be awaited — in a serverless runtime
  // a fire-and-forget promise is killed when the action returns, so the email
  // never actually goes out. Wrapped in try/catch so an email failure never
  // fails the order itself.
  if (user?.email) {
    try {
      const { error: emailError } = await supabase.functions.invoke('send-order-email', {
        body: {
          orderId,
          customerEmail: user.email,
          customerName: shipping.name,
          items: orderItems,
          shipping: {
            name: shipping.name,
            phone: shipping.phone,
            line1: shipping.address,
            ward: shipping.ward || '',
            district: shipping.district,
            city: shipping.city,
          },
          total,
        },
      })
      if (emailError) console.error('send-order-email error:', emailError)
    } catch (e) {
      console.error('send-order-email threw:', e)
    }
  }

  return { success: true, orderId }
}
