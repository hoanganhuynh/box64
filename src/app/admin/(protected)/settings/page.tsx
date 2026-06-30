'use client'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { changePassword } from './actions'

const INPUT = 'w-full h-10 px-3 pr-10 rounded-lg bg-[#0F0F18] border border-[#1E1E2E] text-sm text-[#EEEEF4] placeholder-[#2A2A3A] focus:outline-none focus:border-[#6366f1]/60 focus:ring-1 focus:ring-[#6366f1]/20 transition-all'

function PasswordInput({
  id, value, onChange, placeholder, autoComplete,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={INPUT}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484858] hover:text-[#7A7A90] transition-colors"
        aria-label={show ? 'Ẩn' : 'Hiện'}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (next !== confirm) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    setLoading(true)
    const result = await changePassword(current, next)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setCurrent('')
      setNext('')
      setConfirm('')
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-xl font-bold text-[#EEEEF4]">Cài đặt</h1>
        <p className="text-sm text-[#484858] mt-1">Quản lý tài khoản quản trị</p>
      </div>

      <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-[#EEEEF4]">Đổi mật khẩu</h2>
          <p className="text-sm text-[#484858] mt-0.5">Mật khẩu mới phải có ít nhất 8 ký tự.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="current" className="text-sm font-medium text-[#7A7A90]">
              Mật khẩu hiện tại
            </label>
            <PasswordInput
              id="current"
              value={current}
              onChange={setCurrent}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="next" className="text-sm font-medium text-[#7A7A90]">
              Mật khẩu mới
            </label>
            <PasswordInput
              id="next"
              value={next}
              onChange={setNext}
              placeholder="Tối thiểu 8 ký tự"
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm" className="text-sm font-medium text-[#7A7A90]">
              Xác nhận mật khẩu mới
            </label>
            <PasswordInput
              id="confirm"
              value={confirm}
              onChange={setConfirm}
              placeholder="Nhập lại mật khẩu mới"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
              Đổi mật khẩu thành công!
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !current || !next || !confirm}
            className="h-9 px-5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </div>
  )
}
