'use server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
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

export interface BankSettings {
  bank_id: string
  account_number: string
  account_name: string
}

export async function getBankSettings(): Promise<BankSettings> {
  await requireAdmin()
  const { data } = await db()
    .from('bank_settings')
    .select('bank_id, account_number, account_name')
    .eq('id', 1)
    .single()
  return data ?? {
    bank_id: process.env.NEXT_PUBLIC_BANK_ID ?? 'MB',
    account_number: process.env.NEXT_PUBLIC_BANK_ACCOUNT ?? '',
    account_name: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ?? '',
  }
}

export async function updateBankSettings(
  settings: Partial<BankSettings>,
): Promise<{ error?: string }> {
  await requireAdmin()
  const { data: prev } = await db()
    .from('bank_settings')
    .select('bank_id, account_number, account_name')
    .eq('id', 1)
    .maybeSingle()
  const { error } = await db()
    .from('bank_settings')
    .upsert({ id: 1, ...settings, updated_at: new Date().toISOString() })
  if (error) return { error: error.message }
  await logAdminAction({
    action: 'update', entityType: 'payment', entityId: '1',
    entityLabel: 'Cài đặt thanh toán',
    before: prev ?? null, after: settings,
  })
  revalidatePath('/admin/payment')
  return {}
}
