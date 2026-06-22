import { createClient } from '@supabase/supabase-js'
import type { DesignState } from '@/lib/types'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export interface OrderRow {
  id: string
  user_id: string | null
  status: string
  items: Array<{ product_name: string; quantity: number; unit_price: number; image_url?: string; design_data?: DesignState }>
  shipping: { name: string; phone: string; line1: string; ward?: string; district: string; city: string }
  subtotal: number
  total: number
  discount: number
  coupon_code: string | null
  payment_method: string
  note: string | null
  created_at: string
}

export interface DayStat { day: string; revenue: number; orders: number }
export interface TopProduct { name: string; qty: number; revenue: number }

export async function getDashboardStats() {
  const db = getAdminClient()

  const [totals, monthly, today, chartRows, topProducts, recentOrders] = await Promise.all([
    // Lifetime totals
    db.from('orders')
      .select('total, user_id')
      .neq('status', 'cancelled'),

    // This month
    db.from('orders')
      .select('total')
      .neq('status', 'cancelled')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

    // Today
    db.from('orders')
      .select('total')
      .neq('status', 'cancelled')
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),

    // Revenue by day last 30 days (via RPC or manual aggregation)
    db.from('orders')
      .select('created_at, total')
      .neq('status', 'cancelled')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true }),

    // Top products from orders items
    db.from('orders')
      .select('items')
      .neq('status', 'cancelled'),

    // Recent orders
    db.from('orders')
      .select('id, shipping, total, status, created_at, items')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  // Process totals
  const rows = totals.data ?? []
  const totalRevenue = rows.reduce((s, r) => s + (r.total ?? 0), 0)
  const totalOrders = rows.length
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
  const totalCustomers = new Set(rows.map(r => r.user_id).filter(Boolean)).size

  const monthRevenue = (monthly.data ?? []).reduce((s, r) => s + (r.total ?? 0), 0)
  const monthOrders = (monthly.data ?? []).length
  const todayOrders = (today.data ?? []).length

  // Revenue chart — aggregate by day
  const dayMap = new Map<string, { revenue: number; orders: number }>()
  for (const r of chartRows.data ?? []) {
    const day = r.created_at.slice(0, 10)
    const prev = dayMap.get(day) ?? { revenue: 0, orders: 0 }
    dayMap.set(day, { revenue: prev.revenue + r.total, orders: prev.orders + 1 })
  }
  const chartData: DayStat[] = Array.from(dayMap.entries())
    .map(([day, v]) => ({ day, ...v }))
    .sort((a, b) => a.day.localeCompare(b.day))

  // Top products
  const productMap = new Map<string, { qty: number; revenue: number }>()
  for (const order of topProducts.data ?? []) {
    for (const item of order.items ?? []) {
      const key = item.product_name
      const prev = productMap.get(key) ?? { qty: 0, revenue: 0 }
      productMap.set(key, {
        qty: prev.qty + item.quantity,
        revenue: prev.revenue + item.unit_price * item.quantity,
      })
    }
  }
  const topProductsList: TopProduct[] = Array.from(productMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)

  return {
    totalRevenue,
    totalOrders,
    avgOrder,
    totalCustomers,
    monthRevenue,
    monthOrders,
    todayOrders,
    chartData,
    topProducts: topProductsList,
    recentOrders: (recentOrders.data ?? []) as OrderRow[],
  }
}

export async function getOrders(opts: {
  page?: number
  status?: string
  search?: string
}) {
  const db = getAdminClient()
  const PAGE_SIZE = 20
  const page = opts.page ?? 0

  let q = db.from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

  if (opts.status && opts.status !== 'all') {
    q = q.eq('status', opts.status)
  }

  if (opts.search?.trim()) {
    const s = opts.search.trim()
    q = q.or(`id.ilike.%${s}%,shipping->>name.ilike.%${s}%,shipping->>phone.ilike.%${s}%`)
  }

  const { data, error, count } = await q
  if (error) throw error

  return { orders: (data ?? []) as OrderRow[], total: count ?? 0, pageSize: PAGE_SIZE }
}

export async function getOrder(id: string) {
  const db = getAdminClient()
  const { data, error } = await db.from('orders').select('*').eq('id', id).single()
  if (error) throw error
  return data as OrderRow
}

export async function updateOrderStatus(id: string, status: string) {
  const db = getAdminClient()
  const { error } = await db.from('orders').update({ status }).eq('id', id)
  if (error) throw error
}

export interface CustomerRow {
  name: string
  phone: string
  orders: number
  spent: number
  lastOrder: string
}

export async function getCustomers(): Promise<CustomerRow[]> {
  const db = getAdminClient()
  const { data, error } = await db
    .from('orders')
    .select('shipping, total, created_at')
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })

  if (error) throw error

  const map = new Map<string, CustomerRow>()
  for (const order of data ?? []) {
    const phone = order.shipping?.phone ?? ''
    const existing = map.get(phone)
    if (existing) {
      existing.orders++
      existing.spent += order.total ?? 0
    } else {
      map.set(phone, {
        name: order.shipping?.name ?? 'Khách',
        phone,
        orders: 1,
        spent: order.total ?? 0,
        lastOrder: order.created_at,
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => b.spent - a.spent)
}
