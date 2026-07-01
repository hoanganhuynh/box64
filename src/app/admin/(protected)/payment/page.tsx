'use client'
import { useState, useEffect } from 'react'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { getBankSettings, updateBankSettings, type BankSettings } from './actions'

const VN_BANKS = [
  { id: 'MB',       name: 'MBBank' },
  { id: 'VCB',      name: 'Vietcombank' },
  { id: 'ICB',      name: 'VietinBank' },
  { id: 'BIDV',     name: 'BIDV' },
  { id: 'VPB',      name: 'VPBank' },
  { id: 'TCB',      name: 'Techcombank' },
  { id: 'ACB',      name: 'ACB' },
  { id: 'STB',      name: 'Sacombank' },
  { id: 'TPB',      name: 'TPBank' },
  { id: 'OCB',      name: 'OCB' },
  { id: 'SHB',      name: 'SHB' },
  { id: 'VIB',      name: 'VIB' },
  { id: 'MSB',      name: 'MSB' },
  { id: 'LPB',      name: 'LienVietPostBank' },
  { id: 'HDB',      name: 'HDBank' },
  { id: 'EXB',      name: 'Eximbank' },
  { id: 'NAB',      name: 'Nam A Bank' },
  { id: 'SEAB',     name: 'SeABank' },
]

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<BankSettings>({
    bank_id: 'MB',
    account_number: '',
    account_name: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  useEffect(() => {
    getBankSettings().then(s => {
      setSettings(s)
      setLoading(false)
    })
  }, [])

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  async function handleSave() {
    setSaving(true)
    const { error } = await updateBankSettings(settings)
    setSaving(false)
    if (error) showToast('error', error)
    else showToast('success', 'Đã lưu thành công!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg transition-all
          ${toast.type === 'success'
            ? 'bg-success/10 border-success/30 text-success'
            : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Thanh toán</h1>
        <p className="text-sm text-muted mt-1">Thông tin tài khoản nhận tiền — QR động VietQR tự sinh cho mỗi đơn hàng</p>
      </div>

      <div className="flex flex-col gap-5">

        {/* Bank info card */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5">
          <p className="text-sm font-bold text-muted uppercase tracking-widest">Thông tin ngân hàng</p>

          {/* Bank select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-muted">Ngân hàng</label>
            <select
              value={settings.bank_id}
              onChange={e => setSettings(s => ({ ...s, bank_id: e.target.value }))}
              className="h-11 px-3 bg-surface border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            >
              {VN_BANKS.map(b => (
                <option key={b.id} value={b.id}>{b.id} — {b.name}</option>
              ))}
            </select>
          </div>

          {/* Account number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-muted">Số tài khoản</label>
            <input
              type="text"
              inputMode="numeric"
              value={settings.account_number}
              onChange={e => setSettings(s => ({ ...s, account_number: e.target.value.replace(/\s/g, '') }))}
              placeholder="9519152688"
              className="h-11 px-3 bg-surface border border-border rounded-xl text-sm text-foreground font-mono placeholder-muted/40 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </div>

          {/* Account name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-muted">Tên chủ tài khoản</label>
            <input
              type="text"
              value={settings.account_name}
              onChange={e => setSettings(s => ({ ...s, account_name: e.target.value.toUpperCase() }))}
              placeholder="NGUYEN DINH AN"
              className="h-11 px-3 bg-surface border border-border rounded-xl text-sm text-foreground font-mono uppercase placeholder-muted/40 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
            <p className="text-sm text-muted">Viết in hoa, không dấu — đúng với tên trên tài khoản ngân hàng</p>
          </div>
        </div>

        {/* VietQR preview */}
        {settings.account_number && (
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-3">
            <p className="text-sm font-bold text-muted uppercase tracking-widest">Xem trước QR động</p>
            <p className="text-sm text-muted">Mỗi đơn hàng sẽ tự sinh QR riêng kèm đúng số tiền và nội dung chuyển khoản</p>
            <div className="flex justify-center">
              <div className="rounded-xl overflow-hidden border border-border bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.vietqr.io/image/${settings.bank_id}-${settings.account_number}-compact2.jpg?accountName=${encodeURIComponent(settings.account_name)}`}
                  alt="VietQR preview"
                  width={160}
                  height={160}
                  className="block"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full h-11 rounded-xl bg-indigo-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving
            ? <><Loader2 size={15} className="animate-spin" /> Đang lưu…</>
            : 'Lưu thay đổi'}
        </button>

      </div>
    </div>
  )
}
