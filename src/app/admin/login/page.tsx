'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { FigBoxLogo } from '../_ui/FigBoxLogo'

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
    <div className="fixed inset-0 z-50 bg-[#0A0A0F] flex items-center justify-center px-4 overflow-y-auto">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(240,165,0,0.05) 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-[400px] py-12">
        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <FigBoxLogo className="w-14 h-14 rounded-2xl" />
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="font-jakarta font-extrabold text-[#EEEEF4] text-2xl">
            Fig<span className="text-[#F0A500]">Box</span> Admin
          </h1>
          <p className="text-sm text-[#484858] mt-1.5">Đăng nhập vào trang quản trị</p>
        </div>

        {/* Card */}
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl px-8 py-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-[#7A7A90]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@figbox.store"
                className="h-11 px-4 bg-[#0F0F15] border border-[#1E1E28] rounded-xl text-sm text-[#EEEEF4] placeholder-[#2A2A38] focus:outline-none focus:border-[#F0A500]/40 focus:ring-2 focus:ring-[#F0A500]/8 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-[#7A7A90]">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full h-11 px-4 pr-11 bg-[#0F0F15] border border-[#1E1E28] rounded-xl text-sm text-[#EEEEF4] placeholder-[#2A2A38] focus:outline-none focus:border-[#F0A500]/40 focus:ring-2 focus:ring-[#F0A500]/8 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484858] hover:text-[#7A7A90] transition-colors p-0.5"
                  tabIndex={-1}
                  aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-[12px] font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-xl bg-[#F0A500] text-[#0A0A0F] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#F0A500]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0A0A0F]/30 border-t-[#0A0A0F] rounded-full animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <LogIn size={15} />
                  Đăng nhập
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6">
          <a href="/" className="text-xs text-[#383848] hover:text-[#484858] transition-colors">
            ← Về trang chủ
          </a>
        </p>
      </div>
    </div>
  )
}
