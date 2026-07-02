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
  revalidatePath('/admin/moderation')
}

export async function deleteBannedWord(id: string): Promise<void> {
  await requireAdmin()
  const { error } = await db().from('banned_words').delete().eq('id', id)
  if (error) throw new Error(error.message)
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
  revalidatePath('/admin/moderation')
}

export interface RecentCommentRow {
  id: string
  product_id: string
  content: string
  created_at: string
  user_name: string | null
}

export async function getRecentComments(limit = 50): Promise<RecentCommentRow[]> {
  await requireAdmin()
  const { data, error } = await db()
    .from('product_comments')
    .select('id, product_id, content, created_at, user_name')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return data as RecentCommentRow[]
}

export async function deleteComment(id: string): Promise<void> {
  await requireAdmin()
  const { error } = await db().from('product_comments').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/moderation')
}
