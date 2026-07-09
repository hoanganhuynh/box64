'use server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { updateOrderStatus as dbUpdateStatus, updatePaymentStatus as dbUpdatePaymentStatus } from '@/lib/admin/queries'
import { COOKIE_NAME, verifyToken } from '@/lib/admin-auth'
import { logAdminAction } from '@/lib/admin/audit'
import { checkAndAwardQuests } from '@/lib/gamification/game'

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

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin()
  const { data: prev } = await db().from('orders').select('status').eq('id', orderId).single()
  await dbUpdateStatus(orderId, status)
  await logAdminAction({
    action: 'update', entityType: 'order', entityId: orderId,
    entityLabel: `Đơn hàng ${orderId}`,
    before: { status: prev?.status }, after: { status },
  })
  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin/dashboard')
}

export async function updatePaymentStatus(orderId: string, paymentStatus: string) {
  await requireAdmin()
  const { data: prev } = await db().from('orders').select('payment_status').eq('id', orderId).single()
  await dbUpdatePaymentStatus(orderId, paymentStatus)
  await logAdminAction({
    action: 'update', entityType: 'order', entityId: orderId,
    entityLabel: `Đơn hàng ${orderId}`,
    before: { payment_status: prev?.payment_status }, after: { payment_status: paymentStatus },
  })

  // Manual confirm is a payment-confirmation path too — sweep quests for the
  // order's owner (spin grant is handled by the DB trigger).
  if (paymentStatus === 'paid') {
    const { data: order } = await db().from('orders').select('user_id').eq('id', orderId).maybeSingle()
    if (order?.user_id) {
      try { await checkAndAwardQuests(order.user_id) } catch (e) { console.error('quest check failed:', e) }
    }
  }

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
}
