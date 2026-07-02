'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartPieSlice,
  ShoppingCart,
  UsersThree,
  Package,
  GridFour,
  CreditCard,
  GearSix,
  SignOut,
  X,
  ArrowLineLeft,
  ArrowLineRight,
  MagnifyingGlass,
  Envelope,
  Wallet,
} from '@phosphor-icons/react'
import { cn } from '@/lib/cn'
import { Modal } from './Modal'
import { Button } from './Button'
import { FigBoxLogo } from './FigBoxLogo'
import { useSidebar } from './SidebarContext'
import { createSupabaseClient } from '@/lib/supabase/client'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const mainNav: NavItem[] = [
  { label: 'Tổng quan',   href: '/admin/dashboard',  icon: ChartPieSlice },
  { label: 'Đơn hàng',   href: '/admin/orders',      icon: ShoppingCart },
  { label: 'Khách hàng', href: '/admin/customers',   icon: UsersThree },
  { label: 'Sản phẩm',   href: '/admin/products',    icon: Package },
  { label: 'Danh mục',   href: '/admin/categories',  icon: GridFour },
  { label: 'Yêu cầu mẫu', href: '/admin/requests',   icon: Envelope },
  { label: 'Tài chính',  href: '/admin/finance',     icon: Wallet },
  { label: 'Thanh toán', href: '/admin/payment',     icon: CreditCard },
  { label: 'Cài đặt',   href: '/admin/settings',    icon: GearSix },
]

function NavLink({
  item,
  collapsed = false,
  onClick,
  isActive,
}: {
  item: NavItem
  collapsed?: boolean
  onClick?: () => void
  isActive: boolean
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center text-sm font-medium border',
        'transition-[background-color,color,border-color] duration-200 ease-in-out',
        collapsed ? 'h-11 justify-center px-0' : 'h-11 px-3',
        isActive
          ? 'rounded-lg border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-400'
          : 'rounded-lg border-transparent text-neutral-600 dark:text-neutral-300 hover:bg-surface hover:text-foreground',
      )}
    >
      <Icon size={20} weight={isActive ? 'fill' : 'regular'} className="shrink-0" />
      <span
        className={cn(
          'overflow-hidden whitespace-nowrap transition-all duration-300 ease-out',
          collapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100 ml-3',
        )}
      >
        {item.label}
      </span>
    </Link>
  )
}

function SidebarContent({
  collapsed,
  onCollapse,
  onExpand,
  onNavClick,
  hideLogo = false,
  animated = false,
}: {
  collapsed: boolean
  onCollapse: () => void
  onExpand: () => void
  onNavClick?: () => void
  hideLogo?: boolean
  animated?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { setCommandOpen } = useSidebar()
  const [logoutOpen, setLogoutOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [setCommandOpen])

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') return pathname === '/admin/dashboard' || pathname === '/admin'
    return pathname.startsWith(href)
  }

  async function handleLogout() {
    setLogoutOpen(false)
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <>
      {/* Logo row */}
      {!hideLogo && (
        <div className={cn(
          'flex items-center border-b border-border',
          collapsed ? 'h-20 justify-center px-3' : 'h-20 justify-between px-4',
        )}>
          {collapsed ? (
            <Link href="/admin/dashboard" onClick={onNavClick} title="FigBox">
              <FigBoxLogo />
            </Link>
          ) : (
            <>
              <Link href="/admin/dashboard" onClick={onNavClick} className="flex items-center gap-3">
                <FigBoxLogo />
                <span className="font-heading text-[20px] font-semibold text-foreground">
                  Fig<span className="text-indigo-500">Box</span>
                </span>
              </Link>
              <button
                onClick={onCollapse}
                title="Thu gọn"
                className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface"
              >
                <ArrowLineLeft size={20} weight="regular" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Search bar / expand button */}
      <div className="flex h-[76px] items-center border-b border-border px-3">
        {collapsed ? (
          <button
            onClick={onExpand}
            title="Mở rộng"
            className="flex h-11 w-full items-center justify-center rounded-lg text-foreground transition-colors hover:bg-surface"
          >
            <ArrowLineRight size={20} weight="regular" />
          </button>
        ) : (
          <button
            onClick={() => setCommandOpen(true)}
            className="flex h-11 w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm transition-colors hover:border-indigo-600"
          >
            <MagnifyingGlass size={20} weight="regular" className="shrink-0 text-muted" />
            <span className="flex-1 text-left text-muted">Tìm kiếm</span>
            <kbd className="flex items-center gap-0.5 rounded border border-border bg-surface px-1.5 py-0.5 text-sm font-medium text-muted">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn('flex-1 overflow-y-auto py-4', collapsed ? 'px-2' : 'px-3')}>
        {!collapsed && (
          <p className="mb-2 px-3 text-sm font-medium uppercase tracking-widest text-muted">
            Menu
          </p>
        )}
        <div className="space-y-0.5">
          {mainNav.map((item, i) =>
            animated ? (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.04, duration: 0.22, ease: 'easeOut' }}
              >
                <NavLink item={item} collapsed={collapsed} onClick={onNavClick} isActive={isActive(item.href)} />
              </motion.div>
            ) : (
              <NavLink key={item.href} item={item} collapsed={collapsed} onClick={onNavClick} isActive={isActive(item.href)} />
            )
          )}
        </div>
      </nav>

      {/* Bottom: Log out */}
      <div className={cn('border-t border-border py-3', collapsed ? 'px-2' : 'px-3')}>
        <button
          onClick={() => setLogoutOpen(true)}
          className={cn(
            'flex w-full items-center rounded-lg border border-transparent text-sm font-medium text-neutral-600 dark:text-neutral-300 transition-colors hover:bg-surface hover:text-foreground',
            collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5 gap-3',
          )}
        >
          <SignOut size={20} weight="regular" className="shrink-0" />
          <span className={cn(
            'overflow-hidden whitespace-nowrap transition-all duration-300 ease-out',
            collapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100',
          )}>
            Đăng xuất
          </span>
        </button>
      </div>

      <Modal open={logoutOpen} onClose={() => setLogoutOpen(false)} title="Đăng xuất" size="sm">
        <div className="space-y-4 p-6">
          <p className="text-sm text-muted">
            Bạn có chắc muốn đăng xuất khỏi trang quản trị?
          </p>
        </div>
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => setLogoutOpen(false)}>Huỷ</Button>
          <Button variant="danger" onClick={handleLogout}>Đăng xuất</Button>
        </div>
      </Modal>
    </>
  )
}

export function Sidebar({ className }: { className?: string }) {
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <aside className={cn(
      'hidden lg:flex flex-col border-r border-border bg-background',
      'transition-[width] duration-300 ease-in-out overflow-hidden',
      collapsed ? 'w-[72px]' : 'w-[240px]',
      className,
    )}>
      <SidebarContent
        collapsed={collapsed}
        onCollapse={() => setCollapsed(true)}
        onExpand={() => setCollapsed(false)}
      />
    </aside>
  )
}

export function MobileSidebar() {
  const { mobileOpen, setMobileOpen } = useSidebar()
  const pathname = usePathname()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname, setMobileOpen])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <AnimatePresence>
      {mobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-border bg-background lg:hidden"
          >
            <div className="flex h-20 items-center justify-between border-b border-border px-4">
              <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3">
                <FigBoxLogo />
                <span className="font-heading text-[20px] font-semibold text-foreground">
                  Fig<span className="text-indigo-500">Box</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-foreground"
              >
                <X size={20} weight="regular" />
              </button>
            </div>

            <SidebarContent
              collapsed={false}
              onCollapse={() => setMobileOpen(false)}
              onExpand={() => {}}
              onNavClick={() => setMobileOpen(false)}
              hideLogo
              animated
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
