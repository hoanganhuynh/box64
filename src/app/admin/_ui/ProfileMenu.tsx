'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SignOut, User } from '@phosphor-icons/react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useClickOutside } from '../hooks/useClickOutside'

export function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useClickOutside(ref, () => setOpen(false))

  useEffect(() => {
    const supabase = createSupabaseClient()
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })
  }, [])

  async function handleSignOut() {
    setOpen(false)
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const initials = email ? email.slice(0, 2).toUpperCase() : 'AD'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border bg-indigo-600/10 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-600/20 ${open ? 'border-indigo-400 ring-2 ring-indigo-600/20' : 'border-border'}`}
      >
        {initials}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/5"
          >
            <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600/10 text-xs font-semibold text-indigo-600">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Admin</p>
                <p className="truncate text-xs text-muted">{email ?? '...'}</p>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-surface"
              >
                <User size={16} weight="regular" className="text-muted" />
                Tài khoản
              </button>
            </div>

            <div className="h-px bg-border" />

            <div className="p-2">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-500/5"
              >
                <SignOut size={16} weight="regular" />
                Đăng xuất
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
