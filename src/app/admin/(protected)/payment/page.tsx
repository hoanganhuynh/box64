'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Upload, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react'
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
    qr_image_url: null,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingQr, setUploadingQr] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

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

  async function handleQrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingQr(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/upload-qr', { method: 'POST', body: form })
    const json = await res.json()
    setUploadingQr(false)
    if (json.url) {
      setSettings(s => ({ ...s, qr_image_url: json.url }))
    } else {
      showToast('error', json.error ?? 'Upload thất bại')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  function removeQr() {
    setSettings(s => ({ ...s, qr_image_url: null }))
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
        <p className="text-sm text-muted mt-1">Thông tin tài khoản nhận tiền và mã QR hiển thị cho khách</p>
      </div>

      <div className="flex flex-col gap-5">

        {/* Bank info card */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5">
          <p className="text-xs font-bold text-muted uppercase tracking-widest">Thông tin ngân hàng</p>

          {/* Bank select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted">Ngân hàng</label>
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
            <label className="text-xs font-semibold text-muted">Số tài khoản</label>
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
            <label className="text-xs font-semibold text-muted">Tên chủ tài khoản</label>
            <input
              type="text"
              value={settings.account_name}
              onChange={e => setSettings(s => ({ ...s, account_name: e.target.value.toUpperCase() }))}
              placeholder="NGUYEN DINH AN"
              className="h-11 px-3 bg-surface border border-border rounded-xl text-sm text-foreground font-mono uppercase placeholder-muted/40 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
            <p className="text-[11px] text-muted">Viết in hoa, không dấu — đúng với tên trên tài khoản ngân hàng</p>
          </div>
        </div>

        {/* QR card */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <p className="text-xs font-bold text-muted uppercase tracking-widest">Hình QR tĩnh</p>
            <p className="text-[11px] text-muted mt-1">Nếu không upload, trang thanh toán sẽ tự tạo QR động từ thông tin bên trên</p>
          </div>

          {settings.qr_image_url ? (
            <div className="flex items-start gap-4">
              <div className="relative w-[110px] h-[110px] rounded-xl overflow-hidden border border-border bg-white shrink-0">
                <Image
                  src={settings.qr_image_url}
                  alt="QR hiện tại"
                  fill
                  className="object-contain p-1.5"
                  unoptimized
                />
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <p className="text-xs font-medium text-foreground">QR đang dùng</p>
                <p className="text-[11px] text-muted leading-relaxed">Ảnh này sẽ hiển thị cho khách trên trang đặt hàng thành công</p>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingQr}
                    className="h-8 px-3 rounded-lg bg-surface border border-border text-xs font-medium text-foreground hover:bg-surface/80 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {uploadingQr ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    Thay QR
                  </button>
                  <button
                    type="button"
                    onClick={removeQr}
                    className="h-8 px-3 rounded-lg bg-surface border border-border text-xs font-medium text-red-400 hover:bg-red-500/5 transition-colors flex items-center gap-1.5"
                  >
                    <X size={12} /> Xoá
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingQr}
              className="flex flex-col items-center justify-center gap-2 h-32 w-full rounded-xl border-2 border-dashed border-border hover:border-indigo-500/40 text-muted hover:text-foreground transition-colors"
            >
              {uploadingQr
                ? <Loader2 size={20} className="animate-spin" />
                : <Upload size={20} />}
              <span className="text-xs font-medium">{uploadingQr ? 'Đang upload…' : 'Upload hình QR'}</span>
              <span className="text-[11px]">PNG, JPG · tối đa 5 MB</span>
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleQrUpload}
          />
        </div>

        {/* VietQR preview */}
        {settings.account_number && !settings.qr_image_url && (
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-3">
            <p className="text-xs font-bold text-muted uppercase tracking-widest">Xem trước QR động</p>
            <p className="text-[11px] text-muted">QR được tạo tự động từ thông tin bên trên (không có sẵn số tiền)</p>
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
