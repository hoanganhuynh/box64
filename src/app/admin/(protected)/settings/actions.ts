'use server'
import { createClient } from '@supabase/supabase-js'
import { hashPassword } from '@/lib/admin-auth'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

async function verifyCurrentPassword(current: string): Promise<boolean> {
  const { data } = await db().from('admin_settings').select('password_hash').eq('id', 1).single()
  if (data?.password_hash) {
    return hashPassword(current) === data.password_hash
  }
  // Fallback to env var (before first password change)
  return !!process.env.ADMIN_PASSWORD && current === process.env.ADMIN_PASSWORD
}

export async function changePassword(
  current: string,
  next: string,
): Promise<{ error?: string }> {
  if (!current || !next) return { error: 'Vui lòng điền đầy đủ thông tin.' }
  if (next.length < 8) return { error: 'Mật khẩu mới phải có ít nhất 8 ký tự.' }

  const valid = await verifyCurrentPassword(current)
  if (!valid) return { error: 'Mật khẩu hiện tại không đúng.' }

  const { error } = await db()
    .from('admin_settings')
    .upsert({ id: 1, password_hash: hashPassword(next), updated_at: new Date().toISOString() }, { onConflict: 'id' })

  if (error) return { error: 'Lưu thất bại, thử lại.' }
  return {}
}
