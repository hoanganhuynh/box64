'use server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { updateOrderStatus as dbUpdateStatus, updatePaymentStatus as dbUpdatePaymentStatus } from '@/lib/admin/queries'
import { COOKIE_NAME, verifyToken } from '@/lib/admin-auth'
import { logAdminAction } from '@/lib/admin/audit'

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
  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
}
