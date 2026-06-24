'use client'
import { useEffect, useState, useTransition } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, X, ChevronDown, AlertTriangle } from 'lucide-react'
import {
  getProducts, upsertProduct, deleteProduct,
  type ProductRow,
} from './actions'

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
  images: [], stock: 999, status: 'active',
  description: null, tags: [], material: null, brand: null,
}

// ─── shared input styles ─────────────────────────────────────────────────────

const INPUT = 'w-full bg-[#0D0D14] border border-[#1E1E28] rounded-lg px-3 h-9 text-sm text-[#EEEEF4] placeholder:text-[#383848] focus:outline-none focus:border-[#6366f1] transition-colors'
const TEXTAREA = 'w-full bg-[#0D0D14] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-[#EEEEF4] placeholder:text-[#383848] focus:outline-none focus:border-[#6366f1] transition-colors resize-none'
const SELECT = 'w-full bg-[#0D0D14] border border-[#1E1E28] rounded-lg px-3 h-9 text-sm text-[#EEEEF4] focus:outline-none focus:border-[#6366f1] transition-colors appearance-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold text-[#7A7A90] uppercase tracking-wide">{label}</span>
      {children}
    </label>
  )
}

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────

function ProductModal({
  initial, onClose, onSave, saving,
}: {
  initial: Omit<ProductRow, 'created_at'>
  onClose: () => void
  onSave: (row: Omit<ProductRow, 'created_at'>) => void
  saving: boolean
}) {
  const isNew = !initial.id
  const [form, setForm] = useState<Omit<ProductRow, 'created_at'>>({
    ...initial,
    id: initial.id || `fb-${nanoid()}`,
  })
  const [imagesText, setImagesText] = useState(initial.images.join('\n'))

  function set(field: keyof typeof form, value: unknown) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleNameChange(v: string) {
    set('name', v)
    if (isNew) set('slug', slugify(v))
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
              <div className="relative">
                <select value={form.brand ?? ''} onChange={e => set('brand', e.target.value || null)} className={SELECT}>
                  {BRAND_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#484858] pointer-events-none" />
              </div>
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

          <Field label="Hình ảnh (mỗi URL 1 dòng)">
            <textarea rows={3} value={imagesText} onChange={e => setImagesText(e.target.value)}
              placeholder="/products/p1.jpg&#10;/products/p1b.jpg" className={TEXTAREA} />
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
              {saving ? 'Đang lưu…' : isNew ? 'Thêm sản phẩm' : 'Lưu thay đổi'}
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
            <p className="text-xs text-[#484858] mt-0.5 line-clamp-1">{name}</p>
          </div>
        </div>
        <p className="text-xs text-[#7A7A90] mb-5">Thao tác này không thể hoàn tác.</p>
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

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-jakarta font-extrabold text-[#EEEEF4] text-2xl lg:text-3xl">Sản phẩm</h1>
          <p className="text-sm text-[#484858] mt-1">{products.length} sản phẩm</p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-[#6366f1] text-white text-sm font-semibold hover:bg-[#5558e6] transition-colors">
          <Plus size={15} /> Thêm sản phẩm
        </button>
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
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-[#6366f1] text-white text-xs font-semibold hover:bg-[#5558e6] transition-colors">
              <Plus size={13} /> Thêm sản phẩm đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1A1A22]">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-[#484858] uppercase tracking-wide">Sản phẩm</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#484858] uppercase tracking-wide hidden md:table-cell">Loại</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-[#484858] uppercase tracking-wide">Giá</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-[#484858] uppercase tracking-wide hidden lg:table-cell">Kho</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-[#484858] uppercase tracking-wide">Trạng thái</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A22]">
                {products.map(p => (
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
                          <p className="font-medium text-[#EEEEF4] leading-snug line-clamp-1 max-w-[240px]">{p.name}</p>
                          <p className="text-[11px] text-[#383848] mt-0.5 font-mono">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-xs text-[#7A7A90] bg-[#1A1A22] px-2 py-1 rounded-md">
                        {TYPE_OPTIONS.find(o => o.value === p.type)?.label ?? p.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-[#EEEEF4] tabular-nums whitespace-nowrap">
                      {vnd(p.price)}
                    </td>
                    <td className="px-4 py-4 text-center hidden lg:table-cell text-[#7A7A90] tabular-nums">
                      {p.stock}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[p.status] ?? ''}`}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(p)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#484858] hover:text-[#EEEEF4] hover:bg-[#1A1A22] transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteTarget(p)}
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
        )}
      </div>

      {(modal === 'create' || modal === 'edit') && (
        <ProductModal initial={editing} onClose={() => setModal(null)} onSave={handleSave} saving={saving} />
      )}
      {deleteTarget && (
        <DeleteConfirm name={deleteTarget.name} onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete} deleting={deleting} />
      )}
    </div>
  )
}
