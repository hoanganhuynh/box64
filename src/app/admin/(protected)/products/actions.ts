'use server'
import { createClient } from '@supabase/supabase-js'
import { DUMMY_PRODUCTS } from '@/lib/data/products'
import type { ProductVariant } from '@/lib/types'
import { logAdminAction } from '@/lib/admin/audit'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export interface ProductRow {
  id: string
  type: string
  name: string
  slug: string
  sku: string | null
  manufacturer: string | null
  car_make: string | null
  car_model: string | null
  color: string | null
  color_group: string | null
  price: number
  variants: ProductVariant[]
  images: string[]
  stock: number
  status: string
  published: boolean
  description: string | null
  tags: string[]
  material: string | null
  brand: string | null
  created_at: string
  updated_at?: string | null
}

export async function getProducts(): Promise<ProductRow[]> {
  const { data, error } = await db()
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)

  // Auto-seed from DUMMY_PRODUCTS on first load if the table is empty
  if ((data ?? []).length === 0) {
    const seed = DUMMY_PRODUCTS.map(p => ({
      id: p.id,
      type: p.type,
      name: p.name,
      slug: p.slug,
      sku: p.sku ?? null,
      manufacturer: p.manufacturer ?? null,
      car_make: p.car_make ?? null,
      car_model: p.car_model ?? null,
      color: p.color ?? null,
      color_group: p.color_group ?? null,
      price: p.price,
      images: p.images,
      stock: p.stock,
      status: p.status,
      description: p.description ?? null,
      tags: p.tags ?? [],
      material: p.material ?? null,
      brand: p.brand ?? null,
    }))
    const { data: seeded } = await db().from('products').insert(seed).select()
    return (seeded ?? []) as ProductRow[]
  }

  return data as ProductRow[]
}

export async function upsertProduct(row: Omit<ProductRow, 'created_at'>): Promise<void> {
  const { data: prev } = await db().from('products').select('*').eq('id', row.id).maybeSingle()
  const { error } = await db()
    .from('products')
    .upsert(row, { onConflict: 'id' })
  if (error) {
    if (error.code === '23505' && error.message.includes('products_sku_unique')) {
      throw new Error(`SKU "${row.sku}" đã được dùng cho sản phẩm khác. Hãy đổi SKU khác.`)
    }
    throw new Error(error.message)
  }
  await logAdminAction({
    action: prev ? 'update' : 'create', entityType: 'product', entityId: row.id,
    entityLabel: row.name, before: prev ?? null, after: row,
  })
}

export async function deleteProduct(id: string): Promise<void> {
  const { data: prev } = await db().from('products').select('*').eq('id', id).maybeSingle()
  const { error } = await db()
    .from('products')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'delete', entityType: 'product', entityId: id,
    entityLabel: prev?.name ?? id, before: prev ?? null,
  })
}

export async function setPublished(id: string, published: boolean): Promise<void> {
  const { error } = await db()
    .from('products')
    .update({ published })
    .eq('id', id)
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'update', entityType: 'product', entityId: id,
    entityLabel: `Sản phẩm ${id}`,
    before: { published: !published }, after: { published },
  })
}

// ─── Bulk actions ─────────────────────────────────────────────────────────────

export async function bulkDelete(ids: string[]): Promise<void> {
  const { error } = await db().from('products').delete().in('id', ids)
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'delete', entityType: 'product', entityId: null,
    entityLabel: `Xóa hàng loạt ${ids.length} sản phẩm`, before: { ids },
  })
}

export async function bulkSetPublished(ids: string[], published: boolean): Promise<void> {
  const { error } = await db().from('products').update({ published }).in('id', ids)
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'update', entityType: 'product', entityId: null,
    entityLabel: `Cập nhật hàng loạt ${ids.length} sản phẩm`, before: { ids }, after: { published },
  })
}

export async function bulkSetStatus(ids: string[], status: string): Promise<void> {
  const { error } = await db().from('products').update({ status }).in('id', ids)
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'update', entityType: 'product', entityId: null,
    entityLabel: `Cập nhật hàng loạt ${ids.length} sản phẩm`, before: { ids }, after: { status },
  })
}

export async function bulkSetType(ids: string[], type: string): Promise<void> {
  const { error } = await db().from('products').update({ type }).in('id', ids)
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'update', entityType: 'product', entityId: null,
    entityLabel: `Cập nhật hàng loạt ${ids.length} sản phẩm`, before: { ids }, after: { type },
  })
}
