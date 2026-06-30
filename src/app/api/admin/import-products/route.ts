import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyToken, COOKIE_NAME } from '@/lib/admin-auth'
import { cookies } from 'next/headers'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

function nanoid(len = 6) { return Math.random().toString(36).slice(2, 2 + len) }

function slugify(text: string) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value ?? ''
  if (!verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { rows } = await req.json() as { rows: Record<string, string>[] }
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'No rows' }, { status: 400 })
  }

  const records = rows.map(r => ({
    id:           r.id?.trim() || `fb-${nanoid()}`,
    name:         r.name?.trim() || '',
    type:         r.type?.trim() || 'box_custom',
    slug:         r.slug?.trim() || slugify(r.name?.trim() || ''),
    sku:          r.sku?.trim() || null,
    manufacturer: r.manufacturer?.trim() || null,
    car_make:     r.car_make?.trim() || null,
    car_model:    r.car_model?.trim() || null,
    color:        r.color?.trim() || null,
    color_group:  r.color_group?.trim() || null,
    price:        parseInt(r.price) || 0,
    stock:        parseInt(r.stock ?? '999') || 999,
    status:       r.status?.trim() || 'active',
    description:  r.description?.trim() || null,
    material:     r.material?.trim() || null,
    brand:        r.brand?.trim() || null,
    images:       r.images ? r.images.split('|').map(s => s.trim()).filter(Boolean) : [],
    tags:         r.tags ? r.tags.split('|').map(s => s.trim()).filter(Boolean) : [],
  })).filter(r => r.name)

  const { error, count } = await db()
    .from('products')
    .upsert(records, { onConflict: 'id', count: 'exact' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ imported: count ?? records.length })
}
