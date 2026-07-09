'use server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CartItem } from '@/lib/types'
import {
  gameDb, getGameConfig, getBadgeStatus, computeBadgeDiscount,
  checkAndAwardQuests, randomRewardCode, QUEST_DEFS, type BadgeStatus,
} from '@/lib/gamification/game'
import {
  normalizeWeights, pickWeightedReward, excludeUnavailable,
  SPIN_REWARD_KEYS, type SpinRewardKey,
} from '@/lib/gamification/spin'

const SPIN_VOUCHER_DAYS = 7

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

export interface SpinHistoryEntry {
  id: string
  status: 'pending' | 'spun'
  reward_type: SpinRewardKey | null
  code: string | null
  code_value: number | null
  code_type: string | null
  spun_at: string | null
}

export interface QuestStatusEntry {
  key: string
  title: string
  description: string
  hint: string
  rewardValue: number
  achieved: boolean
  code: string | null
}

export interface MyGameStatus {
  badge: BadgeStatus
  pendingSpins: number
  spins: SpinHistoryEntry[]
  quests: QuestStatusEntry[]
}

export async function getMyGameStatus(): Promise<MyGameStatus | null> {
  const user = await getSessionUser()
  if (!user) return null

  // Lazy, idempotent quest sweep — self-heals even if a payment-confirm
  // hook was missed (e.g. an order marked paid before this feature shipped).
  await checkAndAwardQuests(user.id)

  const db = gameDb()
  const [badge, { data: spinRows }, { data: questRows }] = await Promise.all([
    getBadgeStatus(user.id),
    db.from('game_spins')
      .select('id, status, reward_type, spun_at, promo_codes(code, value, type)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    db.from('user_quests').select('quest_key, promo_codes(code)').eq('user_id', user.id),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spins: SpinHistoryEntry[] = ((spinRows as any[]) ?? []).map(s => ({
    id: s.id,
    status: s.status,
    reward_type: s.reward_type,
    code: s.promo_codes?.code ?? null,
    code_value: s.promo_codes?.value ?? null,
    code_type: s.promo_codes?.type ?? null,
    spun_at: s.spun_at,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const achievedByKey = new Map(((questRows as any[]) ?? []).map(q => [q.quest_key as string, q.promo_codes?.code ?? null]))
  const quests: QuestStatusEntry[] = QUEST_DEFS.map(q => ({
    key: q.key,
    title: q.title,
    description: q.description,
    hint: q.hint,
    rewardValue: q.rewardValue,
    achieved: achievedByKey.has(q.key),
    code: achievedByKey.get(q.key) ?? null,
  }))

  return {
    badge,
    pendingSpins: spins.filter(s => s.status === 'pending').length,
    spins,
    quests,
  }
}

export async function getPendingSpinCount(): Promise<number> {
  const user = await getSessionUser()
  if (!user) return 0
  const { count } = await gameDb()
    .from('game_spins')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'pending')
  return count ?? 0
}

// Checkout preview only — placeOrder recomputes independently server-side.
export async function getBadgeDiscountPreview(items: CartItem[]): Promise<{ discount: number; label: string | null }> {
  const user = await getSessionUser()
  if (!user) return { discount: 0, label: null }
  return computeBadgeDiscount(user.id, items)
}

export type SpinResult =
  | { success: true; reward: SpinRewardKey; segmentIndex: number; label: string; code: string | null }
  | { success: false; error: string }

const REWARD_LABELS: Record<SpinRewardKey, string> = {
  slow_product: 'Giảm 20% sản phẩm đặc biệt',
  freeship: 'Freeship đơn tiếp theo',
  brand: 'Giảm 10% theo hãng xe',
  color: 'Giảm 10% theo màu',
  nothing: 'Chúc bạn may mắn lần sau!',
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export async function spinWheel(spinId: string): Promise<SpinResult> {
  const user = await getSessionUser()
  if (!user) return { success: false, error: 'Vui lòng đăng nhập.' }

  const db = gameDb()
  const cfg = await getGameConfig()
  if (!cfg.spin_enabled) return { success: false, error: 'Vòng quay đang tạm đóng.' }

  // Resolve which rewards are actually fulfillable right now.
  const [{ data: slowProduct }, { data: brandRows }, { data: colorRows }] = await Promise.all([
    cfg.slow_product_id
      ? db.from('products').select('id, name').eq('id', cfg.slow_product_id).eq('published', true).maybeSingle()
      : Promise.resolve({ data: null }),
    db.from('products').select('brand').eq('published', true).not('brand', 'is', null),
    db.from('products').select('color').eq('published', true).not('color', 'is', null),
  ])
  const brands = Array.from(new Set((brandRows ?? []).map(r => r.brand as string).filter(b => b && b !== 'other')))
  const colors = Array.from(new Set((colorRows ?? []).map(r => r.color as string).filter(Boolean)))

  const unavailable: SpinRewardKey[] = []
  if (!slowProduct) unavailable.push('slow_product')
  if (brands.length === 0) unavailable.push('brand')
  if (colors.length === 0) unavailable.push('color')

  const weights = excludeUnavailable(normalizeWeights(cfg.spin_weights), unavailable)
  const reward = pickWeightedReward(weights, Math.random())

  // Claim the spin atomically WITH the decided reward — a double-submit or a
  // second tab loses the update (0 rows) instead of spinning twice.
  const { data: claimed } = await db
    .from('game_spins')
    .update({ status: 'spun', reward_type: reward, spun_at: new Date().toISOString() })
    .eq('id', spinId)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle()
  if (!claimed) return { success: false, error: 'Lượt quay không hợp lệ hoặc đã dùng.' }

  let code: string | null = null
  let label = REWARD_LABELS[reward]

  if (reward !== 'nothing') {
    const expiresAt = new Date(Date.now() + SPIN_VOUCHER_DAYS * 86400_000).toISOString()
    const base = {
      code: randomRewardCode('SPIN'),
      is_referral: false,
      owner_id: user.id,
      active: true,
      expires_at: expiresAt,
    }
    let insert: Record<string, unknown> | null = null
    if (reward === 'slow_product' && slowProduct) {
      insert = { ...base, type: 'percent', value: 20, scope: 'product', product_id: slowProduct.id }
      label = `Giảm 20% — ${slowProduct.name}`
    } else if (reward === 'freeship') {
      insert = { ...base, type: 'freeship', value: 100, scope: 'all' }
    } else if (reward === 'brand') {
      const brand = pickRandom(brands)
      insert = { ...base, type: 'percent', value: 10, scope: 'attribute', attribute_key: 'brand', attribute_value: brand }
      label = `Giảm 10% sản phẩm ${brand.charAt(0).toUpperCase() + brand.slice(1)}`
    } else if (reward === 'color') {
      const color = pickRandom(colors)
      insert = { ...base, type: 'percent', value: 10, scope: 'attribute', attribute_key: 'color', attribute_value: color }
      label = `Giảm 10% sản phẩm màu ${color}`
    }

    if (insert) {
      const { data: promo, error } = await db.from('promo_codes').insert(insert).select('id, code').single()
      if (error || !promo) {
        console.error('spinWheel voucher mint failed:', error?.message)
        // Spin is consumed but unrewarded — surface as "nothing" rather than
        // pretending a code exists.
        await db.from('game_spins').update({ reward_type: 'nothing' }).eq('id', spinId)
        return { success: true, reward: 'nothing', segmentIndex: SPIN_REWARD_KEYS.indexOf('nothing'), label: REWARD_LABELS.nothing, code: null }
      }
      code = promo.code
      await db.from('game_spins').update({ promo_code_id: promo.id }).eq('id', spinId)
    }
  }

  return { success: true, reward, segmentIndex: SPIN_REWARD_KEYS.indexOf(reward), label, code }
}
