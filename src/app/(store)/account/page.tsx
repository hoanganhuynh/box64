'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { User as UserIcon, MapPin, Check, AlertTriangle, Package, Trophy, Copy, Sparkles } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { getMyAddresses, type OrderShipping } from '@/app/actions/orders'
import { getMyGameStatus, type MyGameStatus } from '@/app/actions/gamification'
import { formatVND } from '@/lib/utils/format'

export default function AccountPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [addresses, setAddresses] = useState<OrderShipping[] | null>(null)
  const [game, setGame] = useState<MyGameStatus | null>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    setMounted(true)
    const supabase = createSupabaseClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace('/login?next=/account')
        return
      }
      setUser(data.user)
      setName((data.user.user_metadata?.full_name as string | undefined) ?? '')
      const [list, gameStatus] = await Promise.all([getMyAddresses(), getMyGameStatus()])
      setAddresses(list)
      setGame(gameStatus)
    })
  }, [router])

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setNotice(null)
    const supabase = createSupabaseClient()
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } })
    setSaving(false)
    if (error) {
      setNotice({ type: 'error', message: 'Có lỗi xảy ra, vui lòng thử lại.' })
      return
    }
    setNotice({ type: 'success', message: 'Đã lưu tên hiển thị.' })
  }

  if (!mounted || !user || addresses === null) return null

  const avatar = user.user_metadata?.avatar_url as string | undefined
  const initials = (name || user.email || '?').charAt(0).toUpperCase()

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8">
        <p className="text-gold text-[10px] font-bold tracking-[0.2em] uppercase mb-2.5">
          <span className="opacity-40 mr-1.5">//</span>Tài khoản
        </p>
        <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl">
          Hồ sơ của tôi
        </h1>
      </div>

      {/* Profile */}
      <div className="bg-surface border border-border rounded-xl px-5 py-5 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full overflow-hidden ring-1 ring-white/20 shrink-0">
            {avatar ? (
              <Image src={avatar} alt={name || 'Avatar'} width={56} height={56} className="object-cover w-full h-full" />
            ) : (
              <span className="w-full h-full bg-surface-2 flex items-center justify-center text-lg font-bold text-gold">{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold truncate">{name || 'Chưa đặt tên'}</p>
            <p className="text-white/40 text-sm truncate">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSaveName} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white/50 uppercase tracking-widest">
              <UserIcon size={13} className="text-gold/60" /> Tên hiển thị
            </span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nhập tên của bạn"
              className="w-full h-11 bg-bg border border-border rounded-sm px-3.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:border-gold/40 transition-colors"
            />
          </label>

          {notice && (
            <p className={`flex items-center gap-1.5 text-xs ${notice.type === 'error' ? 'text-error' : 'text-success'}`}>
              {notice.type === 'error' ? <AlertTriangle size={12} /> : <Check size={12} />}
              {notice.message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="self-end h-9 px-5 rounded-sm bg-gold text-[#07070C] font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>

      {/* Badge + quests */}
      {game && (
        <div className="mb-6">
          <p className="flex items-center gap-1.5 text-[11px] text-muted uppercase tracking-widest font-bold mb-3">
            <Trophy size={13} className="text-gold" /> Huy hiệu &amp; nhiệm vụ
          </p>

          {/* Porsche Lover badge */}
          <div className={`rounded-xl border px-5 py-4 mb-2.5 ${
            game.badge.active ? 'bg-gold/5 border-gold/30' : 'bg-surface border-border'
          }`}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className={`text-sm font-bold ${game.badge.active ? 'text-gold' : 'text-primary'}`}>
                  🏆 {game.badge.brand.charAt(0).toUpperCase() + game.badge.brand.slice(1)} Lover
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {game.badge.active
                    ? `Đang giảm ${game.badge.discountPct}% mọi sản phẩm ${game.badge.brand} · duy trì bằng cách tiếp tục mua trong ${game.badge.windowDays} ngày`
                    : `Mua ${game.badge.threshold} box ${game.badge.brand} trong ${game.badge.windowDays} ngày để mở khoá giảm ${game.badge.discountPct}%`}
                </p>
              </div>
              <span className={`shrink-0 text-sm font-extrabold tabular-nums ${game.badge.active ? 'text-gold' : 'text-muted'}`}>
                {Math.min(game.badge.count, game.badge.threshold)}/{game.badge.threshold}
              </span>
            </div>
            <div className="mt-2.5 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${game.badge.active ? 'bg-gold' : 'bg-gold/40'}`}
                style={{ width: `${Math.min(100, (game.badge.count / game.badge.threshold) * 100)}%` }}
              />
            </div>
          </div>

          {/* Hidden quests */}
          <div className="flex flex-col gap-2.5 mb-2.5">
            {game.quests.map(q => (
              <div key={q.key} className={`rounded-xl border px-5 py-4 ${
                q.achieved ? 'bg-gold/5 border-gold/30' : 'bg-surface border-border'
              }`}>
                {q.achieved ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gold">✨ {q.title}</p>
                      <p className="text-xs text-muted mt-0.5">{q.description}</p>
                      {q.code && (
                        <p className="flex items-center gap-1.5 text-xs mt-1.5">
                          <span className="font-mono font-bold text-primary">{q.code}</span>
                          <button onClick={() => navigator.clipboard.writeText(q.code!)} aria-label="Copy" className="text-muted hover:text-gold transition-colors">
                            <Copy size={11} />
                          </button>
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-extrabold text-gold">+{formatVND(q.rewardValue)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Sparkles size={16} className="text-white/20 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white/30">Nhiệm vụ ẩn</p>
                      <p className="text-xs text-white/20 mt-0.5 italic">{q.hint}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Spin CTA */}
          {game.pendingSpins > 0 && (
            <Link href="/spin" className="flex items-center justify-between gap-3 rounded-xl border border-gold/30 bg-gold/5 px-5 py-4 hover:bg-gold/10 transition-colors">
              <p className="text-sm font-bold text-gold">🎡 Bạn có {game.pendingSpins} lượt quay may mắn!</p>
              <span className="text-xs font-semibold text-gold shrink-0">Quay ngay →</span>
            </Link>
          )}
        </div>
      )}

      {/* Saved addresses */}
      <div>
        <p className="flex items-center gap-1.5 text-[11px] text-muted uppercase tracking-widest font-bold mb-3">
          <MapPin size={13} className="text-gold" /> Địa chỉ đã dùng
        </p>
        {addresses.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl px-5 py-8 text-center">
            <Package size={24} className="text-white/15 mx-auto mb-2" />
            <p className="text-white/25 text-sm">Chưa có địa chỉ nào — sẽ tự lưu sau đơn hàng đầu tiên</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {addresses.map((addr, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl px-5 py-4">
                <p className="text-sm font-semibold text-primary">{addr.name} · {addr.phone}</p>
                <p className="text-sm text-muted mt-1">
                  {[addr.line1, addr.ward, addr.district, addr.city].filter(Boolean).join(', ')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
