'use server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CartItem } from '@/lib/types'

export interface ShippingInput {
  name: string
  phone: string
  address: string
  city: string
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
  couponCode?: string,
  discount = 0,
): Promise<PlaceOrderResult> {
  if (!items.length) return { success: false, error: 'No items' }

  const orderId = generateOrderId()
  const total = subtotal - discount

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

  const orderItems = items.map(i => ({
    product_id: i.product_id,
    product_name: i.product_name,
    quantity: i.quantity,
    unit_price: i.unit_price,
    material: i.material,
    brand: i.brand,
    image_url: i.image_url,
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
      city: shipping.city,
      country: 'VN',
    },
    subtotal,
    total,
    payment_method: 'transfer',
    coupon_code: couponCode || null,
    discount,
    note: shipping.note || null,
  })

  if (error) {
    console.error('placeOrder error:', error)
    return { success: false, error: error.message }
  }

  return { success: true, orderId }
}
