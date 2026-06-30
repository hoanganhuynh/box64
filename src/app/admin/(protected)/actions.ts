'use server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { updateOrderStatus as dbUpdateStatus } from '@/lib/admin/queries'
import { COOKIE_NAME, verifyToken } from '@/lib/admin-auth'

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !verifyToken(token)) throw new Error('Unauthorized')
}

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin()
  await dbUpdateStatus(orderId, status)
  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin/dashboard')
}
