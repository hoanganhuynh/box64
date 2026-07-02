'use server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
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

export interface CustomRequestRow {
  id: string
  name: string
  phone: string
  car_models: string[]
  image_urls: string[]
  search_query: string | null
  source: string
  status: string
  created_at: string
}

export async function getCustomRequests(): Promise<CustomRequestRow[]> {
  await requireAdmin()
  const { data, error } = await db()
    .from('custom_requests')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data as CustomRequestRow[]
}

export async function updateRequestStatus(id: string, status: string): Promise<void> {
  await requireAdmin()
  const { error } = await db().from('custom_requests').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/requests')
}

export async function deleteCustomRequest(id: string): Promise<void> {
  await requireAdmin()
  const { error } = await db().from('custom_requests').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/requests')
}
