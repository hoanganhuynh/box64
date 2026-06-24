'use server'
import { createClient } from '@supabase/supabase-js'

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
  price: number
  images: string[]
  stock: number
  status: string
  description: string | null
  tags: string[]
  material: string | null
  brand: string | null
  created_at: string
}

export async function getProducts(): Promise<ProductRow[]> {
  const { data, error } = await db()
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as ProductRow[]
}

export async function upsertProduct(row: Omit<ProductRow, 'created_at'>): Promise<void> {
  const { error } = await db()
    .from('products')
    .upsert(row, { onConflict: 'id' })
  if (error) throw new Error(error.message)
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await db()
    .from('products')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}
