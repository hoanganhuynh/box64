'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createSupabaseClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Email hoặc mật khẩu không đúng.')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#07070C] flex items-center justify-center px-4 overflow-y-auto">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse 50% 35% at 50% 0%, rgba(240,165,0,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-[360px]">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image src="/logo.svg" alt="FigBox Admin" width={40} height={44} priority />
        </div>

        {/* Card */}
        <div className="bg-[#0D0D17] border border-[#1C1C26] rounded-xl px-8 py-9">
          <div className="mb-7 text-center">
            <p className="text-[10px] font-bold tracking-[0.22em] text-[#F0A500]/60 uppercase mb-2">Admin Portal</p>
            <h1 className="font-jakarta font-extrabold text-white text-xl">
              Fig<span className="text-[#F0A500]">Box</span> Admin
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#444] uppercase tracking-[0.14em]">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@figbox.store"
                className="h-11 px-4 bg-[#07070C] border border-[#1C1C26] rounded-lg text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#F0A500]/40 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#444] uppercase tracking-[0.14em]">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full h-11 px-4 pr-11 bg-[#07070C] border border-[#1C1C26] rounded-lg text-sm text-white placeholder-[#333] focus:outline-none focus:border-[#F0A500]/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors"
                  tabIndex={-1}
                  aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[12px] text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 h-11 rounded-lg bg-[#F0A500] text-[#07070C] font-bold text-sm hover:bg-[#F0A500]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        <p className="text-center mt-5">
          <a href="/" className="text-[#333] hover:text-[#555] text-xs transition-colors">
            ← Về trang chủ
          </a>
        </p>
      </div>
    </div>
  )
}
