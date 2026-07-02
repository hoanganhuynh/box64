'use server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { CartItem } from '@/lib/types'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

async function getSessionUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

interface PromoCodeRow {
  id: string
  code: string
  type: 'fixed' | 'percent'
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
}

function cartItemAttr(item: CartItem, key: string): string | undefined {
  switch (key) {
    case 'brand': return item.brand
    case 'car_make': return item.car_make
    case 'color': return item.color
    case 'manufacturer': return item.manufacturer
    case 'type': return item.product_type
    default: return undefined
  }
}

function codeApplies(promo: PromoCodeRow, items: CartItem[], subtotal: number): boolean {
  if (!promo.active) return false
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) return false
  if (promo.max_uses !== null && promo.used_count >= promo.max_uses) return false
  if (subtotal < promo.min_order_amount) return false
  if (promo.scope === 'attribute' && promo.attribute_key && promo.attribute_value) {
    const target = promo.attribute_value.toLowerCase()
    const matches = items.some(i => (cartItemAttr(i, promo.attribute_key!) ?? '').toLowerCase() === target)
    if (!matches) return false
  }
  return true
}

function computeDiscount(promo: PromoCodeRow, subtotal: number): number {
  if (promo.type === 'percent') return Math.round(subtotal * promo.value / 100)
  return Math.min(promo.value, subtotal)
}

export interface ApplicableCode {
  code: string
  label: string
  discount: number
}

export async function getApplicableCodes(items: CartItem[], subtotal: number): Promise<ApplicableCode[]> {
  const user = await getSessionUser()
  if (!user) return []

  const db = adminDb()
  const { data: codes } = await db
    .from('promo_codes')
    .select('*')
    .or(`owner_id.is.null,owner_id.eq.${user.id}`)
  if (!codes) return []

  const { data: redemptions } = await db
    .from('promo_code_redemptions')
    .select('promo_code_id')
    .eq('user_id', user.id)
  const redeemedIds = new Set((redemptions ?? []).map(r => r.promo_code_id as string))

  return (codes as PromoCodeRow[])
    .filter(c => !redeemedIds.has(c.id) && codeApplies(c, items, subtotal))
    .map(c => ({
      code: c.code,
      label: c.is_referral ? `Voucher mời bạn — ${formatVndLabel(c.value)}` : c.code,
      discount: computeDiscount(c, subtotal),
    }))
    .sort((a, b) => b.discount - a.discount)
}

function formatVndLabel(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ'
}

// Re-validates server-side at order time — never trust a client-supplied
// discount amount. Read-only: does not mark the code as used. Call
// commitRedemption() after the order row exists (redemptions carry an
// order_id FK, so the order has to be inserted first).
export async function previewDiscount(
  userId: string, code: string, items: CartItem[], subtotal: number
): Promise<{ discount: number; promoCodeId: string | null }> {
  if (!code) return { discount: 0, promoCodeId: null }

  const db = adminDb()
  const { data: promo } = await db.from('promo_codes').select('*').eq('code', code).single()
  if (!promo) return { discount: 0, promoCodeId: null }

  const { data: existing } = await db
    .from('promo_code_redemptions')
    .select('id')
    .eq('promo_code_id', promo.id)
    .eq('user_id', userId)
    .maybeSingle()
  if (existing) return { discount: 0, promoCodeId: null }

  if (promo.owner_id && promo.owner_id !== userId) return { discount: 0, promoCodeId: null }
  if (!codeApplies(promo as PromoCodeRow, items, subtotal)) return { discount: 0, promoCodeId: null }

  return { discount: computeDiscount(promo as PromoCodeRow, subtotal), promoCodeId: promo.id }
}

export async function commitRedemption(promoCodeId: string, userId: string, orderId: string): Promise<void> {
  const db = adminDb()
  const { error } = await db.from('promo_code_redemptions').insert({ promo_code_id: promoCodeId, user_id: userId, order_id: orderId })
  if (error) return // race with another order — leave used_count untouched
  const { data: promo } = await db.from('promo_codes').select('used_count').eq('id', promoCodeId).single()
  await db.from('promo_codes').update({ used_count: (promo?.used_count ?? 0) + 1 }).eq('id', promoCodeId)
}
