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

export interface BannedWordRow {
  id: string
  word: string
  created_at: string
}

export async function getBannedWords(): Promise<BannedWordRow[]> {
  await requireAdmin()
  const { data, error } = await db().from('banned_words').select('*').order('word', { ascending: true })
  if (error) return []
  return data as BannedWordRow[]
}

export async function addBannedWord(word: string): Promise<void> {
  await requireAdmin()
  const w = word.trim().toLowerCase()
  if (!w) return
  const { error } = await db().from('banned_words').insert({ word: w })
  if (error && !error.message.includes('duplicate')) throw new Error(error.message)
  if (!error) {
    await logAdminAction({
      action: 'create', entityType: 'moderation', entityLabel: `Từ cấm: ${w}`, after: { word: w },
    })
  }
  revalidatePath('/admin/moderation')
}

export async function deleteBannedWord(id: string): Promise<void> {
  await requireAdmin()
  const { data: prev } = await db().from('banned_words').select('*').eq('id', id).maybeSingle()
  const { error } = await db().from('banned_words').delete().eq('id', id)
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'delete', entityType: 'moderation',
    entityLabel: `Từ cấm: ${prev?.word ?? id}`, before: prev ?? null,
  })
  revalidatePath('/admin/moderation')
}

export interface BannedUserRow {
  id: string
  email: string | null
  full_name: string | null
  comment_violations: number
  comment_banned_at: string | null
}

// No `profiles` table in this project — user identity lives on auth.users.
// Banned accounts are tracked in user_moderation; email/name come from the
// Auth Admin API (service role only).
export async function getBannedUsers(): Promise<BannedUserRow[]> {
  await requireAdmin()
  const { data, error } = await db()
    .from('user_moderation')
    .select('user_id, comment_violations, comment_banned_at')
    .eq('comment_banned', true)
    .order('comment_banned_at', { ascending: false })
  if (error || !data) return []

  const rows = await Promise.all(data.map(async (row) => {
    const { data: userData } = await db().auth.admin.getUserById(row.user_id)
    return {
      id: row.user_id as string,
      email: userData?.user?.email ?? null,
      full_name: (userData?.user?.user_metadata?.full_name as string | undefined) ?? null,
      comment_violations: row.comment_violations as number,
      comment_banned_at: row.comment_banned_at as string | null,
    }
  }))
  return rows
}

export async function unbanUser(userId: string): Promise<void> {
  await requireAdmin()
  const { error } = await db().from('user_moderation').update({
    comment_banned: false,
    comment_violations: 0,
    comment_banned_at: null,
  }).eq('user_id', userId)
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'update', entityType: 'moderation',
    entityLabel: `User ${userId}`, after: { comment_banned: false },
  })
  revalidatePath('/admin/moderation')
}

export interface RecentCommentRow {
  id: string
  product_id: string
  content: string
  created_at: string
  user_name: string | null
  user_id: string
  product_name: string
  product_slug: string
  product_image: string | null
}

export async function getRecentComments(limit = 50): Promise<RecentCommentRow[]> {
  await requireAdmin()
  const { data, error } = await db()
    .from('product_comments')
    .select('id, product_id, content, created_at, user_name, user_id, products(name, slug, images)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error || !data) return []
  return data.map((d: any) => ({
    id: d.id,
    product_id: d.product_id,
    content: d.content,
    created_at: d.created_at,
    user_name: d.user_name,
    user_id: d.user_id,
    product_name: d.products?.name ?? 'Sản phẩm không rõ',
    product_slug: d.products?.slug ?? '',
    product_image: d.products?.images?.[0] ?? null,
  }))
}

export async function deleteComment(id: string): Promise<void> {
  await requireAdmin()
  const { data: prev } = await db().from('product_comments').select('*').eq('id', id).maybeSingle()
  const { error } = await db().from('product_comments').delete().eq('id', id)
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'delete', entityType: 'moderation',
    entityLabel: `Bình luận của ${prev?.user_name ?? 'user'}`, before: prev ?? null,
  })
  revalidatePath('/admin/moderation')
}

export interface AiConfig {
  system_prompt: string
  total_tokens_used: number
}

export async function getAiConfig(): Promise<AiConfig | null> {
  await requireAdmin()
  const { data, error } = await db().from('ai_moderation_config').select('*').eq('id', true).maybeSingle()
  if (error || !data) return null
  return {
    system_prompt: data.system_prompt,
    total_tokens_used: Number(data.total_tokens_used)
  }
}

export async function updateAiPrompt(prompt: string): Promise<void> {
  await requireAdmin()
  const { data: prev } = await db().from('ai_moderation_config').select('system_prompt').eq('id', true).maybeSingle()
  const { error } = await db().from('ai_moderation_config').update({ system_prompt: prompt }).eq('id', true)
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'update', entityType: 'moderation', entityLabel: 'AI moderation prompt',
    before: { prompt: prev?.system_prompt }, after: { prompt },
  })
  revalidatePath('/admin/moderation')
}
export async function banUserManually(userId: string): Promise<void> {
  await requireAdmin()
  const { error } = await db().from('user_moderation').upsert({
    user_id: userId,
    comment_banned: true,
    comment_violations: 4,
    comment_banned_at: new Date().toISOString()
  })
  if (error) throw new Error(error.message)
  await logAdminAction({
    action: 'update', entityType: 'moderation',
    entityLabel: `User ${userId}`, after: { comment_banned: true },
  })
  revalidatePath('/admin/moderation')
}

export interface ModerationLogRow {
  id: string
  user_id: string
  product_id: string
  content: string
  action: 'ALLOWED' | 'BLOCKED'
  reason: string | null
  created_at: string
  user_email: string | null
  user_name: string | null
  product_name: string
  product_slug: string
}

export async function getModerationLogs(limit = 100): Promise<ModerationLogRow[]> {
  await requireAdmin()
  const { data, error } = await db()
    .from('comment_moderation_logs')
    .select('id, user_id, product_id, content, action, reason, created_at, products(name, slug)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error || !data) return []
  
  const rows = await Promise.all(data.map(async (row: any) => {
    const { data: userData } = await db().auth.admin.getUserById(row.user_id)
    return {
      id: row.id,
      user_id: row.user_id,
      product_id: row.product_id,
      content: row.content,
      action: row.action,
      reason: row.reason,
      created_at: row.created_at,
      user_email: userData?.user?.email ?? null,
      user_name: (userData?.user?.user_metadata?.full_name as string | undefined) ?? null,
      product_name: row.products?.name ?? 'Sản phẩm không rõ',
      product_slug: row.products?.slug ?? '',
    }
  }))
  return rows
}

