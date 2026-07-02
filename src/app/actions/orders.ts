'use server'
import { createServerClient } from '@supabase/ssr'
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
