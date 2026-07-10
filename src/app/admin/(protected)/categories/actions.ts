'use server'
import { createClient } from '@supabase/supabase-js'
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

export interface CategoryRow {
  id: string
  slug: string
  name: string
  description: string | null
  color: string
  sort_order: number
  created_at: string
}

export async function getCategories(): Promise<CategoryRow[]> {
  await requireAdmin()
  const { data, error } = await db()
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return data as CategoryRow[]
}

export async function upsertCategory(row: Omit<CategoryRow, 'created_at'>): Promise<void> {
  await requireAdmin()
  const { data: prev } = await db().from('categories').select('*').eq('id', row.id).maybeSingle()
  const { error } = await db()
    .from('categories')
    .upsert(row, { onConflict: 'id' })
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: prev ? 'update' : 'create', entityType: 'category', entityId: row.id,
    entityLabel: row.name, before: prev ?? null, after: row,
  })
}

export async function deleteCategory(id: string): Promise<void> {
  await requireAdmin()
  const { data: prev } = await db().from('categories').select('*').eq('id', id).maybeSingle()
  const { error } = await db()
    .from('categories')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'delete', entityType: 'category', entityId: id,
    entityLabel: prev?.name ?? id, before: prev ?? null,
  })
}

export async function getProductCountByCategory(): Promise<Record<string, number>> {
  await requireAdmin()
  const { data } = await db()
    .from('products')
    .select('type')
  if (!data) return {}
  const counts: Record<string, number> = {}
  for (const row of data) {
    counts[row.type] = (counts[row.type] ?? 0) + 1
  }
  return counts
}
