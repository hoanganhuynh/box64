'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell } from '@phosphor-icons/react'
import { useClickOutside } from '../hooks/useClickOutside'
import { cn } from '@/lib/cn'

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useClickOutside(ref, () => setOpen(false))

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative flex h-11 w-11 items-center justify-center rounded-full border text-foreground transition-colors hover:bg-surface',
          open ? 'border-indigo-400 bg-surface' : 'border-border',
        )}
      >
        <Bell size={20} weight="regular" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/5"
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
              <h3 className="text-sm font-medium text-foreground">Thông báo</h3>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <Bell size={24} weight="regular" className="text-muted" />
              <p className="text-sm text-muted">Không có thông báo mới</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
