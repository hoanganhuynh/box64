// Server-only gamification core: badge derivation, quest award, reward
// voucher minting. Uses the service role — never import from client code;
// go through src/app/actions/gamification.ts instead.
import { createClient } from '@supabase/supabase-js'
import type { CartItem } from '@/lib/types'

export function gameDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export function randomRewardCode(prefix: string, len = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const body = Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${prefix}-${body}`
}

export interface GameConfig {
  spin_enabled: boolean
  badge_brand: string
  badge_threshold: number
  badge_window_days: number
  badge_discount_pct: number
  slow_product_id: string | null
  spin_weights: unknown
}

const DEFAULT_CONFIG: GameConfig = {
  spin_enabled: true,
  badge_brand: 'porsche',
  badge_threshold: 5,
  badge_window_days: 60,
  badge_discount_pct: 10,
  slow_product_id: null,
  spin_weights: null,
}

export async function getGameConfig(): Promise<GameConfig> {
  const { data } = await gameDb().from('game_config').select('*').eq('id', true).maybeSingle()
  return (data as GameConfig | null) ?? DEFAULT_CONFIG
}

interface PaidOrderRow {
  items: Array<{ brand?: string | null; quantity?: number; product_id?: string }> | null
  created_at: string
}

async function getPaidOrders(userId: string, sinceIso?: string): Promise<PaidOrderRow[]> {
  let q = gameDb()
    .from('orders')
    .select('items, created_at')
    .eq('user_id', userId)
    .eq('payment_status', 'paid')
  if (sinceIso) q = q.gte('created_at', sinceIso)
  const { data } = await q
  return (data as PaidOrderRow[] | null) ?? []
}

export interface BadgeStatus {
  brand: string
  active: boolean
  count: number
  threshold: number
  windowDays: number
  discountPct: number
}

// Derived, rolling window: active whenever qualifying purchases within the
// last N days reach the threshold — buying more Porsche keeps extending it,
// old purchases falling out of the window naturally let it lapse.
export async function getBadgeStatus(userId: string): Promise<BadgeStatus> {
  const cfg = await getGameConfig()
  const since = new Date(Date.now() - cfg.badge_window_days * 86400_000).toISOString()
  const orders = await getPaidOrders(userId, since)
  const brand = cfg.badge_brand.toLowerCase()
  let count = 0
  for (const o of orders) {
    for (const item of o.items ?? []) {
      if ((item.brand ?? '').toLowerCase() === brand) count += item.quantity ?? 0
    }
  }
  return {
    brand: cfg.badge_brand,
    active: count >= cfg.badge_threshold,
    count,
    threshold: cfg.badge_threshold,
    windowDays: cfg.badge_window_days,
    discountPct: cfg.badge_discount_pct,
  }
}

// 10% (configurable) off the badge brand's items only — not the whole order.
export async function computeBadgeDiscount(userId: string, items: CartItem[]): Promise<{ discount: number; label: string | null }> {
  const status = await getBadgeStatus(userId)
  if (!status.active) return { discount: 0, label: null }
  const brand = status.brand.toLowerCase()
  const matched = items.reduce(
    (sum, i) => (i.brand ?? '').toLowerCase() === brand ? sum + i.unit_price * i.quantity : sum,
    0,
  )
  if (matched <= 0) return { discount: 0, label: null }
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  return {
    discount: Math.round(matched * status.discountPct / 100),
    label: `${cap(status.brand)} Lover −${status.discountPct}%`,
  }
}

// ─── Hidden quests ────────────────────────────────────────────────────────────

export interface QuestDef {
  key: string
  title: string
  description: string
  rewardValue: number
  hint: string
}

export const QUEST_DEFS: QuestDef[] = [
  {
    key: 'collector',
    title: 'Sưu tầm đủ bộ',
    description: 'Đã mua đủ cả 3 loại sản phẩm: box, water decal và phụ kiện 3D',
    rewardValue: 20000,
    hint: 'Thử khám phá đủ mọi loại sản phẩm của shop…',
  },
  {
    key: 'ambassador',
    title: 'Đại sứ FigBox',
    description: 'Đã mời thành công 3 người bạn tham gia FigBox',
    rewardValue: 50000,
    hint: 'Bạn bè của bạn cũng thích diecast đấy…',
  },
]

const COLLECTOR_TYPES = ['box_custom', 'water_decal', 'accessory_3d']
const QUEST_VOUCHER_DAYS = 30

async function questAchieved(userId: string, key: string): Promise<boolean> {
  const db = gameDb()
  if (key === 'collector') {
    const orders = await getPaidOrders(userId)
    const productIds = new Set<string>()
    for (const o of orders) for (const i of o.items ?? []) if (i.product_id) productIds.add(i.product_id)
    if (productIds.size === 0) return false
    const { data: prods } = await db.from('products').select('type').in('id', Array.from(productIds))
    const types = new Set((prods ?? []).map(p => p.type as string))
    return COLLECTOR_TYPES.every(t => types.has(t))
  }
  if (key === 'ambassador') {
    const { count } = await db.from('referrals').select('id', { count: 'exact', head: true }).eq('referrer_id', userId)
    return (count ?? 0) >= 3
  }
  return false
}

// Idempotent: the user_quests PK is the award guard — the insert claims the
// quest first, and only the claimer mints the voucher, so a double call (or
// two concurrent payment webhooks) can't issue two rewards.
export async function checkAndAwardQuests(userId: string): Promise<void> {
  const db = gameDb()
  const { data: done } = await db.from('user_quests').select('quest_key').eq('user_id', userId)
  const doneKeys = new Set((done ?? []).map(r => r.quest_key as string))

  for (const quest of QUEST_DEFS) {
    if (doneKeys.has(quest.key)) continue
    let achieved = false
    try {
      achieved = await questAchieved(userId, quest.key)
    } catch {
      continue // quest evaluation must never break the calling flow
    }
    if (!achieved) continue

    const { error: claimError } = await db.from('user_quests').insert({ user_id: userId, quest_key: quest.key })
    if (claimError) continue // someone else claimed concurrently

    const { data: promo } = await db.from('promo_codes').insert({
      code: randomRewardCode('QUEST'),
      type: 'fixed',
      value: quest.rewardValue,
      scope: 'all',
      is_referral: false,
      owner_id: userId,
      active: true,
      expires_at: new Date(Date.now() + QUEST_VOUCHER_DAYS * 86400_000).toISOString(),
    }).select('id').single()

    if (promo) {
      await db.from('user_quests').update({ promo_code_id: promo.id }).eq('user_id', userId).eq('quest_key', quest.key)
    }
  }
}
