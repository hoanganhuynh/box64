import { NextRequest, NextResponse } from 'next/server'
import { createToken, COOKIE_NAME, MAX_AGE } from '@/lib/admin-auth'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',').map(e => e.trim()).filter(Boolean)

export async function POST(req: NextRequest) {
  const { email, password } = await req.json() as { email: string; password: string }

  const adminPassword = process.env.ADMIN_PASSWORD
  const invalid = !ADMIN_EMAILS.includes(email) || !adminPassword || password !== adminPassword

  if (invalid) {
    // Constant-time-ish response to avoid timing attacks
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
