import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const MAX_BYTES = 5 * 1024 * 1024
const BUCKET = 'product-images'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File phải là ảnh' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File quá lớn (tối đa 5 MB)' }, { status: 400 })
  }

  const db = adminDb()
  const ext = file.name.split('.').pop() ?? 'png'
  const filename = `qr/bank-qr-${Date.now()}.${ext}`
  const bytes = Buffer.from(await file.arrayBuffer())

  const { data, error } = await db.storage
    .from(BUCKET)
    .upload(filename, bytes, { contentType: file.type, upsert: true })

  if (error) {
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
