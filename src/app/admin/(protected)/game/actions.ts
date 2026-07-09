'use server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { COOKIE_NAME, verifyToken } from '@/lib/admin-auth'
import { logAdminAction } from '@/lib/admin/audit'
import { normalizeWeights, type SpinRewardKey } from '@/lib/gamification/spin'

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

export interface GameConfigInput {
  spin_enabled: boolean
  badge_threshold: number
  badge_window_days: number
  badge_discount_pct: number
  slow_product_id: string | null
  spin_weights: Record<SpinRewardKey, number>
}

export interface GameAdminData {
  config: GameConfigInput & { badge_brand: string }
  products: Array<{ id: string; name: string }>
  stats: {
    pendingSpins: number
    spunTotal: number
    rewardCounts: Record<string, number>
    questsAchieved: number
    activeBadgeVouchers: number
  }
}

export async function getGameAdminData(): Promise<GameAdminData> {
  await requireAdmin()
  const client = db()

  const [{ data: cfg }, { data: products }, { data: spins }, { count: questsAchieved }] = await Promise.all([
    client.from('game_config').select('*').eq('id', true).maybeSingle(),
    client.from('products').select('id, name').eq('published', true).order('name'),
    client.from('game_spins').select('status, reward_type'),
    client.from('user_quests').select('user_id', { count: 'exact', head: true }),
  ])

  const rewardCounts: Record<string, number> = {}
  let pendingSpins = 0
  let spunTotal = 0
  for (const s of spins ?? []) {
    if (s.status === 'pending') pendingSpins += 1
    else {
      spunTotal += 1
      if (s.reward_type) rewardCounts[s.reward_type] = (rewardCounts[s.reward_type] ?? 0) + 1
    }
  }

  return {
    config: {
      spin_enabled: cfg?.spin_enabled ?? true,
      badge_brand: cfg?.badge_brand ?? 'porsche',
      badge_threshold: cfg?.badge_threshold ?? 5,
      badge_window_days: cfg?.badge_window_days ?? 60,
      badge_discount_pct: cfg?.badge_discount_pct ?? 10,
      slow_product_id: cfg?.slow_product_id ?? null,
      spin_weights: normalizeWeights(cfg?.spin_weights),
    },
    products: (products ?? []) as Array<{ id: string; name: string }>,
    stats: {
      pendingSpins,
      spunTotal,
      rewardCounts,
      questsAchieved: questsAchieved ?? 0,
      activeBadgeVouchers: 0,
    },
  }
}

export async function updateGameConfig(input: GameConfigInput): Promise<{ error?: string }> {
  await requireAdmin()

  const weights = normalizeWeights(input.spin_weights)
  const clean = {
    id: true,
    spin_enabled: input.spin_enabled,
    badge_threshold: Math.max(1, Math.round(input.badge_threshold)),
    badge_window_days: Math.max(1, Math.round(input.badge_window_days)),
    badge_discount_pct: Math.min(100, Math.max(0, Math.round(input.badge_discount_pct))),
    slow_product_id: input.slow_product_id || null,
    spin_weights: weights,
  }

  const { data: prev } = await db().from('game_config').select('*').eq('id', true).maybeSingle()
  const { error } = await db().from('game_config').upsert(clean)
  if (error) return { error: error.message }

  await logAdminAction({
    action: 'update', entityType: 'game_config', entityId: 'singleton',
    entityLabel: 'Cấu hình trò chơi', before: prev ?? null, after: clean,
  })
  revalidatePath('/admin/game')
  return {}
}
