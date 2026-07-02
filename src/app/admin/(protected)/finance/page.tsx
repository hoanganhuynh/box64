'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, RefreshCw, Download, Settings, Loader2 } from 'lucide-react'
import {
  getFinanceSettings, updateFinanceSettings,
  getFinanceEntries, addFinanceEntry, updateFinanceEntry, deleteFinanceEntry,
  syncOnlineOrders, getAvailableMonths,
  type FinanceSettings, type FinanceEntry, type PartnerSplit,
} from './actions'

function vnd(n: number) { return new Intl.NumberFormat('vi-VN').format(n) + ' ₫' }

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(m: string) {
  const [y, mo] = m.split('-')
  return `Tháng ${parseInt(mo)}.${y}`
}

interface Computed {
  entry: FinanceEntry
  printCost: number
  protectCost: number
  cost: number
  profit: number
  perPartner: { name: string; amount: number }[]
}

function computeRow(entry: FinanceEntry, settings: FinanceSettings): Computed {
  const printCost = entry.quantity * settings.print_cost_per_unit
  const protectCost = entry.quantity * settings.protect_box_cost_per_unit
  const cost = printCost + protectCost
  const profit = entry.revenue - cost
  const perPartner = settings.partner_splits.map(s => ({ name: s.name, amount: Math.round(profit * s.pct / 100) }))
  return { entry, printCost, protectCost, cost, profit, perPartner }
}

const INPUT = 'w-full h-9 px-3 bg-[#0D0D14] border border-[#1E1E28] rounded-lg text-sm text-[#EEEEF4] focus:outline-none focus:border-[#6366f1] transition-colors'

export default function FinancePage() {
  const [month, setMonth] = useState(currentMonth())
  const [months, setMonths] = useState<string[]>([])
  const [settings, setSettings] = useState<FinanceSettings | null>(null)
  const [entries, setEntries] = useState<FinanceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [editModal, setEditModal] = useState<'new' | FinanceEntry | null>(null)
  const [settingsModal, setSettingsModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [s, e, m] = await Promise.all([getFinanceSettings(), getFinanceEntries(month), getAvailableMonths()])
    setSettings(s)
    setEntries(e)
    setMonths(m)
    setLoading(false)
  }, [month])

  useEffect(() => { load() }, [load])

  async function handleSync() {
    setSyncing(true)
    try {
      const { added } = await syncOnlineOrders(month)
      await load()
      if (added === 0) alert('Không có đơn hàng mới để đồng bộ.')
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Đồng bộ thất bại, vui lòng thử lại.')
    } finally {
      setSyncing(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Xoá dòng này?')) return
    try {
      await deleteFinanceEntry(id)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Xoá thất bại, vui lòng thử lại.')
      return
    }
    load()
  }

  function handleExport() {
    if (!settings) return
    const rows = entries.map(e => computeRow(e, settings))
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const header = ['Tên khách hàng', 'Số lượng', 'In ấn', 'Protect box', 'Thu', ...settings.partner_splits.map(s => s.name), 'Nguồn']
    const csvRows = rows.map(r => [
      r.entry.customer_name, r.entry.quantity, r.printCost, r.protectCost, r.entry.revenue,
      ...r.perPartner.map(p => p.amount),
      r.entry.source === 'online' ? 'Web' : 'Ngoài',
    ].map(escape).join(','))
    const totals = ['Tổng', rows.reduce((s, r) => s + r.entry.quantity, 0), '', '', rows.reduce((s, r) => s + r.entry.revenue, 0),
      ...settings.partner_splits.map((_, i) => rows.reduce((s, r) => s + r.perPartner[i].amount, 0)), ''
    ].map(escape).join(',')
    const csv = '﻿' + [header.map(escape).join(','), ...csvRows, totals].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `figbox-loi-nhuan-${month}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading || !settings) {
    return <div className="p-6 lg:p-8 text-sm text-[#484858]">Đang tải...</div>
  }

  const computed = entries.map(e => computeRow(e, settings))
  const totalQty = computed.reduce((s, r) => s + r.entry.quantity, 0)
  const totalRevenue = computed.reduce((s, r) => s + r.entry.revenue, 0)
  const totalCost = computed.reduce((s, r) => s + r.cost, 0)
  const totalProfit = computed.reduce((s, r) => s + r.profit, 0)
  const partnerTotals = settings.partner_splits.map((s, i) => ({
    name: s.name,
    amount: computed.reduce((sum, r) => sum + r.perPartner[i].amount, 0),
  }))

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <h1 className="font-jakarta font-extrabold text-[#EEEEF4] text-2xl lg:text-3xl">
          Tài chính <span className="text-[#484858] font-normal">({entries.length})</span>
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={month} onChange={e => setMonth(e.target.value)}
            className="h-9 px-3 bg-[#111118] border border-[#1E1E28] rounded-xl text-sm text-[#EEEEF4] focus:outline-none focus:border-[#6366f1] transition-colors shrink-0">
            {months.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
          <button onClick={() => setSettingsModal(true)}
            className="h-9 px-3 rounded-xl bg-[#111118] border border-[#1E1E28] text-sm font-medium text-[#7A7A90] hover:text-[#EEEEF4] transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <Settings size={14} /> Cài đặt
          </button>
          <button onClick={handleExport}
            className="h-9 px-3 rounded-xl bg-[#111118] border border-[#1E1E28] text-sm font-medium text-[#7A7A90] hover:text-[#EEEEF4] transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <Download size={14} /> Xuất CSV
          </button>
          <button onClick={handleSync} disabled={syncing}
            className="h-9 px-3 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/25 text-sm font-semibold text-[#6366f1] hover:bg-[#6366f1]/15 transition-colors flex items-center gap-1.5 disabled:opacity-50 shrink-0 whitespace-nowrap">
            {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Đồng bộ đơn web
          </button>
          <button onClick={() => setEditModal('new')}
            className="h-9 px-3 rounded-xl bg-[#6366f1] text-sm font-semibold text-white hover:bg-[#5558e6] transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <Plus size={14} /> Thêm dòng
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-4">
          <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide mb-1.5">Doanh thu</p>
          <p className="text-lg font-bold text-[#EEEEF4] tabular-nums">{vnd(totalRevenue)}</p>
        </div>
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-4">
          <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide mb-1.5">Chi phí</p>
          <p className="text-lg font-bold text-[#EEEEF4] tabular-nums">{vnd(totalCost)}</p>
        </div>
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-4">
          <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide mb-1.5">Lợi nhuận</p>
          <p className="text-lg font-bold text-[#F0A500] tabular-nums">{vnd(totalProfit)}</p>
        </div>
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-4">
          <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide mb-1.5">Số lượng</p>
          <p className="text-lg font-bold text-[#EEEEF4] tabular-nums">{totalQty}</p>
        </div>
      </div>

      {/* Partner totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {partnerTotals.map(p => (
          <div key={p.name} className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#7A7A90]">{p.name}</p>
            <p className="text-base font-bold text-emerald-400 tabular-nums">{vnd(p.amount)}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {entries.length === 0 ? (
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl py-16 text-center text-[#484858] text-sm">
          Chưa có dữ liệu tháng này. Bấm &quot;Đồng bộ đơn web&quot; hoặc &quot;Thêm dòng&quot;.
        </div>
      ) : (
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1A1A22]">
                  <th className="text-left px-6 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide">Khách hàng</th>
                  <th className="text-center px-3 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide">SL</th>
                  <th className="text-right px-3 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide">Chi phí</th>
                  <th className="text-right px-3 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide">Thu</th>
                  <th className="text-right px-3 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide">Lợi nhuận</th>
                  {settings.partner_splits.map(s => (
                    <th key={s.name} className="text-right px-3 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide hidden lg:table-cell">{s.name}</th>
                  ))}
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A22]">
                {computed.map(r => (
                  <tr key={r.entry.id} className="hover:bg-[#16161E] transition-colors group">
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-[#EEEEF4]">{r.entry.customer_name}</p>
                      {r.entry.source === 'online' && (
                        <span className="text-sm text-[#6366f1] bg-[#6366f1]/10 px-1.5 py-0.5 rounded mt-0.5 inline-block">Web</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-center text-[#7A7A90] tabular-nums">{r.entry.quantity}</td>
                    <td className="px-3 py-3.5 text-right text-[#7A7A90] tabular-nums">{vnd(r.cost)}</td>
                    <td className="px-3 py-3.5 text-right text-[#EEEEF4] font-medium tabular-nums">{vnd(r.entry.revenue)}</td>
                    <td className="px-3 py-3.5 text-right text-[#F0A500] font-semibold tabular-nums">{vnd(r.profit)}</td>
                    {r.perPartner.map(p => (
                      <td key={p.name} className="px-3 py-3.5 text-right text-emerald-400 tabular-nums hidden lg:table-cell">{vnd(p.amount)}</td>
                    ))}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {r.entry.source === 'external' && (
                          <button onClick={() => setEditModal(r.entry)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#484858] hover:text-[#EEEEF4] hover:bg-[#1A1A22] transition-colors">
                            <Pencil size={13} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(r.entry.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#484858] hover:text-red-400 hover:bg-red-500/10 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editModal && (
        <EntryModal
          month={month}
          initial={editModal === 'new' ? null : editModal}
          onClose={() => setEditModal(null)}
          onSaved={() => { setEditModal(null); load() }}
        />
      )}

      {settingsModal && (
        <SettingsModal
          initial={settings}
          onClose={() => setSettingsModal(false)}
          onSaved={() => { setSettingsModal(false); load() }}
        />
      )}
    </div>
  )
}

function EntryModal({ month, initial, onClose, onSaved }: {
  month: string
  initial: FinanceEntry | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(initial?.customer_name ?? '')
  const [qty, setQty] = useState(initial?.quantity ?? 1)
  const [revenue, setRevenue] = useState(initial?.revenue ?? 0)
  const [note, setNote] = useState(initial?.note ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (initial) {
        await updateFinanceEntry(initial.id, { customer_name: name, quantity: qty, revenue, note })
      } else {
        await addFinanceEntry({ month, customer_name: name, quantity: qty, revenue, note })
      }
      onSaved()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111118] border border-[#1E1E28] rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1A22]">
          <h2 className="font-semibold text-[#EEEEF4] text-base">{initial ? 'Chỉnh sửa dòng' : 'Thêm đơn ngoài'}</h2>
          <button onClick={onClose} className="text-[#484858] hover:text-[#EEEEF4] transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Tên khách hàng *</span>
            <input required value={name} onChange={e => setName(e.target.value)} className={INPUT} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Số lượng *</span>
              <input required type="number" min={0} value={qty} onChange={e => setQty(parseInt(e.target.value) || 0)} className={INPUT} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Doanh thu (VND) *</span>
              <input required type="number" min={0} value={revenue} onChange={e => setRevenue(parseInt(e.target.value) || 0)} className={INPUT} />
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Ghi chú</span>
            <input value={note} onChange={e => setNote(e.target.value)} className={INPUT} />
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

function SettingsModal({ initial, onClose, onSaved }: {
  initial: FinanceSettings
  onClose: () => void
  onSaved: () => void
}) {
  const [printCost, setPrintCost] = useState(initial.print_cost_per_unit)
  const [protectCost, setProtectCost] = useState(initial.protect_box_cost_per_unit)
  const [splits, setSplits] = useState<PartnerSplit[]>(initial.partner_splits)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const totalPct = splits.reduce((s, p) => s + p.pct, 0)

  function updateSplit(i: number, field: keyof PartnerSplit, value: string | number) {
    setSplits(s => s.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await updateFinanceSettings({ print_cost_per_unit: printCost, protect_box_cost_per_unit: protectCost, partner_splits: splits })
      onSaved()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111118] border border-[#1E1E28] rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1A22]">
          <h2 className="font-semibold text-[#EEEEF4] text-base">Cài đặt tính lợi nhuận</h2>
          <button onClick={onClose} className="text-[#484858] hover:text-[#EEEEF4] transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Chi phí in / hộp</span>
              <input type="number" min={0} value={printCost} onChange={e => setPrintCost(parseInt(e.target.value) || 0)} className={INPUT} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Chi phí protect / hộp</span>
              <input type="number" min={0} value={protectCost} onChange={e => setProtectCost(parseInt(e.target.value) || 0)} className={INPUT} />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">
              Tỷ lệ chia lợi nhuận {totalPct !== 100 && <span className="text-red-400 normal-case">(tổng phải = 100%, hiện {totalPct}%)</span>}
            </span>
            {splits.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={s.name} onChange={e => updateSplit(i, 'name', e.target.value)}
                  placeholder="Tên đối tác" className={INPUT + ' flex-1'} />
                <div className="relative w-24 shrink-0">
                  <input type="number" min={0} max={100} value={s.pct}
                    onChange={e => updateSplit(i, 'pct', parseInt(e.target.value) || 0)}
                    className={INPUT + ' pr-6'} />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-[#484858]">%</span>
                </div>
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1A1A22]">
            <button type="button" onClick={onClose} className="h-9 px-4 rounded-lg text-sm font-medium text-[#7A7A90] hover:text-[#EEEEF4] transition-colors">Huỷ</button>
            <button type="submit" disabled={saving || totalPct !== 100}
              className="h-9 px-5 rounded-lg text-sm font-semibold bg-[#6366f1] text-white hover:bg-[#5558e6] disabled:opacity-50 transition-colors">
              {saving ? 'Đang lưu…' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
