import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { COOKIE_NAME, verifyToken } from '@/lib/admin-auth'

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const BUCKET = 'product-images'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  if (!verifyToken(cookieStore.get(COOKIE_NAME)?.value ?? '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File phải là ảnh' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File quá lớn (tối đa 5 MB)' }, { status: 400 })
  }

  // Compress → WebP
  const input = Buffer.from(await file.arrayBuffer())
  const webp = await sharp(input)
    .resize(1400, 1400, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85, effort: 4 })
    .toBuffer()

  // Upload to Supabase Storage
  const db = adminDb()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`

  const { data, error } = await db.storage
    .from(BUCKET)
    .upload(filename, webp, { contentType: 'image/webp', upsert: false })

  if (error) {
    // Bucket missing → guide admin
    if (error.message.includes('not found') || error.message.includes('Bucket')) {
      return NextResponse.json(
        { error: `Bucket "${BUCKET}" chưa tồn tại. Tạo bucket public trong Supabase Storage.` },
        { status: 500 },
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: { publicUrl } } = db.storage.from(BUCKET).getPublicUrl(data.path)
  return NextResponse.json({ url: publicUrl })
}
