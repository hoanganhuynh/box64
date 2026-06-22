'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Users, Package, ExternalLink, Menu, X, LogOut } from 'lucide-react'

const NAV = [
  { href: '/admin/dashboard', label: 'Tổng quan',  icon: LayoutDashboard },
  { href: '/admin/orders',    label: 'Đơn hàng',   icon: ShoppingBag },
  { href: '/admin/customers', label: 'Khách hàng', icon: Users,   soon: true },
  { href: '/admin/products',  label: 'Sản phẩm',   icon: Package, soon: true },
]

function NavItem({ href, label, icon: Icon, soon, active, onClick }: {
  href: string; label: string; icon: React.ElementType
  soon?: boolean; active?: boolean; onClick?: () => void
}) {
  if (soon) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#2A2A38] cursor-not-allowed select-none">
        <Icon size={17} className="shrink-0" />
        <span className="font-medium">{label}</span>
        <span className="ml-auto text-[9px] font-bold text-[#2A2A38] bg-[#16161E] px-1.5 py-0.5 rounded uppercase tracking-wide">
          Soon
        </span>
      </div>
    )
  }
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        active
          ? 'bg-[#F0A500]/10 text-[#F0A500]'
          : 'text-[#7A7A90] hover:text-[#EEEEF4] hover:bg-white/[0.04]'
      }`}
    >
      <Icon size={17} className="shrink-0" />
      <span>{label}</span>
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F0A500] shrink-0" />}
    </Link>
  )
}

function SidebarContent({ pathname, onNav }: { pathname: string; onNav?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-dashed border-[#1E1E28]">
        <Link href="/admin/dashboard" onClick={onNav} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#F0A500] flex items-center justify-center shrink-0">
            <span className="text-[11px] font-black text-[#0A0A0F] tracking-tight">FB</span>
          </div>
          <div>
            <p className="font-jakarta font-extrabold text-[#EEEEF4] text-sm leading-none">
              Fig<span className="text-[#F0A500]">Box</span>
            </p>
            <p className="text-[9px] font-bold text-[#383848] tracking-widest uppercase mt-0.5">Admin</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold text-[#2A2A38] uppercase tracking-widest mb-2">Menu</p>
        {NAV.map(item => (
          <NavItem
            key={item.href}
            {...item}
            active={item.soon ? false : pathname.startsWith(item.href)}
            onClick={onNav}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-dashed border-[#1E1E28] flex flex-col gap-0.5">
        <Link
          href="/"
          target="_blank"
          onClick={onNav}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#484858] hover:text-[#7A7A90] hover:bg-white/[0.04] transition-colors"
        >
          <ExternalLink size={15} className="shrink-0" />
          <span>Trang chủ</span>
        </Link>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#484858] hover:text-red-400 transition-colors"
          >
            <LogOut size={15} className="shrink-0" />
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
      <aside className="hidden lg:flex flex-col w-[260px] shrink-0 bg-[#0D0D13] border-r border-dashed border-[#1E1E28] min-h-screen fixed left-0 top-0 bottom-0 z-30">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center h-14 px-4 bg-[#0D0D13] border-b border-[#1E1E28] gap-3">
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-[#484858] hover:text-[#EEEEF4] hover:bg-white/[0.04] transition-colors rounded-lg"
          aria-label="Mở menu"
        >
          <Menu size={20} />
        </button>
        <p className="font-jakarta font-extrabold text-sm text-[#EEEEF4]">
          Fig<span className="text-[#F0A500]">Box</span>
          <span className="text-[#383848] font-normal ml-1">Admin</span>
        </p>
      </div>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[260px] bg-[#0D0D13] flex flex-col border-r border-[#1E1E28]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-dashed border-[#1E1E28]">
              <p className="font-jakarta font-extrabold text-sm text-[#EEEEF4]">
                Fig<span className="text-[#F0A500]">Box</span>
              </p>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-[#484858] hover:text-[#EEEEF4] hover:bg-white/[0.04] rounded-lg transition-colors"
                aria-label="Đóng"
              >
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
