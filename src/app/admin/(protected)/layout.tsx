import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from '@/lib/admin-auth'
import { SidebarProvider } from '../_ui/SidebarContext'
import { Sidebar, MobileSidebar } from '../_ui/Sidebar'
import { Header } from '../_ui/Header'

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value ?? ''
  const email = verifyToken(token)

  if (!email) redirect('/admin/login')

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <MobileSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header adminEmail={email} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-surface">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
