import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createToken, hashPassword, COOKIE_NAME, MAX_AGE } from '@/lib/admin-auth'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',').map(e => e.trim()).filter(Boolean)

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json() as { email: string; password: string }

  if (!ADMIN_EMAILS.includes(email)) {
    await new Promise(r => setTimeout(r, 300))
    return NextResponse.json({ error: 'Email hoặc mật khẩu không đúng.' }, { status: 401 })
  }

  // Check DB password first, fall back to env var
  let passwordOk = false
  const { data } = await db().from('admin_settings').select('password_hash').eq('id', 1).single()
  if (data?.password_hash) {
    passwordOk = hashPassword(password) === data.password_hash
  } else {
    // Fallback: plain-text env var (initial setup before password is ever changed)
    passwordOk = !!process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD
  }

  if (!passwordOk) {
    await new Promise(r => setTimeout(r, 300))
    return NextResponse.json({ error: 'Email hoặc mật khẩu không đúng.' }, { status: 401 })
  }

  const token = createToken(email)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/admin',
  })
  return res
}
