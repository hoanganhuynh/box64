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

export interface OrderShipping {
  name: string
  phone: string
  line1: string
  ward?: string
  district: string
  city: string
}

export interface OrderDetail extends MyOrder {
  shipping: OrderShipping
  note: string | null
}

export async function getMyOrder(id: string): Promise<OrderDetail | null> {
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
  if (!user) return null

  // Belt and suspenders: RLS already scopes this to the owner, the .eq
  // narrows the query itself so a wrong id just 404s instead of relying
  // solely on the policy.
  const { data, error } = await supabase
    .from('orders')
    .select('id, status, payment_status, items, subtotal, total, discount, coupon_code, payment_method, created_at, shipping, note')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !data) return null
  return data as OrderDetail
}

export interface TrackedOrder extends MyOrder {
  shipping: OrderShipping
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

// No dedicated address book table in this project — checkout already reuses
// the shipping info from the customer's most recent order, so "saved
// addresses" on the account page is the same idea: distinct addresses
// pulled from order history, newest first.
export async function getMyAddresses(): Promise<OrderShipping[]> {
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

  const { data, error } = await supabase
    .from('orders')
    .select('shipping')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  const seen = new Set<string>()
  const addresses: OrderShipping[] = []
  for (const row of data) {
    const s = row.shipping as OrderShipping | null
    if (!s?.line1) continue
    const key = `${s.line1}|${s.ward ?? ''}|${s.district}|${s.city}`.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    addresses.push(s)
  }
  return addresses
}
