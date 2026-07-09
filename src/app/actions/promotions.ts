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
  type: 'fixed' | 'percent' | 'freeship'
  value: number
  scope: 'all' | 'attribute' | 'product'
  attribute_key: string | null
  attribute_value: string | null
  product_id: string | null
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

// Line total of the items a scoped code actually targets. Scope 'all'
// covers the whole subtotal.
function matchedLineTotal(promo: PromoCodeRow, items: CartItem[], subtotal: number): number {
  if (promo.scope === 'attribute' && promo.attribute_key && promo.attribute_value) {
    const target = promo.attribute_value.toLowerCase()
    return items.reduce(
      (sum, i) => (cartItemAttr(i, promo.attribute_key!) ?? '').toLowerCase() === target
        ? sum + i.unit_price * i.quantity : sum,
      0,
    )
  }
  if (promo.scope === 'product' && promo.product_id) {
    return items.reduce(
      (sum, i) => i.product_id === promo.product_id ? sum + i.unit_price * i.quantity : sum,
      0,
    )
  }
  return subtotal
}

function codeApplies(promo: PromoCodeRow, items: CartItem[], subtotal: number): boolean {
  if (!promo.active) return false
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) return false
  if (promo.max_uses !== null && promo.used_count >= promo.max_uses) return false
  if (subtotal < promo.min_order_amount) return false
  if (promo.scope !== 'all' && matchedLineTotal(promo, items, subtotal) <= 0) return false
  return true
}

// Fixed-amount codes are capped at subtotal + shipping (the full order
// total) rather than just subtotal — a fixed discount is meant to come off
// the whole order, not silently shrink because shipping isn't "discountable".
// Percent codes apply to the SCOPED items only ("giảm 10% Porsche" discounts
// the Porsche lines, not the entire cart); scope 'all' keeps the old
// whole-subtotal behavior.
function computeDiscount(promo: PromoCodeRow, items: CartItem[], subtotal: number, shippingFee: number): number {
  if (promo.type === 'percent') return Math.round(matchedLineTotal(promo, items, subtotal) * promo.value / 100)
  if (promo.type === 'freeship') return Math.round(shippingFee * promo.value / 100)
  return Math.min(promo.value, subtotal + shippingFee)
}

export interface ApplicableCode {
  code: string
  label: string
  discount: number
}

export async function getApplicableCodes(items: CartItem[], subtotal: number, shippingFee = 0): Promise<ApplicableCode[]> {
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
      discount: computeDiscount(c, items, subtotal, shippingFee),
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
  userId: string, code: string, items: CartItem[], subtotal: number, shippingFee = 0
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

  return { discount: computeDiscount(promo as PromoCodeRow, items, subtotal, shippingFee), promoCodeId: promo.id }
}

// Manual "enter a code" flow at checkout — resolves the user itself so the
// client never has to know its own user id. Distinct error messages per
// failure reason (unlike previewDiscount, which silently returns 0 for any
// failure since it's only ever used as a final re-check before order insert).
export async function applyCouponCode(
  code: string, items: CartItem[], subtotal: number, shippingFee = 0
): Promise<{ error?: string; discount?: number }> {
  const user = await getSessionUser()
  if (!user) return { error: 'Vui lòng đăng nhập để dùng mã giảm giá.' }

  const normalized = code.trim().toUpperCase()
  if (!normalized) return { error: 'Vui lòng nhập mã.' }

  const db = adminDb()
  const { data: promo } = await db.from('promo_codes').select('*').eq('code', normalized).maybeSingle()
  if (!promo) return { error: 'Mã không tồn tại.' }

  const { data: existing } = await db
    .from('promo_code_redemptions')
    .select('id')
    .eq('promo_code_id', promo.id)
    .eq('user_id', user.id)
    .maybeSingle()
  if (existing) return { error: 'Bạn đã dùng mã này rồi.' }

  if (promo.owner_id && promo.owner_id !== user.id) return { error: 'Mã không hợp lệ.' }
  if (!codeApplies(promo as PromoCodeRow, items, subtotal)) {
    return { error: 'Mã không áp dụng được cho đơn hàng này (đã hết hạn, hết lượt dùng, hoặc chưa đạt giá trị tối thiểu).' }
  }

  return { discount: computeDiscount(promo as PromoCodeRow, items, subtotal, shippingFee) }
}

export async function commitRedemption(promoCodeId: string, userId: string, orderId: string): Promise<void> {
  const db = adminDb()
  const { error } = await db.from('promo_code_redemptions').insert({ promo_code_id: promoCodeId, user_id: userId, order_id: orderId })
  if (error) return // race with another order — leave used_count untouched
  const { data: promo } = await db.from('promo_codes').select('used_count').eq('id', promoCodeId).single()
  await db.from('promo_codes').update({ used_count: (promo?.used_count ?? 0) + 1 }).eq('id', promoCodeId)
}
