'use server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CartItem } from '@/lib/types'
import { previewDiscount, commitRedemption } from './promotions'

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
  subtotal: number,
  couponCode: string | undefined,
  shippingFee = 0,
  paymentMethod: 'transfer' | 'vietqr' | 'sepay' = 'transfer',
): Promise<PlaceOrderResult> {
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
