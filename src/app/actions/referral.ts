'use server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

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

function randomCode(len = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export interface MyVoucher {
  id: string
  code: string
  value: number
  used: boolean
}

export interface MyReferral {
  referralCode: string
  referralsCount: number
  vouchers: MyVoucher[]
}

export async function getMyReferral(): Promise<MyReferral | null> {
  const user = await getSessionUser()
  if (!user) return null

  const db = adminDb()
  const { data: profile } = await db.from('profiles').select('referral_code').eq('id', user.id).single()

  let referralCode = profile?.referral_code as string | null | undefined
  if (!referralCode) {
    for (let attempt = 0; attempt < 5 && !referralCode; attempt++) {
      const candidate = randomCode()
      const { error } = await db.from('profiles').update({ referral_code: candidate }).eq('id', user.id)
      if (!error) referralCode = candidate
    }
    if (!referralCode) return null
  }

  const { count } = await db.from('referrals').select('id', { count: 'exact', head: true }).eq('referrer_id', user.id)

  const { data: vouchersData } = await db
    .from('promo_codes')
    .select('id, code, value, promo_code_redemptions(user_id)')
    .eq('owner_id', user.id)
    .eq('is_referral', true)

  const vouchers: MyVoucher[] = (vouchersData ?? []).map((v) => ({
    id: v.id as string,
    code: v.code as string,
    value: v.value as number,
    used: Array.isArray(v.promo_code_redemptions) && v.promo_code_redemptions.length > 0,
  }))

  return { referralCode, referralsCount: count ?? 0, vouchers }
}
