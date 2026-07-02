'use server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { containsBannedWord } from '@/lib/moderation/profanity'

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

export interface CommentRow {
  id: string
  product_id: string
  user_id: string
  content: string
  created_at: string
  user_name: string | null
  user_avatar: string | null
}

export async function getComments(productId: string): Promise<CommentRow[]> {
  const { data, error } = await adminDb()
    .from('product_comments')
    .select('id, product_id, user_id, content, created_at, profiles(full_name, avatar_url)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  if (error) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(c => ({
    id: c.id,
    product_id: c.product_id,
    user_id: c.user_id,
    content: c.content,
    created_at: c.created_at,
    user_name: c.profiles?.full_name ?? null,
    user_avatar: c.profiles?.avatar_url ?? null,
  }))
}

export type PostCommentResult =
  | { success: true }
  | { success: false; error: 'login_required' | 'empty' | 'banned' | 'blocked'; violations?: number; justBanned?: boolean }

const MAX_VIOLATIONS_BEFORE_BAN = 4

export async function postComment(productId: string, content: string): Promise<PostCommentResult> {
  const trimmed = content.trim()
  if (!trimmed) return { success: false, error: 'empty' }

  const user = await getSessionUser()
  if (!user) return { success: false, error: 'login_required' }

  const db = adminDb()

  const { data: profile } = await db
    .from('profiles')
    .select('comment_violations, comment_banned')
    .eq('id', user.id)
    .single()

  if (profile?.comment_banned) {
    return { success: false, error: 'banned' }
  }

  const { data: wordsData } = await db.from('banned_words').select('word')
  const bannedWords = (wordsData ?? []).map(w => w.word as string)

  if (containsBannedWord(trimmed, bannedWords)) {
    const nextCount = (profile?.comment_violations ?? 0) + 1
    const justBanned = nextCount >= MAX_VIOLATIONS_BEFORE_BAN
    await db.from('profiles').update({
      comment_violations: nextCount,
      comment_banned: justBanned,
      comment_banned_at: justBanned ? new Date().toISOString() : null,
    }).eq('id', user.id)
    return { success: false, error: 'blocked', violations: nextCount, justBanned }
  }

  const { error } = await db.from('product_comments').insert({
    product_id: productId,
    user_id: user.id,
    content: trimmed,
  })
  if (error) return { success: false, error: 'empty' }

  return { success: true }
}
