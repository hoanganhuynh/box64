'use server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { containsBannedWord } from '@/lib/moderation/profanity'
import { moderateWithAI } from '@/lib/moderation/ai'

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
    .select('id, product_id, user_id, content, created_at, user_name, user_avatar')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  if (error) return []
  return data as CommentRow[]
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

  const { data: moderation } = await db
    .from('user_moderation')
    .select('comment_violations, comment_banned')
    .eq('user_id', user.id)
    .maybeSingle()

  if (moderation?.comment_banned) {
    return { success: false, error: 'banned' }
  }

  const { data: wordsData } = await db.from('banned_words').select('word')
  const bannedWords = (wordsData ?? []).map(w => w.word as string)

  const handleViolation = async () => {
    const nextCount = (moderation?.comment_violations ?? 0) + 1
    const justBanned = nextCount >= MAX_VIOLATIONS_BEFORE_BAN
    await db.from('user_moderation').upsert({
      user_id: user.id,
      comment_violations: nextCount,
      comment_banned: justBanned,
      comment_banned_at: justBanned ? new Date().toISOString() : null,
    })
    return { success: false as const, error: 'blocked' as const, violations: nextCount, justBanned }
  }

  if (containsBannedWord(trimmed, bannedWords)) {
    return await handleViolation()
  }

  const aiResult = await moderateWithAI(trimmed)
  if (aiResult.flagged) {
    return await handleViolation()
  }

  const userName = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? null
  const userAvatar = (user.user_metadata?.avatar_url as string | undefined) ?? null

  const { error } = await db.from('product_comments').insert({
    product_id: productId,
    user_id: user.id,
    content: trimmed,
    user_name: userName,
    user_avatar: userAvatar,
  })
  if (error) {
    console.error('postComment insert error:', error.message)
    return { success: false, error: 'empty' }
  }

  return { success: true }
}
