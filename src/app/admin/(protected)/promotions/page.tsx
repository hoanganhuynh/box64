'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Gift } from 'lucide-react'
import {
  getPromoCodes, upsertPromoCode, deletePromoCode, togglePromoCodeActive,
  getReferralStats,
  type PromoCodeRow, type PromoCodeInput, type ReferralStats,
} from './actions'

const ATTRIBUTE_OPTIONS = [
  { value: 'brand', label: 'Hãng xe (brand)' },
  { value: 'car_make', label: 'Hãng xe (car_make)' },
  { value: 'color', label: 'Màu sắc' },
  { value: 'manufacturer', label: 'Hãng SX diecast' },
  { value: 'type', label: 'Loại sản phẩm' },
]

function vnd(n: number) { return new Intl.NumberFormat('vi-VN').format(n) + ' ₫' }

const BLANK: PromoCodeInput = {
  id: '', code: '', type: 'fixed', value: 20000, scope: 'all',
  attribute_key: null, attribute_value: null, max_uses: null,
  min_order_amount: 0, expires_at: null, active: true,
}

const INPUT = 'w-full bg-[#0D0D14] border border-[#1E1E28] rounded-lg px-3 h-9 text-sm text-[#EEEEF4] placeholder:text-[#383848] focus:outline-none focus:border-[#6366f1] transition-colors'
const SELECT = INPUT + ' appearance-none'

export default function PromotionsPage() {
  const [codes, setCodes] = useState<PromoCodeRow[]>([])
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<PromoCodeRow | 'new' | null>(null)

  function load() {
    Promise.all([getPromoCodes(), getReferralStats()]).then(([c, s]) => {
      setCodes(c); setStats(s); setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Xoá mã này?')) return
    setCodes(prev => prev.filter(c => c.id !== id))
    await deletePromoCode(id)
  }

  async function handleToggle(id: string, active: boolean) {
    setCodes(prev => prev.map(c => c.id === id ? { ...c, active } : c))
    await togglePromoCodeActive(id, active)
  }

  if (loading) {
    return <div className="p-6 lg:p-8 text-sm text-[#484858]">Đang tải...</div>
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <h1 className="font-jakarta font-extrabold text-[#EEEEF4] text-2xl lg:text-3xl">
          Khuyến mãi <span className="text-[#484858] font-normal">({codes.length})</span>
        </h1>
        <button onClick={() => setModal('new')}
          className="h-9 px-4 rounded-xl bg-[#6366f1] text-sm font-semibold text-white hover:bg-[#5558e6] transition-colors flex items-center gap-1.5">
          <Plus size={14} /> Thêm mã
        </button>
      </div>

      {/* Referral stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F0A500]/10 flex items-center justify-center shrink-0">
              <Gift size={16} className="text-[#F0A500]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide">Lượt mời thành công</p>
              <p className="text-lg font-bold text-[#EEEEF4]">{stats.totalReferrals}</p>
            </div>
          </div>
          <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-4">
            <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide mb-1">Voucher đã phát</p>
            <p className="text-lg font-bold text-[#EEEEF4]">{stats.totalVouchers}</p>
          </div>
          <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-4">
            <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide mb-1">Voucher đã dùng</p>
            <p className="text-lg font-bold text-emerald-400">{stats.usedVouchers}</p>
          </div>
        </div>
      )}

      {codes.length === 0 ? (
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl py-16 text-center text-[#484858] text-sm">
          Chưa có mã giảm giá nào.
        </div>
      ) : (
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1A1A22]">
                  <th className="text-left px-6 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide">Mã</th>
                  <th className="text-left px-3 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide">Giảm</th>
                  <th className="text-left px-3 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide hidden md:table-cell">Phạm vi</th>
                  <th className="text-center px-3 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide hidden lg:table-cell">Đã dùng</th>
                  <th className="text-left px-3 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide hidden lg:table-cell">Hết hạn</th>
                  <th className="text-center px-3 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide">Hoạt động</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A22]">
                {codes.map(c => {
                  const expired = c.expires_at && new Date(c.expires_at) < new Date()
                  return (
                    <tr key={c.id} className="hover:bg-[#16161E] transition-colors group">
                      <td className="px-6 py-3.5">
                        <span className="font-mono font-bold text-[#EEEEF4]">{c.code}</span>
                      </td>
                      <td className="px-3 py-3.5 text-[#7A7A90]">
                        {c.type === 'percent' ? `${c.value}%` : vnd(c.value)}
                      </td>
                      <td className="px-3 py-3.5 hidden md:table-cell">
                        {c.scope === 'all' ? (
                          <span className="text-sm text-[#7A7A90]">Toàn bộ</span>
                        ) : (
                          <span className="text-sm font-mono text-[#6366f1] bg-[#6366f1]/10 px-1.5 py-0.5 rounded">
                            {c.attribute_key}={c.attribute_value}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-center text-[#7A7A90] tabular-nums hidden lg:table-cell">
                        {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ''}
                      </td>
                      <td className="px-3 py-3.5 hidden lg:table-cell">
                        <span className={`text-sm ${expired ? 'text-red-400' : 'text-[#7A7A90]'}`}>
                          {c.expires_at ? new Date(c.expires_at).toLocaleDateString('vi-VN') : '—'}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <button onClick={() => handleToggle(c.id, !c.active)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${c.active ? 'bg-emerald-500' : 'bg-[#2A2A38]'}`}>
                          <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${c.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setModal(c)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#484858] hover:text-[#EEEEF4] hover:bg-[#1A1A22] transition-colors">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDelete(c.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#484858] hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <PromoModal
          initial={modal === 'new' ? BLANK : modal}
          isNew={modal === 'new'}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}

function PromoModal({ initial, isNew, onClose, onSaved }: {
  initial: PromoCodeInput
  isNew: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<PromoCodeInput>({
    ...initial,
    id: initial.id || crypto.randomUUID(),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof PromoCodeInput>(field: K, value: PromoCodeInput[K]) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.expires_at) { setError('Vui lòng chọn ngày hết hạn.'); return }
    setSaving(true)
    setError('')
    const result = await upsertPromoCode(form)
    setSaving(false)
    if (result.error) { setError(result.error); return }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111118] border border-[#1E1E28] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1A22] shrink-0">
          <h2 className="font-semibold text-[#EEEEF4] text-base">{isNew ? 'Thêm mã giảm giá' : 'Chỉnh sửa mã'}</h2>
          <button onClick={onClose} className="text-[#484858] hover:text-[#EEEEF4] transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Mã *</span>
            <input required value={form.code} onChange={e => set('code', e.target.value.toUpperCase())}
              placeholder="SUMMER20" className={INPUT + ' font-mono uppercase'} />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Loại giảm</span>
              <select value={form.type} onChange={e => set('type', e.target.value as PromoCodeInput['type'])} className={SELECT}>
                <option value="fixed">Số tiền cố định</option>
                <option value="percent">Phần trăm</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">
                Giá trị {form.type === 'percent' ? '(%)' : '(VND)'} *
              </span>
              <input required type="number" min={0} max={form.type === 'percent' ? 100 : undefined} value={form.value}
                onChange={e => set('value', parseInt(e.target.value) || 0)} className={INPUT} />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Phạm vi áp dụng</span>
            <select value={form.scope} onChange={e => set('scope', e.target.value as PromoCodeInput['scope'])} className={SELECT}>
              <option value="all">Toàn bộ khách hàng</option>
              <option value="attribute">Theo thuộc tính sản phẩm</option>
            </select>
          </label>

          {form.scope === 'attribute' && (
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Thuộc tính *</span>
                <select required value={form.attribute_key ?? ''} onChange={e => set('attribute_key', e.target.value)} className={SELECT}>
                  <option value="">-- Chọn --</option>
                  {ATTRIBUTE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Giá trị *</span>
                <input required value={form.attribute_value ?? ''} onChange={e => set('attribute_value', e.target.value)}
                  placeholder="porsche" className={INPUT} />
              </label>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Đơn tối thiểu</span>
              <input type="number" min={0} value={form.min_order_amount}
                onChange={e => set('min_order_amount', parseInt(e.target.value) || 0)} className={INPUT} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Giới hạn lượt dùng</span>
              <input type="number" min={0} value={form.max_uses ?? ''} placeholder="Không giới hạn"
                onChange={e => set('max_uses', e.target.value ? parseInt(e.target.value) : null)} className={INPUT} />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Ngày hết hạn *</span>
            <input required type="date" value={form.expires_at ? form.expires_at.slice(0, 10) : ''}
              onChange={e => set('expires_at', e.target.value ? new Date(e.target.value + 'T23:59:59').toISOString() : null)}
              className={INPUT} />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1A1A22]">
            <button type="button" onClick={onClose} className="h-9 px-4 rounded-lg text-sm font-medium text-[#7A7A90] hover:text-[#EEEEF4] transition-colors">Huỷ</button>
            <button type="submit" disabled={saving} className="h-9 px-5 rounded-lg text-sm font-semibold bg-[#6366f1] text-white hover:bg-[#5558e6] disabled:opacity-50 transition-colors">
              {saving ? 'Đang lưu…' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
