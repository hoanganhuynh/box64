import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export interface FlashItemRow {
  id: string
  product_id: string
  sale_price: number
  quantity_limit: number | null
  sold_count: number
  starts_at: string
  ends_at: string
}

// Pure: given currently-live items (time window already filtered in SQL),
// pick one winner per product — lowest price wins, sold-out items excluded.
export function pickWinningFlashItems(rows: FlashItemRow[]): Map<string, FlashItemRow> {
  const map = new Map<string, FlashItemRow>()
  for (const r of rows) {
    if (r.quantity_limit !== null && r.sold_count >= r.quantity_limit) continue
    const cur = map.get(r.product_id)
    if (!cur || r.sale_price < cur.sale_price) map.set(r.product_id, r)
  }
  return map
}

export async function getActiveFlashPrices(productIds?: string[]): Promise<Map<string, FlashItemRow>> {
  const nowIso = new Date().toISOString()
  let q = db()
    .from('flash_sale_items')
    .select('id, product_id, sale_price, quantity_limit, sold_count, flash_sales!inner(active, starts_at, ends_at)')
    .eq('flash_sales.active', true)
    .lte('flash_sales.starts_at', nowIso)
    .gt('flash_sales.ends_at', nowIso)
  if (productIds && productIds.length > 0) q = q.in('product_id', productIds)
  const { data, error } = await q
  if (error || !data) {
    if (error) console.error('getActiveFlashPrices:', error.message)
    return new Map()
  }
  const rows: FlashItemRow[] = data.map(r => {
    const sale = r.flash_sales as unknown as { starts_at: string; ends_at: string }
    return {
      id: r.id, product_id: r.product_id, sale_price: r.sale_price,
      quantity_limit: r.quantity_limit, sold_count: r.sold_count,
      starts_at: sale.starts_at, ends_at: sale.ends_at,
    }
  })
  return pickWinningFlashItems(rows)
}

// True when the claim succeeded; false = would oversell → caller uses base price.
export async function claimFlashStock(itemId: string, qty: number): Promise<boolean> {
  const { data, error } = await db().rpc('claim_flash_sale_stock', { item_id: itemId, qty })
  if (error) {
    console.error('claimFlashStock:', error.message)
    return false
  }
  return Array.isArray(data) && data.length > 0
}

export async function releaseFlashStock(itemId: string, qty: number): Promise<void> {
  const { error } = await db().rpc('release_flash_sale_stock', { item_id: itemId, qty })
  if (error) console.error('releaseFlashStock:', error.message)
}
