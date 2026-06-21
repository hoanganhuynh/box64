import { Sidebar } from './_components/Sidebar'

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07070C]">
      <Sidebar />
      <div className="lg:pl-[220px]">
        <div className="lg:hidden h-14" />
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
