'use client'
import { useEffect, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, X, ChevronDown, AlertTriangle, Upload, Loader2, FileDown, FileUp, CheckCircle2, Copy, Search } from 'lucide-react'
import BrandLogo from '@/components/ui/BrandLogo'
import {
  getProducts, upsertProduct, deleteProduct, setPublished,
  type ProductRow,
} from './actions'

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-10">
        <span className="block opacity-0 group-hover/tip:opacity-100 transition-opacity delay-150 bg-[#1A1A22] border border-[#2A2A38] text-[#EEEEF4] text-sm font-medium whitespace-nowrap px-2 py-1 rounded-lg shadow-lg">
          {label}
        </span>
      </div>
    </div>
  )
}

// ─── constants ───────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { value: 'box_custom',   label: 'Box Custom' },
  { value: 'box_catalog',  label: 'Box Catalog' },
  { value: 'water_decal',  label: 'Water Decal' },
  { value: 'accessory_3d', label: 'Phụ kiện 3D' },
]
const STATUS_OPTIONS = [
  { value: 'active',       label: 'Đang bán' },
  { value: 'pre_order',    label: 'Pre-order' },
  { value: 'out_of_stock', label: 'Hết hàng' },
]
const BRAND_OPTIONS = [
  { value: '',            label: '— Không có —' },
  { value: 'nissan',      label: 'Nissan' },
  { value: 'porsche',     label: 'Porsche' },
  { value: 'lamborghini', label: 'Lamborghini' },
  { value: 'ferrari',     label: 'Ferrari' },
  { value: 'mclaren',     label: 'McLaren' },
  { value: 'bmw',         label: 'BMW' },
  { value: 'toyota',      label: 'Toyota' },
  { value: 'honda',       label: 'Honda' },
  { value: 'mercedes',    label: 'Mercedes' },
  { value: 'audi',        label: 'Audi' },
  { value: 'other',       label: 'Khác' },
]
const MATERIAL_OPTIONS = [
  { value: '',            label: '— Không có —' },
  { value: 'box_only',    label: 'Box Only' },
  { value: 'box_protect', label: 'Box + Protect' },
]
const STATUS_COLOR: Record<string, string> = {
  active:       'text-emerald-400 bg-emerald-500/10',
  pre_order:    'text-blue-400 bg-blue-500/10',
  out_of_stock: 'text-red-400 bg-red-500/10',
}
const STATUS_LABEL: Record<string, string> = {
  active: 'Đang bán', pre_order: 'Pre-order', out_of_stock: 'Hết hàng',
}

function vnd(n: number) { return new Intl.NumberFormat('vi-VN').format(n) + ' ₫' }

function slugify(text: string) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

function nanoid(len = 6) { return Math.random().toString(36).slice(2, 2 + len) }

// ─── blank form ──────────────────────────────────────────────────────────────

const BLANK: Omit<ProductRow, 'created_at'> = {
  id: '', type: 'box_custom', name: '', slug: '', price: 89000,
  images: [], stock: 999, status: 'active', published: true,
  description: null, tags: [], material: null, brand: null,
  sku: null, manufacturer: null, car_make: null, car_model: null,
  color: null, color_group: null,
}

// ─── shared input styles ─────────────────────────────────────────────────────

const INPUT = 'w-full bg-[#0D0D14] border border-[#1E1E28] rounded-lg px-3 h-9 text-sm text-[#EEEEF4] placeholder:text-[#383848] focus:outline-none focus:border-[#6366f1] transition-colors'
const TEXTAREA = 'w-full bg-[#0D0D14] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-[#EEEEF4] placeholder:text-[#383848] focus:outline-none focus:border-[#6366f1] transition-colors resize-none'
const SELECT = 'w-full bg-[#0D0D14] border border-[#1E1E28] rounded-lg px-3 h-9 text-sm text-[#EEEEF4] focus:outline-none focus:border-[#6366f1] transition-colors appearance-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">{label}</span>
      {children}
    </label>
  )
}

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────

function ProductModal({
  initial, onClose, onSave, saving, isNew,
}: {
  initial: Omit<ProductRow, 'created_at'>
  onClose: () => void
  onSave: (row: Omit<ProductRow, 'created_at'>) => void
  saving: boolean
  isNew: boolean
}) {
  const [form, setForm] = useState<Omit<ProductRow, 'created_at'>>({
    ...initial,
    id: initial.id || `fb-${nanoid()}`,
  })
  const [imagesText, setImagesText] = useState(initial.images.join('\n'))
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function set(field: keyof typeof form, value: unknown) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleNameChange(v: string) {
    set('name', v)
    if (isNew) set('slug', slugify(v))
  }

  function autoColorGroup() {
    const parts = [form.manufacturer, form.car_make, form.car_model].filter(Boolean)
    if (parts.length === 3) set('color_group', parts.map(s => slugify(s!)).join('-'))
  }

  function suggestSku() {
    const s = (v: string | null, n: number) =>
      (v ?? '').replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, n)
    const parts = [s(form.manufacturer, 3), s(form.car_make, 3), s(form.car_model, 6)]
    if (form.color) parts.push(s(form.color, 3))
    const suggestion = parts.filter(Boolean).join('-')
    if (suggestion) set('sku', suggestion)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    setUploadError('')
    const urls: string[] = []
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`"${file.name}" quá lớn (tối đa 5 MB)`)
        continue
      }
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) { setUploadError(json.error ?? 'Upload thất bại'); continue }
      urls.push(json.url)
    }
    if (urls.length) {
      setImagesText(prev => [...prev.split('\n').filter(Boolean), ...urls].join('\n'))
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const images = imagesText.split('\n').map(s => s.trim()).filter(Boolean)
    onSave({ ...form, images })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#111118] border border-[#1E1E28] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1A22] shrink-0">
          <h2 className="font-semibold text-[#EEEEF4] text-base">
            {isNew ? 'Thêm sản phẩm' : 'Chỉnh sửa sản phẩm'}
          </h2>
          <button onClick={onClose} className="text-[#484858] hover:text-[#EEEEF4] transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">
          <Field label="Tên sản phẩm *">
            <input required value={form.name} onChange={e => handleNameChange(e.target.value)}
              placeholder="VD: LB-Works Nissan GT-R R35 Nismo" className={INPUT} />
          </Field>

          <Field label="Slug (URL)">
            <input value={form.slug} onChange={e => set('slug', e.target.value)}
              placeholder="lb-works-gtr-r35-nismo" className={INPUT} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Loại *">
              <div className="relative">
                <select value={form.type} onChange={e => set('type', e.target.value)} className={SELECT}>
                  {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#484858] pointer-events-none" />
              </div>
            </Field>
            <Field label="Trạng thái *">
              <div className="relative">
                <select value={form.status} onChange={e => set('status', e.target.value)} className={SELECT}>
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#484858] pointer-events-none" />
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Giá (VND) *">
              <input required type="number" min={0} value={form.price}
                onChange={e => set('price', parseInt(e.target.value) || 0)} className={INPUT} />
            </Field>
            <Field label="Tồn kho *">
              <input required type="number" min={0} value={form.stock}
                onChange={e => set('stock', parseInt(e.target.value) || 0)} className={INPUT} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Thương hiệu xe">
              <BrandSelect value={form.brand ?? null} onChange={v => set('brand', v)} />
            </Field>
            <Field label="Vật liệu">
              <div className="relative">
                <select value={form.material ?? ''} onChange={e => set('material', e.target.value || null)} className={SELECT}>
                  {MATERIAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#484858] pointer-events-none" />
              </div>
            </Field>
          </div>

          {/* ── SKU & Variant fields ─────────────────────────────── */}
          <div className="h-px bg-[#1A1A22]" />
          <p className="text-sm font-bold text-[#484858] uppercase tracking-widest -mb-1">SKU & Phân loại</p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Hãng SX diecast">
              <input value={form.manufacturer ?? ''} placeholder="mini-gt, master, poprace"
                onChange={e => { set('manufacturer', e.target.value || null); }}
                onBlur={autoColorGroup} className={INPUT} />
            </Field>
            <Field label="Hãng xe">
              <input value={form.car_make ?? ''} placeholder="porsche, nissan, land-rover"
                onChange={e => { set('car_make', e.target.value || null); }}
                onBlur={autoColorGroup} className={INPUT} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Mẫu xe">
              <input value={form.car_model ?? ''} placeholder="911-gt3-r, defender-110"
                onChange={e => { set('car_model', e.target.value || null); }}
                onBlur={autoColorGroup} className={INPUT} />
            </Field>
            <Field label="Màu / Livery">
              <input value={form.color ?? ''} placeholder="pink, dust-sand, supercar-advocates"
                onChange={e => set('color', e.target.value || null)} className={INPUT} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Mã SKU">
              <div className="flex gap-1.5">
                <input value={form.sku ?? ''} placeholder="MGT-POR-911GTR-PK"
                  onChange={e => set('sku', e.target.value.toUpperCase() || null)}
                  className={INPUT + ' font-mono uppercase'} />
                <button type="button" onClick={suggestSku}
                  className="shrink-0 h-9 px-2.5 rounded-lg bg-[#1A1A22] border border-[#2A2A38] text-sm text-[#7A7A90] hover:text-[#EEEEF4] transition-colors whitespace-nowrap">
                  Gợi ý
                </button>
              </div>
            </Field>
            <Field label="Color group">
              <input value={form.color_group ?? ''} placeholder="mini-gt-porsche-911-gt3r"
                onChange={e => set('color_group', e.target.value || null)} className={INPUT} />
            </Field>
          </div>

          <Field label="Hình ảnh">
            <label className={[
              'flex flex-col items-center justify-center gap-2 w-full h-24 rounded-lg border border-dashed cursor-pointer transition-colors select-none',
              uploading
                ? 'border-[#6366f1]/40 bg-[#6366f1]/5 cursor-not-allowed'
                : 'border-[#2A2A38] hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5',
            ].join(' ')}>
              <input ref={fileRef} type="file" accept="image/*" multiple disabled={uploading}
                onChange={handleFileChange} className="sr-only" />
              {uploading
                ? <><Loader2 size={18} className="text-[#6366f1] animate-spin" /><span className="text-sm text-[#7A7A90]">Đang tải lên…</span></>
                : <><Upload size={18} className="text-[#484858]" /><span className="text-sm text-[#7A7A90]">Chọn ảnh <span className="text-[#484858]">· auto WebP · tối đa 5 MB</span></span></>
              }
            </label>
            {uploadError && <p className="text-sm text-red-400 mt-1.5">{uploadError}</p>}
            <textarea rows={3} value={imagesText} onChange={e => setImagesText(e.target.value)}
              placeholder="hoặc dán URL thủ công (mỗi dòng 1 URL)&#10;/products/p1.jpg" className={`${TEXTAREA} mt-2`} />
          </Field>

          <Field label="Mô tả">
            <textarea rows={3} value={form.description ?? ''} onChange={e => set('description', e.target.value || null)}
              placeholder="Mô tả ngắn về sản phẩm..." className={TEXTAREA} />
          </Field>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1A1A22]">
            <button type="button" onClick={onClose}
              className="h-9 px-4 rounded-lg text-sm font-medium text-[#7A7A90] hover:text-[#EEEEF4] transition-colors">
              Huỷ
            </button>
            <button type="submit" disabled={saving}
              className="h-9 px-5 rounded-lg text-sm font-semibold bg-[#6366f1] text-white hover:bg-[#5558e6] disabled:opacity-50 transition-colors">
              {saving ? 'Đang lưu…' : isNew ? 'Lưu' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ name, onCancel, onConfirm, deleting }: {
  name: string; onCancel: () => void; onConfirm: () => void; deleting: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#111118] border border-[#1E1E28] rounded-2xl shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-[#EEEEF4] text-sm">Xoá sản phẩm?</p>
            <p className="text-sm text-[#484858] mt-0.5 line-clamp-1">{name}</p>
          </div>
        </div>
        <p className="text-sm text-[#7A7A90] mb-5">Thao tác này không thể hoàn tác.</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 h-9 rounded-lg text-sm font-medium text-[#7A7A90] border border-[#1E1E28] hover:text-[#EEEEF4] transition-colors">
            Huỷ
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 h-9 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors">
            {deleting ? 'Đang xoá…' : 'Xoá'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CSV helpers ─────────────────────────────────────────────────────────────

const CSV_COLS = ['id','name','type','sku','manufacturer','car_make','car_model','color','color_group','price','stock','status','material','brand','description','images','tags']

const CSV_TEMPLATE = [
  CSV_COLS.join(','),
  ',Porsche 911 GT3-R Pink,box_custom,MGT-POR-911GTR-PK,mini-gt,porsche,911-gt3-r,pink,mini-gt-porsche-911-gt3r,99000,999,active,box_protect,porsche,Custom box mô tả,,hot|new',
].join('\n')

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'products-template.csv'; a.click()
  URL.revokeObjectURL(url)
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim())
  const result: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const cells: string[] = []
    let cur = ''; let inQ = false
    for (let j = 0; j < lines[i].length; j++) {
      const ch = lines[i][j]
      if (ch === '"') { if (inQ && lines[i][j+1] === '"') { cur += '"'; j++ } else inQ = !inQ }
      else if (ch === ',' && !inQ) { cells.push(cur); cur = '' }
      else cur += ch
    }
    cells.push(cur)
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => { row[h] = (cells[idx] ?? '').trim() })
    if (row.name) result.push(row)
  }
  return result
}

// ─── CSV Import Modal ─────────────────────────────────────────────────────────

function CsvImportModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [fileName, setFileName] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number } | null>(null)
  const [err, setErr] = useState('')

  function handleFile(file: File) {
    setErr(''); setResult(null)
    if (!file.name.endsWith('.csv')) { setErr('Chỉ hỗ trợ file .csv'); return }
    const reader = new FileReader()
    reader.onload = e => {
      const parsed = parseCSV(e.target?.result as string)
      if (!parsed.length) { setErr('File không có dữ liệu hợp lệ.'); return }
      setRows(parsed); setFileName(file.name)
    }
    reader.readAsText(file, 'utf-8')
  }

  async function handleImport() {
    setImporting(true); setErr('')
    const res = await fetch('/api/admin/import-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows }),
    })
    const json = await res.json()
    setImporting(false)
    if (!res.ok) { setErr(json.error ?? 'Import thất bại'); return }
    setResult(json)
    onDone()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#111118] border border-[#1E1E28] rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1E28]">
          <h2 className="font-semibold text-[#EEEEF4] text-base">Import CSV</h2>
          <button onClick={onClose} className="text-[#484858] hover:text-[#EEEEF4] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Template download */}
          <div className="flex items-center justify-between bg-[#0D0D14] border border-[#1E1E28] rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#EEEEF4]">File mẫu CSV</p>
              <p className="text-sm text-[#484858] mt-0.5">17 cột — id, name, type, sku, giá, ảnh…</p>
            </div>
            <button onClick={downloadTemplate}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1A1A22] border border-[#2A2A38] text-sm text-[#7A7A90] hover:text-[#EEEEF4] transition-colors">
              <FileDown size={13} /> Tải mẫu
            </button>
          </div>

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            className="border-2 border-dashed border-[#1E1E28] rounded-xl p-8 text-center cursor-pointer hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5 transition-colors"
          >
            <FileUp size={28} className="mx-auto text-[#484858] mb-2" />
            {fileName ? (
              <p className="text-sm font-medium text-[#EEEEF4]">{fileName}</p>
            ) : (
              <p className="text-sm text-[#484858]">Kéo thả file .csv vào đây hoặc click để chọn</p>
            )}
            <input ref={fileRef} type="file" accept=".csv" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
          </div>

          {/* Preview */}
          {rows.length > 0 && !result && (
            <div className="bg-[#0D0D14] border border-[#1E1E28] rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#1E1E28]">
                <p className="text-sm text-[#7A7A90]">
                  <span className="font-semibold text-[#EEEEF4]">{rows.length}</span> sản phẩm — xem trước 3 dòng đầu
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1E1E28]">
                      {['name','sku','type','price','stock','status'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-[#484858] uppercase tracking-wide font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A22]">
                    {rows.slice(0, 3).map((r, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-[#EEEEF4] max-w-[160px] truncate">{r.name}</td>
                        <td className="px-3 py-2 text-[#7A7A90] font-mono">{r.sku || '—'}</td>
                        <td className="px-3 py-2 text-[#7A7A90]">{r.type || 'box_custom'}</td>
                        <td className="px-3 py-2 text-[#7A7A90] tabular-nums">{r.price}</td>
                        <td className="px-3 py-2 text-[#7A7A90] tabular-nums">{r.stock}</td>
                        <td className="px-3 py-2 text-[#7A7A90]">{r.status || 'active'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Success */}
          {result && (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-400 font-medium">
                Import thành công <span className="font-bold">{result.imported}</span> sản phẩm!
              </p>
            </div>
          )}

          {err && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{err}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1E1E28]">
          <button onClick={onClose}
            className="h-9 px-4 rounded-lg text-sm text-[#7A7A90] border border-[#1E1E28] hover:text-[#EEEEF4] transition-colors">
            {result ? 'Đóng' : 'Huỷ'}
          </button>
          {!result && (
            <button onClick={handleImport} disabled={!rows.length || importing}
              className="h-9 px-5 rounded-lg bg-[#6366f1] text-white text-sm font-semibold hover:bg-[#5558e6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2">
              {importing ? <><Loader2 size={14} className="animate-spin" /> Đang import…</> : <>Import {rows.length > 0 ? `${rows.length} sản phẩm` : ''}</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Omit<ProductRow, 'created_at'>>(BLANK)
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null)
  const [, startTransition] = useTransition()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true); setError('')
    try { setProducts(await getProducts()) }
    catch (e: unknown) { setError((e as Error).message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing({ ...BLANK, id: `fb-${nanoid()}` })
    setModal('create')
  }
  function openEdit(p: ProductRow) {
    const { created_at: _unused, ...rest } = p
    void _unused
    setEditing(rest)
    setModal('edit')
  }

  async function handleSave(row: Omit<ProductRow, 'created_at'>) {
    setSaving(true)
    try { await upsertProduct(row); setModal(null); startTransition(load) }
    catch (e: unknown) { alert((e as Error).message) }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try { await deleteProduct(deleteTarget.id); setDeleteTarget(null); startTransition(load) }
    catch (e: unknown) { alert((e as Error).message) }
    finally { setDeleting(false) }
  }

  async function handleDuplicate(p: ProductRow) {
    const newId = `fb-${nanoid()}`
    const { created_at: _, ...rest } = p
    void _
    await upsertProduct({
      ...rest,
      id: newId,
      name: `${p.name} Copy`,
      slug: `${p.slug}-copy`,
      published: false,
    })
    startTransition(load)
  }

  async function handleTogglePublished(p: ProductRow) {
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, published: !x.published } : x))
    await setPublished(p.id, !p.published)
  }

  const filtered = search.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : products

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="shrink-0">
          <h1 className="font-jakarta font-extrabold text-[#EEEEF4] text-2xl lg:text-3xl">Sản phẩm</h1>
          <p className="text-sm text-[#484858] mt-1">{products.length} sản phẩm</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setImportOpen(true)}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-[#2A2A38] bg-[#111118] text-[#EEEEF4] text-sm font-semibold hover:bg-[#1A1A22] hover:border-[#3A3A4A] transition-colors">
            <FileUp size={15} /> Import CSV
          </button>
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-[#6366f1] text-white text-sm font-semibold hover:bg-[#5558e6] transition-colors">
            <Plus size={15} /> Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484858] pointer-events-none" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc SKU…"
          className="w-full sm:w-80 h-9 pl-9 pr-3 bg-[#111118] border border-[#1E1E28] rounded-xl text-sm text-[#EEEEF4] placeholder-[#383848] focus:outline-none focus:border-[#6366f1]/60 transition-colors"
        />
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error} — Chạy migration SQL để tạo bảng <code className="font-mono">products</code>.
        </div>
      )}

      <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sm text-[#484858]">Đang tải…</div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-[#484858] mb-3">Chưa có sản phẩm nào.</p>
            <button onClick={openCreate}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-[#6366f1] text-white text-sm font-semibold hover:bg-[#5558e6] transition-colors">
              <Plus size={13} /> Thêm sản phẩm đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1A1A22]">
                  <th className="text-left px-6 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide">Sản phẩm</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide hidden md:table-cell">Loại</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide hidden xl:table-cell">SKU</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide">Giá</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide hidden lg:table-cell">Kho</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide">Trạng thái</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide">Hiển thị</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide hidden xl:table-cell">Cập nhật</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A22]">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-[#16161E] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1A1A22] shrink-0">
                          {p.images[0] && (
                            <Image src={p.images[0]} alt={p.name} width={40} height={40}
                              className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#EEEEF4] leading-snug">{p.name}</p>
                          <p className="text-sm text-[#484858] mt-0.5 font-mono">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-sm text-[#7A7A90] bg-[#1A1A22] px-2 py-1 rounded-md">
                        {TYPE_OPTIONS.find(o => o.value === p.type)?.label ?? p.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden xl:table-cell">
                      {p.sku
                        ? <span className="font-mono text-sm text-[#6366f1] bg-[#6366f1]/10 px-1.5 py-0.5 rounded">{p.sku}</span>
                        : <span className="text-[#2A2A38] text-sm">—</span>
                      }
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-[#EEEEF4] tabular-nums whitespace-nowrap">
                      {vnd(p.price)}
                    </td>
                    <td className="px-4 py-4 text-center hidden lg:table-cell text-[#7A7A90] tabular-nums">
                      {p.stock}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[p.status] ?? ''}`}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </td>
                    {/* Published toggle */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleTogglePublished(p)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.published ? 'bg-emerald-500' : 'bg-[#2A2A38]'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${p.published ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    {/* Updated at */}
                    <td className="px-4 py-4 text-right hidden xl:table-cell">
                      <span className="text-sm text-[#383848]">
                        {(p.updated_at ?? p.created_at)
                          ? new Date(p.updated_at ?? p.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' })
                          : '—'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tip label="Chỉnh sửa">
                          <button onClick={() => openEdit(p)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#484858] hover:text-[#EEEEF4] hover:bg-[#1A1A22] transition-colors">
                            <Pencil size={13} />
                          </button>
                        </Tip>
                        <Tip label="Nhân bản">
                          <button onClick={() => handleDuplicate(p)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#484858] hover:text-[#EEEEF4] hover:bg-[#1A1A22] transition-colors">
                            <Copy size={13} />
                          </button>
                        </Tip>
                        <Tip label="Xoá">
                          <button onClick={() => setDeleteTarget(p)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#484858] hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </Tip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(modal === 'create' || modal === 'edit') && (
        <ProductModal initial={editing} onClose={() => setModal(null)} onSave={handleSave} saving={saving} isNew={modal === 'create'} />
      )}
      {deleteTarget && (
        <DeleteConfirm name={deleteTarget.name} onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete} deleting={deleting} />
      )}
      {importOpen && (
        <CsvImportModal
          onClose={() => setImportOpen(false)}
          onDone={() => { startTransition(load) }}
        />
      )}
    </div>
  )
}

// ─── Brand Select ─────────────────────────────────────────────────────────────

const BRAND_LOGO_SIZE = 20

function BrandSelect({ value, onChange }: {
  value: string | null
  onChange: (v: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const selected = BRAND_OPTIONS.find(o => o.value === (value ?? '')) ?? BRAND_OPTIONS[0]

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full bg-[#0D0D14] border border-[#1E1E28] rounded-lg px-3 h-9 text-sm text-[#EEEEF4] flex items-center gap-2.5 focus:outline-none focus:border-[#6366f1] transition-colors hover:border-[#2A2A3C]"
      >
        <BrandLogoOrPlaceholder brand={value} size={BRAND_LOGO_SIZE} />
        <span className="flex-1 text-left">{selected.label}</span>
        <ChevronDown size={13} className={`text-[#484858] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#0D0D14] border border-[#2A2A38] rounded-xl z-[200] overflow-hidden shadow-2xl shadow-black/60 py-1">
          {BRAND_OPTIONS.map(o => {
            const active = (value ?? '') === o.value
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value || null); setOpen(false) }}
                className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-[#6366f1]/15 text-[#EEEEF4]'
                    : 'text-[#BBBBC8] hover:bg-[#1A1A26] hover:text-[#EEEEF4]'
                }`}
              >
                <BrandLogoOrPlaceholder brand={o.value || null} size={BRAND_LOGO_SIZE} />
                <span className="flex-1 text-left">{o.label}</span>
                {active && <span className="text-[#6366f1] text-sm">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function BrandLogoOrPlaceholder({ brand, size }: { brand: string | null; size: number }) {
  if (!brand || brand === 'other') {
    return <span className="shrink-0" style={{ width: size, height: size }} />
  }
  return (
    <span className="shrink-0 flex items-center justify-center" style={{ width: size * 1.6, height: size }}>
      <BrandLogo brand={brand as import('@/lib/types').CarBrand} size={size} variant="dark" />
    </span>
  )
}
