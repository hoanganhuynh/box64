'use server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { COOKIE_NAME, verifyToken } from '@/lib/admin-auth'

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

export interface AdminNotification {
  id: string
  type: 'order' | 'comment' | 'user'
  title: string
  body: string | null
  href: string | null
  read: boolean
  created_at: string
}

const RETENTION_DAYS = 30

export async function getNotifications(): Promise<{ items: AdminNotification[]; unread: number }> {
  await requireAdmin()
  const client = db()

  // Retention: prune old rows opportunistically on fetch — no cron needed.
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString()
  await client.from('admin_notifications').delete().lt('created_at', cutoff)

  const [listRes, countRes] = await Promise.all([
    client.from('admin_notifications').select('*').order('created_at', { ascending: false }).limit(20),
    client.from('admin_notifications').select('id', { count: 'exact', head: true }).eq('read', false),
  ])
  return {
    items: (listRes.data ?? []) as AdminNotification[],
    unread: countRes.count ?? 0,
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  await requireAdmin()
  await db().from('admin_notifications').update({ read: true }).eq('id', id)
}

export async function markAllNotificationsRead(): Promise<void> {
  await requireAdmin()
  await db().from('admin_notifications').update({ read: true }).eq('read', false)
}
