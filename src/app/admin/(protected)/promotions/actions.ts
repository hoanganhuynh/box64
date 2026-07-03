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

export interface PromoCodeRow {
  id: string
  code: string
  type: 'fixed' | 'percent' | 'freeship'
  value: number
  scope: 'all' | 'attribute'
  attribute_key: string | null
  attribute_value: string | null
  max_uses: number | null
  used_count: number
  min_order_amount: number
  expires_at: string | null
  is_referral: boolean
  owner_id: string | null
  active: boolean
  created_at: string
}

export async function getPromoCodes(): Promise<PromoCodeRow[]> {
  await requireAdmin()
  const { data, error } = await db()
    .from('promo_codes')
    .select('*')
    .eq('is_referral', false)
    .order('created_at', { ascending: false })
  if (error) return []
  return data as PromoCodeRow[]
}

export interface ReferralStats {
  totalVouchers: number
  usedVouchers: number
  totalReferrals: number
}

export async function getReferralStats(): Promise<ReferralStats> {
  await requireAdmin()
  const client = db()
  const [{ count: totalVouchers }, { data: redemptions }, { count: totalReferrals }] = await Promise.all([
    client.from('promo_codes').select('id', { count: 'exact', head: true }).eq('is_referral', true),
    client.from('promo_codes').select('id, promo_code_redemptions(id)').eq('is_referral', true),
    client.from('referrals').select('id', { count: 'exact', head: true }),
  ])
  const usedVouchers = (redemptions ?? []).filter(r => Array.isArray(r.promo_code_redemptions) && r.promo_code_redemptions.length > 0).length
  return { totalVouchers: totalVouchers ?? 0, usedVouchers, totalReferrals: totalReferrals ?? 0 }
}

export type PromoCodeInput = Omit<PromoCodeRow, 'created_at' | 'used_count' | 'is_referral' | 'owner_id'>

export async function upsertPromoCode(row: PromoCodeInput): Promise<{ error?: string }> {
  await requireAdmin()
  const { data: prev } = await db().from('promo_codes').select('*').eq('id', row.id).maybeSingle()
  const { error } = await db().from('promo_codes').upsert({
    ...row,
    code: row.code.trim().toUpperCase(),
    is_referral: false,
  }, { onConflict: 'id' })
  if (error) return { error: error.message }
  await logAdminAction({
    action: prev ? 'update' : 'create', entityType: 'promo_code', entityId: row.id,
    entityLabel: row.code.trim().toUpperCase(), before: prev ?? null, after: row,
  })
  revalidatePath('/admin/promotions')
  return {}
}

export async function deletePromoCode(id: string): Promise<void> {
  await requireAdmin()
  const { data: prev } = await db().from('promo_codes').select('*').eq('id', id).maybeSingle()
  const { error } = await db().from('promo_codes').delete().eq('id', id)
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'delete', entityType: 'promo_code', entityId: id,
    entityLabel: prev?.code ?? id, before: prev ?? null,
  })
  revalidatePath('/admin/promotions')
}

export async function togglePromoCodeActive(id: string, active: boolean): Promise<void> {
  await requireAdmin()
  const { error } = await db().from('promo_codes').update({ active }).eq('id', id)
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'update', entityType: 'promo_code', entityId: id,
    entityLabel: `Mã ${id}`, before: { active: !active }, after: { active },
  })
  revalidatePath('/admin/promotions')
}
