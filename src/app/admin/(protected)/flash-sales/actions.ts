'use server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { COOKIE_NAME, verifyToken } from '@/lib/admin-auth'
import { logAdminAction } from '@/lib/admin/audit'
import { validateFlashSale } from '@/lib/admin/flash-validate'

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

export interface FlashSaleItemRow {
  id: string
  flash_sale_id: string
  product_id: string
  sale_price: number
  quantity_limit: number | null
  sold_count: number
  products: { name: string; price: number; images: string[] } | null
}

export interface FlashSaleRow {
  id: string
  name: string
  starts_at: string
  ends_at: string
  active: boolean
  created_at: string
  flash_sale_items: FlashSaleItemRow[]
}

export async function getFlashSales(): Promise<FlashSaleRow[]> {
  await requireAdmin()
  const { data, error } = await db()
    .from('flash_sales')
    .select('*, flash_sale_items(*, products(name, price, images))')
    .order('starts_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as FlashSaleRow[]
}

export interface PickerProduct { id: string; name: string; sku: string | null; price: number }

export async function getProductsForPicker(): Promise<PickerProduct[]> {
  await requireAdmin()
  const { data, error } = await db()
    .from('products')
    .select('id, name, sku, price')
    .order('name')
  if (error) throw new Error(error.message)
  return (data ?? []) as PickerProduct[]
}

export interface UpsertFlashSaleInput {
  id?: string
  name: string
  starts_at: string
  ends_at: string
  active: boolean
  items: Array<{ product_id: string; sale_price: number; quantity_limit: number | null }>
}

export async function upsertFlashSale(input: UpsertFlashSaleInput): Promise<{ error?: string }> {
  await requireAdmin()
  const client = db()

  // Validate against real base prices — never trust the client's copy.
  const ids = input.items.map(i => i.product_id)
  const { data: prods } = await client.from('products').select('id, price').in('id', ids)
  const priceById = new Map((prods ?? []).map(p => [p.id, p.price]))
  if (priceById.size !== ids.length && ids.some(id => !priceById.has(id))) {
    return { error: 'Có sản phẩm không tồn tại.' }
  }
  const validationError = validateFlashSale({
    name: input.name,
    starts_at: input.starts_at,
    ends_at: input.ends_at,
    items: input.items.map(i => ({ ...i, base_price: priceById.get(i.product_id)! })),
  })
  if (validationError) return { error: validationError }

  const { data: prev } = input.id
    ? await client.from('flash_sales').select('*, flash_sale_items(*)').eq('id', input.id).maybeSingle()
    : { data: null }
  // An id was given for an edit but no row matched — without this guard the
  // upsert below would silently INSERT a new row under that id instead of
  // surfacing that the sale being edited no longer exists.
  if (input.id && !prev) return { error: 'Đợt flash sale không tồn tại — có thể đã bị xóa.' }

  const salePayload = {
    ...(input.id ? { id: input.id } : {}),
    name: input.name.trim(),
    starts_at: input.starts_at,
    ends_at: input.ends_at,
    active: input.active,
  }
  const { data: sale, error } = await client
    .from('flash_sales')
    .upsert(salePayload, { onConflict: 'id' })
    .select('id')
    .single()
  if (error || !sale) return { error: error?.message ?? 'Lưu thất bại.' }

  // Reconcile items: drop removed products, upsert the rest. sold_count is
  // intentionally NOT in the payload so conflict-updates preserve it.
  const keepIds = input.items.map(i => i.product_id)
  const del = client.from('flash_sale_items').delete().eq('flash_sale_id', sale.id)
  const { error: delError } = keepIds.length > 0 ? await del.not('product_id', 'in', `(${keepIds.map(id => `"${id}"`).join(',')})`) : await del
  if (delError) return { error: delError.message }

  const { error: itemsError } = await client.from('flash_sale_items').upsert(
    input.items.map(i => ({
      flash_sale_id: sale.id,
      product_id: i.product_id,
      sale_price: i.sale_price,
      quantity_limit: i.quantity_limit,
    })),
    { onConflict: 'flash_sale_id,product_id' },
  )
  if (itemsError) return { error: itemsError.message }

  await logAdminAction({
    action: prev ? 'update' : 'create',
    entityType: 'flash_sale',
    entityId: sale.id,
    entityLabel: input.name.trim(),
    before: prev ?? null,
    after: { ...salePayload, items: input.items },
  })

  revalidatePath('/admin/flash-sales')
  revalidatePath('/')
  return {}
}

export async function deleteFlashSale(id: string): Promise<void> {
  await requireAdmin()
  const { data: prev } = await db().from('flash_sales').select('*, flash_sale_items(*)').eq('id', id).maybeSingle()
  const { error } = await db().from('flash_sales').delete().eq('id', id)
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'delete', entityType: 'flash_sale', entityId: id,
    entityLabel: prev?.name ?? id, before: prev ?? null,
  })
  revalidatePath('/admin/flash-sales')
  revalidatePath('/')
}

export async function toggleFlashSaleActive(id: string, active: boolean): Promise<void> {
  await requireAdmin()
  const { error } = await db().from('flash_sales').update({ active }).eq('id', id)
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'update', entityType: 'flash_sale', entityId: id,
    entityLabel: `Flash sale ${id}`, before: { active: !active }, after: { active },
  })
  revalidatePath('/admin/flash-sales')
  revalidatePath('/')
}
