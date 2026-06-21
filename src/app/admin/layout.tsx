import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Sidebar } from './_components/Sidebar'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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

  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[#07070C]">
      <Sidebar />
      {/* Desktop offset */}
      <div className="lg:pl-[220px]">
        {/* Mobile top bar offset */}
        <div className="lg:hidden h-14" />
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
