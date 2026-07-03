'use server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { hashPassword, COOKIE_NAME, verifyToken } from '@/lib/admin-auth'

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

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !verifyToken(token)) throw new Error('Unauthorized')
}

export interface AuditLogRow {
  id: string
  admin_email: string
  action: 'create' | 'update' | 'delete'
  entity_type: string
  entity_id: string | null
  entity_label: string
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  created_at: string
}

const AUDIT_PAGE_SIZE = 25

export async function getAuditLogs(opts: {
  entityType?: string
  action?: string
  page?: number
}): Promise<{ rows: AuditLogRow[]; hasMore: boolean; entityTypes: string[] }> {
  await requireAdmin()
  const page = opts.page ?? 0
  let q = db()
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(page * AUDIT_PAGE_SIZE, page * AUDIT_PAGE_SIZE + AUDIT_PAGE_SIZE) // one extra row → hasMore
  if (opts.entityType) q = q.eq('entity_type', opts.entityType)
  if (opts.action) q = q.eq('action', opts.action)
  const { data, error } = await q
  if (error) throw new Error(error.message)

  const { data: typeRows } = await db()
    .from('admin_audit_logs')
    .select('entity_type')
    .limit(1000)
  const entityTypes = [...new Set((typeRows ?? []).map(r => r.entity_type))].sort()

  const rows = (data ?? []) as AuditLogRow[]
  return { rows: rows.slice(0, AUDIT_PAGE_SIZE), hasMore: rows.length > AUDIT_PAGE_SIZE, entityTypes }
}
