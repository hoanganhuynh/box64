'use server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { DesignState } from '@/lib/types'

export interface MyOrderItem {
  product_name: string
  quantity: number
  unit_price: number
  image_url?: string
  design_data?: DesignState
  variant_label?: string
}

export interface MyOrder {
  id: string
  status: string
  payment_status: string
  items: MyOrderItem[]
  subtotal: number
  total: number
  discount: number
  coupon_code: string | null
  payment_method: string
  created_at: string
}

export async function getMyOrders(): Promise<MyOrder[]> {
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
  if (!user) return []

  // RLS policy "owner_select" (auth.uid() = user_id) already scopes this to
  // the caller's own orders — no service role needed.
  const { data, error } = await supabase
    .from('orders')
    .select('id, status, payment_status, items, subtotal, total, discount, coupon_code, payment_method, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return data as MyOrder[]
}

export interface TrackedOrder extends MyOrder {
  shipping: { name: string; phone: string; line1: string; ward?: string; district: string; city: string }
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '')
}

// Guest tracking — no login required. Order IDs are semi-guessable
// (FBX-<timestamp>-<random>), so knowing the ID alone isn't enough: the
// phone on the order must match too before any data is returned.
export async function trackOrder(orderId: string, phone: string): Promise<TrackedOrder | null> {
  const id = orderId.trim().toUpperCase()
  const phoneDigits = normalizePhone(phone)
  if (!id || !phoneDigits) return null

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )

  const { data } = await db
    .from('orders')
    .select('id, status, payment_status, items, subtotal, total, discount, coupon_code, payment_method, created_at, shipping')
    .eq('id', id)
    .maybeSingle()

  if (!data) return null
  if (normalizePhone(data.shipping?.phone ?? '') !== phoneDigits) return null

  return data as TrackedOrder
}
