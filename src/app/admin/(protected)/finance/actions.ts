'use server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { COOKIE_NAME, verifyToken } from '@/lib/admin-auth'
import { logAdminAction } from '@/lib/admin/audit'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !verifyToken(token)) throw new Error('Unauthorized')
}

export interface PartnerSplit {
  name: string
  pct: number
}

export interface FinanceSettings {
  print_cost_per_unit: number
  protect_box_cost_per_unit: number
  partner_splits: PartnerSplit[]
}

export interface FinanceEntry {
  id: string
  month: string
  customer_name: string
  quantity: number
  revenue: number
  order_id: string | null
  source: 'online' | 'external'
  note: string | null
  created_at: string
}

export async function getFinanceSettings(): Promise<FinanceSettings> {
  const { data } = await db()
    .from('finance_settings')
    .select('print_cost_per_unit, protect_box_cost_per_unit, partner_splits')
    .eq('id', 1)
    .single()
  return data ?? {
    print_cost_per_unit: 20000,
    protect_box_cost_per_unit: 5000,
    partner_splits: [{ name: 'A. Hoàng', pct: 30 }, { name: 'Ẩn', pct: 30 }, { name: 'An', pct: 40 }],
  }
}

export async function updateFinanceSettings(settings: FinanceSettings): Promise<void> {
  await requireAdmin()
  const { data: prev } = await db()
    .from('finance_settings')
    .select('print_cost_per_unit, protect_box_cost_per_unit, partner_splits')
    .eq('id', 1)
    .maybeSingle()
  const { error } = await db().from('finance_settings').upsert({ id: 1, ...settings, updated_at: new Date().toISOString() })
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'update', entityType: 'finance', entityId: '1',
    entityLabel: 'Cài đặt tài chính', before: prev ?? null, after: settings,
  })
  revalidatePath('/admin/finance')
}

export async function getFinanceEntries(month: string): Promise<FinanceEntry[]> {
  await requireAdmin()
  const { data, error } = await db()
    .from('finance_entries')
    .select('*')
    .eq('month', month)
    .order('created_at', { ascending: true })
  // Table not created yet (migration pending) — show empty state instead of crashing
  if (error) return []
  return data as FinanceEntry[]
}

export async function addFinanceEntry(input: {
  month: string; customer_name: string; quantity: number; revenue: number; note?: string
}): Promise<void> {
  await requireAdmin()
  const { error } = await db().from('finance_entries').insert({
    month: input.month,
    customer_name: input.customer_name,
    quantity: input.quantity,
    revenue: input.revenue,
    note: input.note || null,
    source: 'external',
  })
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'create', entityType: 'finance',
    entityLabel: `Bút toán ${input.customer_name} · ${input.month}`,
    after: { ...input, source: 'external' },
  })
  revalidatePath('/admin/finance')
}

export async function updateFinanceEntry(id: string, input: {
  customer_name: string; quantity: number; revenue: number; note?: string
}): Promise<void> {
  await requireAdmin()
  const { data: prev } = await db().from('finance_entries').select('*').eq('id', id).maybeSingle()
  const { error } = await db().from('finance_entries').update({
    customer_name: input.customer_name,
    quantity: input.quantity,
    revenue: input.revenue,
    note: input.note || null,
  }).eq('id', id)
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'update', entityType: 'finance', entityId: id,
    entityLabel: `Bút toán ${input.customer_name}`,
    before: prev ?? null, after: input,
  })
  revalidatePath('/admin/finance')
}

export async function deleteFinanceEntry(id: string): Promise<void> {
  await requireAdmin()
  const { data: prev } = await db().from('finance_entries').select('*').eq('id', id).maybeSingle()
  const { error } = await db().from('finance_entries').delete().eq('id', id)
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'delete', entityType: 'finance', entityId: id,
    entityLabel: `Bút toán ${prev?.customer_name ?? id}`,
    before: prev ?? null,
  })
  revalidatePath('/admin/finance')
}

// Pulls paid web orders for the given month that haven't been synced yet
// (finance_entries_order_id_idx keeps this idempotent — re-running is safe).
export async function syncOnlineOrders(month: string): Promise<{ added: number }> {
  await requireAdmin()
  const [year, mon] = month.split('-').map(Number)
  const from = new Date(Date.UTC(year, mon - 1, 1)).toISOString()
  const to = new Date(Date.UTC(year, mon, 1)).toISOString()

  const { data: orders, error } = await db()
    .from('orders')
    .select('id, shipping, items, total, created_at')
    .eq('payment_status', 'paid')
    .gte('created_at', from)
    .lt('created_at', to)
  if (error) throw new Error(error.message)

  const { data: existing } = await db()
    .from('finance_entries')
    .select('order_id')
    .eq('month', month)
    .not('order_id', 'is', null)
  const existingIds = new Set((existing ?? []).map(e => e.order_id))

  type OrderRow = {
    id: string
    shipping: { name?: string } | null
    items: Array<{ quantity: number }> | null
    total: number
  }
  const toInsert = ((orders ?? []) as OrderRow[])
    .filter(o => !existingIds.has(o.id))
    .map(o => ({
      month,
      customer_name: o.shipping?.name ?? 'Khách web',
      quantity: (o.items ?? []).reduce((sum, i) => sum + (i.quantity ?? 0), 0),
      revenue: o.total,
      order_id: o.id,
      source: 'online' as const,
    }))

  if (toInsert.length === 0) return { added: 0 }

  const { error: insertError } = await db().from('finance_entries').insert(toInsert)
  if (insertError) throw new Error(insertError.message)
  const result = { added: toInsert.length }
  await logAdminAction({
    action: 'create', entityType: 'finance',
    entityLabel: `Đồng bộ đơn online tháng ${month}`, after: { month, added: result.added },
  })
  revalidatePath('/admin/finance')
  return result
}

export async function getAvailableMonths(): Promise<string[]> {
  await requireAdmin()
  const { data } = await db().from('finance_entries').select('month')
  const months = new Set((data ?? []).map(r => r.month as string))
  const now = new Date()
  months.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
  return Array.from(months).sort().reverse()
}
