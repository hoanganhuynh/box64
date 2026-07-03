'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ShoppingCart, ChatCircle, UserPlus } from '@phosphor-icons/react'
import { useClickOutside } from '../hooks/useClickOutside'
import { createSupabaseClient } from '@/lib/supabase/client'
import { cn } from '@/lib/cn'
import {
  getNotifications, markNotificationRead, markAllNotificationsRead,
  type AdminNotification,
} from '../(protected)/notifications/actions'

const TYPE_ICON = { order: ShoppingCart, comment: ChatCircle, user: UserPlus } as const

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'vừa xong'
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`
  return `${Math.floor(s / 86400)} ngày trước`
}

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<AdminNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useClickOutside(ref, () => setOpen(false))

  const refetch = useCallback(() => {
    getNotifications()
      .then(r => { setItems(r.items); setUnread(r.unread); setLoaded(true) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    refetch()
    const onFocus = () => refetch()
    window.addEventListener('focus', onFocus)

    // Empty realtime signal on the public 'admin-notif' channel — the payload
    // has no content; the actual rows come from the gated server action.
    const supabase = createSupabaseClient()
    const channel = supabase
      .channel('admin-notif')
      .on('broadcast', { event: 'new' }, () => refetch())
      .subscribe()

    return () => {
      window.removeEventListener('focus', onFocus)
      supabase.removeChannel(channel)
    }
  }, [refetch])

  async function onItemClick(n: AdminNotification) {
    setOpen(false)
    if (!n.read) {
      setItems(prev => prev.map(i => (i.id === n.id ? { ...i, read: true } : i)))
      setUnread(u => Math.max(0, u - 1))
      markNotificationRead(n.id).catch(() => {})
    }
    if (n.href) router.push(n.href)
  }

  async function onMarkAll() {
    setItems(prev => prev.map(i => ({ ...i, read: true })))
    setUnread(0)
    markAllNotificationsRead().catch(() => {})
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Thông báo"
        className={cn(
          'relative flex h-11 w-11 items-center justify-center rounded-full border text-foreground transition-colors hover:bg-surface',
          open ? 'border-indigo-400 bg-surface' : 'border-border',
        )}
      >
        <Bell size={20} weight="regular" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/5"
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">Thông báo</h3>
              {unread > 0 && (
                <button onClick={onMarkAll} className="text-xs text-indigo-400 hover:underline">
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>

            {!loaded ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10">
                <Bell size={24} weight="regular" className="text-muted animate-pulse" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10">
                <Bell size={24} weight="regular" className="text-muted" />
                <p className="text-sm text-muted">Không có thông báo mới</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {items.map(n => {
                  const Icon = TYPE_ICON[n.type] ?? Bell
                  return (
                    <button
                      key={n.id}
                      onClick={() => onItemClick(n)}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface transition-colors border-b border-border last:border-b-0"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-foreground">
                        <Icon size={16} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className={cn('block text-sm truncate', n.read ? 'text-muted' : 'text-foreground font-medium')}>
                          {n.title}
                        </span>
                        {n.body && <span className="block text-xs text-muted truncate">{n.body}</span>}
                        <span className="block text-[11px] text-muted mt-0.5">{timeAgo(n.created_at)}</span>
                      </span>
                      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />}
                    </button>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
