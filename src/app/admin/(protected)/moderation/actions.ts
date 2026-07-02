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

export async function getBannedUsers(): Promise<BannedUserRow[]> {
  await requireAdmin()
  const { data, error } = await db()
    .from('profiles')
    .select('id, email, full_name, comment_violations, comment_banned_at')
    .eq('comment_banned', true)
    .order('comment_banned_at', { ascending: false })
  if (error) return []
  return data as BannedUserRow[]
}

export async function unbanUser(userId: string): Promise<void> {
  await requireAdmin()
  const { error } = await db().from('profiles').update({
    comment_banned: false,
    comment_violations: 0,
    comment_banned_at: null,
  }).eq('id', userId)
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
    .select('id, product_id, content, created_at, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(c => ({
    id: c.id,
    product_id: c.product_id,
    content: c.content,
    created_at: c.created_at,
    user_name: c.profiles?.full_name ?? null,
  }))
}

export async function deleteComment(id: string): Promise<void> {
  await requireAdmin()
  const { error } = await db().from('product_comments').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/moderation')
}
