import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // The login page must stay public.
  if (pathname === '/admin/login') {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  // Guard the Supabase session check: if it throws (Edge runtime quirk,
  // transient network error, missing env), redirect to login rather than
  // crashing the route with a 500.
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return supabaseResponse
}

// Only run on /admin routes. The storefront never needs a middleware
// session check — running Supabase auth on every public page view is both
// slow and a single point of failure that can take the whole site down.
export const config = {
  matcher: ['/admin/:path*'],
}
