import { createClient } from '@supabase/supabase-js'
import type { Product } from '@/lib/types'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  )
}

type DbRow = {
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
  images: string[]
  stock: number
  status: string
  published: boolean
  description: string | null
  tags: string[]
  material: string | null
  brand: string | null
  created_at: string
}

function toProduct(row: DbRow): Product {
  return {
    id: row.id,
    type: row.type as Product['type'],
    name: row.name,
    slug: row.slug,
    sku: row.sku ?? undefined,
    manufacturer: row.manufacturer ?? undefined,
    car_make: row.car_make ?? undefined,
    car_model: row.car_model ?? undefined,
    color: row.color ?? undefined,
    color_group: row.color_group ?? undefined,
    price: row.price,
    images: row.images ?? [],
    stock: row.stock,
    status: row.status as Product['status'],
    description: row.description ?? undefined,
    tags: (row.tags ?? []) as Product['tags'],
    material: (row.material ?? undefined) as Product['material'],
    brand: (row.brand ?? undefined) as Product['brand'],
    created_at: row.created_at,
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await db()
    .from('products')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as DbRow[]).map(toProduct)
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const { data, error } = await db()
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  if (error || !data) return undefined
  return toProduct(data as DbRow)
}

export async function getAllSlugs(): Promise<string[]> {
  const { data } = await db()
    .from('products')
    .select('slug')
    .eq('published', true)
  return (data ?? []).map((r: { slug: string }) => r.slug)
}

export function getRelatedProducts(product: Product, all: Product[], limit = 4): Product[] {
  return all
    .filter(p =>
      p.id !== product.id &&
      (p.type === product.type || p.brand === product.brand || p.car_make === product.car_make)
    )
    .slice(0, limit)
}

export function getColorVariants(product: Product, all: Product[]): Product[] {
  if (!product.color_group) return []
  return all.filter(p => p.color_group === product.color_group && p.id !== product.id)
}
