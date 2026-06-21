'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Users, Package, ExternalLink, Menu, X, LogOut } from 'lucide-react'

const NAV = [
  { href: '/admin/dashboard', label: 'Tổng quan',    icon: LayoutDashboard },
  { href: '/admin/orders',    label: 'Đơn hàng',     icon: ShoppingBag },
  { href: '/admin/customers', label: 'Khách hàng',   icon: Users,    soon: true },
  { href: '/admin/products',  label: 'Sản phẩm',     icon: Package,  soon: true },
]

function NavItem({ href, label, icon: Icon, soon, active, onClick }: {
  href: string; label: string; icon: React.ElementType
  soon?: boolean; active?: boolean; onClick?: () => void
}) {
  const base = 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors'
  if (soon) {
    return (
      <div className={`${base} text-[#333] cursor-not-allowed select-none`}>
        <Icon size={16} />
        <span>{label}</span>
        <span className="ml-auto text-[9px] font-bold text-[#2A2A35] bg-[#111120] px-1.5 py-0.5 rounded uppercase tracking-wide">Soon</span>
      </div>
    )
  }
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${base} ${active
        ? 'bg-[#F0A500]/10 text-[#F0A500]'
        : 'text-[#555] hover:text-white hover:bg-white/[0.04]'
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
      {active && <span className="ml-auto w-1 h-1 rounded-full bg-[#F0A500]" />}
    </Link>
  )
}

function SidebarContent({ pathname, onNav }: { pathname: string; onNav?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#111120]">
        <Link href="/admin/dashboard" onClick={onNav} className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#F0A500]/10 border border-[#F0A500]/20 flex items-center justify-center">
            <span className="text-[10px] font-black text-[#F0A500]">FB</span>
          </div>
          <div>
            <p className="font-jakarta font-extrabold text-white text-sm leading-none">
              Fig<span className="text-[#F0A500]">Box</span>
            </p>
            <p className="text-[9px] font-bold text-[#333] tracking-widest uppercase mt-0.5">Admin</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV.map(item => (
          <NavItem
            key={item.href}
            {...item}
            active={item.soon ? false : pathname.startsWith(item.href)}
            onClick={onNav}
          />
        ))}
      </nav>

      {/* Bottom links */}
      <div className="px-3 py-4 border-t border-[#111120] flex flex-col gap-0.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#333] hover:text-[#555] transition-colors"
          onClick={onNav}
        >
          <ExternalLink size={15} />
          <span>Về trang chủ</span>
        </Link>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#333] hover:text-red-400 transition-colors"
          >
            <LogOut size={15} />
            <span>Đăng xuất</span>
          </button>
        </form>
      </div>
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[220px] shrink-0 bg-[#0A0A12] border-r border-[#111120] min-h-screen fixed left-0 top-0 bottom-0 z-30">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center h-14 px-4 bg-[#07070C] border-b border-[#111120] gap-3">
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-[#555] hover:text-white transition-colors rounded-lg"
          aria-label="Mở menu"
        >
          <Menu size={20} />
        </button>
        <p className="font-jakarta font-extrabold text-sm text-white">
          Fig<span className="text-[#F0A500]">Box</span> <span className="text-[#333] font-medium">Admin</span>
        </p>
      </div>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/70"
            onClick={() => setOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[240px] bg-[#0A0A12] border-r border-[#111120] flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#111120]">
              <p className="font-jakarta font-extrabold text-sm text-white">
                Fig<span className="text-[#F0A500]">Box</span>
              </p>
              <button onClick={() => setOpen(false)} className="p-1.5 text-[#444] hover:text-white transition-colors" aria-label="Đóng">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent pathname={pathname} onNav={() => setOpen(false)} />
            </div>
          </aside>
        </>
      )}
    </>
  )
}
