import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { COOKIE_NAME, verifyToken } from '@/lib/admin-auth'

export type AuditAction = 'create' | 'update' | 'delete'

export interface AuditEntry {
  action: AuditAction
  entityType: string
  entityId?: string | null
  entityLabel: string
  before?: unknown
  after?: unknown
}

// Fire-and-forget audit write — resolves the admin email from the session
// cookie itself so call sites stay one-liners. A logging failure must never
// fail the parent action.
export async function logAdminAction(entry: AuditEntry): Promise<void> {
  try {
    const cookieStore = await cookies()
    const email = verifyToken(cookieStore.get(COOKIE_NAME)?.value ?? '') ?? 'unknown'
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    )
    const { error } = await db.from('admin_audit_logs').insert({
      admin_email: email,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId != null ? String(entry.entityId) : null,
      entity_label: entry.entityLabel,
      before: entry.before ?? null,
      after: entry.after ?? null,
    })
    if (error) console.error('logAdminAction insert failed:', error.message)
  } catch (e) {
    console.error('logAdminAction threw:', e)
  }
}
