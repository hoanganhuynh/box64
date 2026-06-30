'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlass, ChartPieSlice, ShoppingCart, UsersThree, Package, GridFour, X } from '@phosphor-icons/react'
import { cn } from '@/lib/cn'

interface CommandItem {
  label: string
  href: string
  icon: React.ElementType
  sub?: string
}

const items: CommandItem[] = [
  { label: 'Tổng quan',       href: '/admin/dashboard',              icon: ChartPieSlice, sub: 'Dashboard' },
  { label: 'Tất cả đơn hàng', href: '/admin/orders',                 icon: ShoppingCart,  sub: 'Đơn hàng' },
  { label: 'Chờ xử lý',      href: '/admin/orders?status=pending',  icon: ShoppingCart,  sub: 'Đơn hàng' },
  { label: 'Đang giao',       href: '/admin/orders?status=shipped',  icon: ShoppingCart,  sub: 'Đơn hàng' },
  { label: 'Đã giao',         href: '/admin/orders?status=delivered',icon: ShoppingCart,  sub: 'Đơn hàng' },
  { label: 'Khách hàng',      href: '/admin/customers',              icon: UsersThree,    sub: 'Khách hàng' },
  { label: 'Sản phẩm',        href: '/admin/products',               icon: Package,       sub: 'Sản phẩm' },
  { label: 'Danh mục',        href: '/admin/categories',             icon: GridFour,      sub: 'Danh mục' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const filtered = query
    ? items.filter(i => i.label.toLowerCase().includes(query.toLowerCase()) || (i.sub ?? '').toLowerCase().includes(query.toLowerCase()))
    : items

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  function navigate(href: string) {
    onClose()
    router.push(href)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4 bg-black/40 dark:bg-black/60"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 border-b border-border">
              <MagnifyingGlass size={18} weight="regular" className="shrink-0 text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm..."
                className="flex-1 h-14 bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') onClose()
                  if (e.key === 'Enter' && filtered.length > 0) navigate(filtered[0].href)
                }}
              />
              <button onClick={onClose} className="text-muted hover:text-foreground">
                <X size={18} weight="regular" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-64 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted">Không tìm thấy kết quả</p>
              ) : (
                filtered.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.href}
                      onClick={() => navigate(item.href)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface',
                      )}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-600">
                        <Icon size={16} weight="regular" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        {item.sub && <p className="text-sm text-muted">{item.sub}</p>}
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            <div className="border-t border-border px-4 py-2.5 flex items-center gap-3 text-sm text-muted">
              <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono">↵</kbd>
              <span>Chọn</span>
              <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono">Esc</kbd>
              <span>Đóng</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
