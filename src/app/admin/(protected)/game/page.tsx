'use client'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { SPIN_REWARD_KEYS, type SpinRewardKey } from '@/lib/gamification/spin'
import {
  getGameAdminData, updateGameConfig,
  type GameAdminData, type GameConfigInput,
} from './actions'

const REWARD_LABELS: Record<SpinRewardKey, string> = {
  slow_product: '20% sản phẩm đặc biệt',
  freeship: 'Freeship đơn tiếp theo',
  brand: '10% theo hãng xe',
  color: '10% theo màu',
  nothing: 'May mắn lần sau',
}

const INPUT = 'w-full h-9 px-3 bg-[#0D0D14] border border-[#1E1E28] rounded-lg text-sm text-[#EEEEF4] focus:outline-none focus:border-[#6366f1] transition-colors'

export default function GamePage() {
  const [data, setData] = useState<GameAdminData | null>(null)
  const [form, setForm] = useState<GameConfigInput | null>(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function load() {
    getGameAdminData().then(d => {
      setData(d)
      setForm({
        spin_enabled: d.config.spin_enabled,
        badge_threshold: d.config.badge_threshold,
        badge_window_days: d.config.badge_window_days,
        badge_discount_pct: d.config.badge_discount_pct,
        slow_product_id: d.config.slow_product_id,
        spin_weights: d.config.spin_weights,
      })
    })
  }

  useEffect(() => { load() }, [])

  if (!data || !form) {
    return <div className="p-6 lg:p-8 text-sm text-[#484858]">Đang tải...</div>
  }

  const totalWeight = SPIN_REWARD_KEYS.reduce((s, k) => s + (form.spin_weights[k] || 0), 0)

  function setWeight(key: SpinRewardKey, value: number) {
    setForm(f => f ? { ...f, spin_weights: { ...f.spin_weights, [key]: Math.max(0, value) } } : f)
  }

  async function handleSave() {
    if (!form) return
    setSaving(true)
    setNotice(null)
    const result = await updateGameConfig(form)
    setSaving(false)
    if (result.error) {
      setNotice({ type: 'error', msg: result.error })
      return
    }
    setNotice({ type: 'success', msg: 'Đã lưu cấu hình.' })
    load()
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <h1 className="font-jakarta font-extrabold text-[#EEEEF4] text-2xl lg:text-3xl mb-6">Trò chơi</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-4">
          <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide mb-1.5">Lượt quay chờ</p>
          <p className="text-lg font-bold text-[#F0A500] tabular-nums">{data.stats.pendingSpins}</p>
        </div>
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-4">
          <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide mb-1.5">Đã quay</p>
          <p className="text-lg font-bold text-[#EEEEF4] tabular-nums">{data.stats.spunTotal}</p>
        </div>
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-4">
          <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide mb-1.5">Nhiệm vụ hoàn thành</p>
          <p className="text-lg font-bold text-emerald-400 tabular-nums">{data.stats.questsAchieved}</p>
        </div>
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-4">
          <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide mb-1.5">Trúng thưởng</p>
          <p className="text-lg font-bold text-[#EEEEF4] tabular-nums">
            {Object.entries(data.stats.rewardCounts).filter(([k]) => k !== 'nothing').reduce((s, [, v]) => s + v, 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Spin config */}
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide">Vòng quay may mắn</p>
            <button onClick={() => setForm(f => f ? { ...f, spin_enabled: !f.spin_enabled } : f)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.spin_enabled ? 'bg-emerald-500' : 'bg-[#2A2A38]'}`}>
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${form.spin_enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <p className="text-sm text-[#484858] mb-3">
            Trọng số các ô (tỷ lệ = trọng số / tổng {totalWeight})
          </p>
          <div className="flex flex-col gap-2.5 mb-4">
            {SPIN_REWARD_KEYS.map(key => {
              const w = form.spin_weights[key] || 0
              const pct = totalWeight > 0 ? Math.round((w / totalWeight) * 100) : 0
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-[#7A7A90] flex-1">{REWARD_LABELS[key]}</span>
                  <input type="number" min={0} value={w}
                    onChange={e => setWeight(key, parseInt(e.target.value) || 0)}
                    className="w-20 h-8 px-2 bg-[#0D0D14] border border-[#1E1E28] rounded-lg text-sm text-[#EEEEF4] text-right focus:outline-none focus:border-[#6366f1] transition-colors" />
                  <span className="text-sm text-[#484858] w-10 text-right tabular-nums">{pct}%</span>
                </div>
              )
            })}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Sản phẩm đặc biệt (ô 20%)</span>
            <select value={form.slow_product_id ?? ''}
              onChange={e => setForm(f => f ? { ...f, slow_product_id: e.target.value || null } : f)}
              className={INPUT + ' appearance-none'}>
              <option value="">-- Chưa chọn (ô này sẽ không trúng) --</option>
              {data.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
        </div>

        {/* Badge config */}
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide mb-4">
            Badge {data.config.badge_brand.charAt(0).toUpperCase() + data.config.badge_brand.slice(1)} Lover
          </p>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Số box cần mua</span>
              <input type="number" min={1} value={form.badge_threshold}
                onChange={e => setForm(f => f ? { ...f, badge_threshold: parseInt(e.target.value) || 1 } : f)}
                className={INPUT} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Cửa sổ tính (ngày)</span>
              <input type="number" min={1} value={form.badge_window_days}
                onChange={e => setForm(f => f ? { ...f, badge_window_days: parseInt(e.target.value) || 1 } : f)}
                className={INPUT} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Mức giảm (%)</span>
              <input type="number" min={0} max={100} value={form.badge_discount_pct}
                onChange={e => setForm(f => f ? { ...f, badge_discount_pct: parseInt(e.target.value) || 0 } : f)}
                className={INPUT} />
            </label>
            <p className="text-sm text-[#484858] leading-relaxed">
              Khách mua đủ {form.badge_threshold} box {data.config.badge_brand} trong {form.badge_window_days} ngày
              → tự động giảm {form.badge_discount_pct}% các sản phẩm {data.config.badge_brand} khi thanh toán.
            </p>
          </div>
        </div>
      </div>

      {/* Reward breakdown */}
      {data.stats.spunTotal > 0 && (
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-5 mb-4">
          <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide mb-3">Kết quả đã quay</p>
          <div className="flex flex-wrap gap-2">
            {SPIN_REWARD_KEYS.map(key => (
              <span key={key} className="text-sm text-[#7A7A90] bg-[#1A1A22] px-2.5 py-1 rounded-lg">
                {REWARD_LABELS[key]}: <span className="font-bold text-[#EEEEF4] tabular-nums">{data.stats.rewardCounts[key] ?? 0}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {notice && (
        <p className={`text-sm mb-3 ${notice.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>{notice.msg}</p>
      )}

      <button onClick={handleSave} disabled={saving}
        className="h-10 px-6 rounded-xl bg-[#6366f1] text-sm font-semibold text-white hover:bg-[#5558e6] transition-colors disabled:opacity-50 flex items-center gap-2">
        {saving && <Loader2 size={14} className="animate-spin" />}
        {saving ? 'Đang lưu…' : 'Lưu cấu hình'}
      </button>
    </div>
  )
}
