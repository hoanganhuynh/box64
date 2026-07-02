import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

const REFERRAL_VOUCHER_VALUE = 20000
const FRESH_SIGNUP_WINDOW_MS = 5 * 60 * 1000

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

function randomCode(len = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no O/0/I/1 — avoids look-alike mixups
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// Rewards both sides of a referral once, only for a genuinely fresh signup —
// re-visiting a referral link after that has no effect.
async function processReferral(refereeId: string, refereeCreatedAt: string, refCode: string) {
  const isFresh = Date.now() - new Date(refereeCreatedAt).getTime() < FRESH_SIGNUP_WINDOW_MS
  if (!isFresh) return

  const db = adminDb()

  const { data: referee } = await db.from('user_referral').select('referred_by').eq('user_id', refereeId).maybeSingle()
  if (referee?.referred_by) return // already credited

  const { data: referrer } = await db.from('user_referral').select('user_id').eq('referral_code', refCode).maybeSingle()
  if (!referrer || referrer.user_id === refereeId) return // invalid or self-referral

  await db.from('user_referral').upsert({ user_id: refereeId, referred_by: referrer.user_id })
  const { error: refError } = await db.from('referrals').insert({ referrer_id: referrer.user_id, referee_id: refereeId })
  if (refError) return // already has a referral row — don't double-issue vouchers

  await db.from('promo_codes').insert([
    {
      code: `REF-${randomCode()}`,
      type: 'fixed',
      value: REFERRAL_VOUCHER_VALUE,
      scope: 'all',
      is_referral: true,
      owner_id: referrer.user_id,
      active: true,
    },
    {
      code: `REF-${randomCode()}`,
      type: 'fixed',
      value: REFERRAL_VOUCHER_VALUE,
      scope: 'all',
      is_referral: true,
      owner_id: refereeId,
      active: true,
    },
  ])
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      const refCode = cookieStore.get('ref_code')?.value
      if (refCode) {
        try {
          await processReferral(data.user.id, data.user.created_at, refCode)
        } catch {
          // Referral crediting is best-effort — never block sign-in over it
        }
      }
      const res = NextResponse.redirect(`${origin}${next}`)
      res.cookies.delete('ref_code')
      return res
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
