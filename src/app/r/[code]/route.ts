import { NextResponse, type NextRequest } from 'next/server'

// Referral short link — /r/<code> — stashes the code in a cookie so it
// survives through to Google OAuth login, then redirects home. The actual
// referral relationship is created in /auth/callback once the person signs in.
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const res = NextResponse.redirect(new URL('/', req.url))
  if (code) {
    res.cookies.set('ref_code', code, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    })
  }
  return res
}
