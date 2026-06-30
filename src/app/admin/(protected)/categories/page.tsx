'use client'
import { useState, useEffect, useTransition, useRef } from 'react'
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react'
import { nanoid } from 'nanoid'
import {
  getCategories, upsertCategory, deleteCategory,
  type CategoryRow,
} from './actions'

const PRESET_COLORS = [
  '#6366f1', '#F0A500', '#22c55e', '#e54c10',
  '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6',
]

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

function relDate(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'Hôm nay'
  if (d === 1) return 'Hôm qua'
  if (d < 30) return `${d} ngày trước`
  return `${Math.floor(d / 30)} tháng trước`
}

const BLANK: Omit<CategoryRow, 'created_at'> = {
  id: '',
  slug: '',
  name: '',
  description: '',
  color: '#6366f1',
  sort_order: 0,
}

interface ModalProps {
  initial: Omit<CategoryRow, 'created_at'>
  isNew: boolean
  onSave: (row: Omit<CategoryRow, 'created_at'>) => void
  onClose: () => void
  saving: boolean
}

function CategoryModal({ initial, isNew, onSave, onClose, saving }: ModalProps) {
  const [form, setForm] = useState(initial)
  const [autoSlug, setAutoSlug] = useState(isNew)

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }))
    if (k === 'name' && autoSlug) {
      setForm(f => ({ ...f, name: v as string, slug: slugify(v as string) }))
    }
  }

  function handleSlugChange(v: string) {
    setAutoSlug(false)
    setForm(f => ({ ...f, slug: v }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.slug.trim()) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0D0D14] border border-[#1E1E28] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1A22]">
          <h2 className="font-semibold text-[#EEEEF4] text-base">
            {isNew ? 'Thêm danh mục' : 'Chỉnh sửa danh mục'}
          </h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#484858] hover:text-[#EEEEF4] hover:bg-[#1A1A22] transition-colors">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#7A7A90] mb-1.5">Tên danh mục *</label>
            <input
              value={form.name} onChange={e => set('name', e.target.value)}
              required placeholder="Box Catalog"
              className="w-full h-9 px-3 bg-[#111118] border border-[#1E1E28] rounded-xl text-sm text-[#EEEEF4] placeholder-[#383848] focus:outline-none focus:border-[#6366f1]/60 transition-colors"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-[#7A7A90] mb-1.5">Slug *</label>
            <input
              value={form.slug} onChange={e => handleSlugChange(e.target.value)}
              required placeholder="box_catalog"
              className="w-full h-9 px-3 bg-[#111118] border border-[#1E1E28] rounded-xl text-sm text-[#EEEEF4] placeholder-[#383848] focus:outline-none focus:border-[#6366f1]/60 transition-colors font-mono"
            />
            <p className="text-sm text-[#383848] mt-1">Dùng làm giá trị type của sản phẩm.</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#7A7A90] mb-1.5">Mô tả</label>
            <input
              value={form.description ?? ''} onChange={e => set('description', e.target.value)}
              placeholder="Mô tả ngắn về danh mục"
              className="w-full h-9 px-3 bg-[#111118] border border-[#1E1E28] rounded-xl text-sm text-[#EEEEF4] placeholder-[#383848] focus:outline-none focus:border-[#6366f1]/60 transition-colors"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-[#7A7A90] mb-1.5">Màu</label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button key={c} type="button" onClick={() => set('color', c)}
                  className={`w-6 h-6 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-offset-[#0D0D14] ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                  style={{ background: c }}
                />
              ))}
              <input type="color" value={form.color}
                onChange={e => set('color', e.target.value)}
                className="w-6 h-6 rounded-full cursor-pointer border-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full"
              />
            </div>
          </div>

          {/* Sort order */}
          <div>
            <label className="block text-sm font-medium text-[#7A7A90] mb-1.5">Thứ tự</label>
            <input
              type="number" min={0}
              value={form.sort_order} onChange={e => set('sort_order', Number(e.target.value))}
              className="w-24 h-9 px-3 bg-[#111118] border border-[#1E1E28] rounded-xl text-sm text-[#EEEEF4] focus:outline-none focus:border-[#6366f1]/60 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="h-9 px-4 rounded-xl border border-[#1E1E28] text-sm text-[#7A7A90] hover:text-[#EEEEF4] transition-colors">
              Huỷ
            </button>
            <button type="submit" disabled={saving}
              className="h-9 px-5 rounded-xl bg-[#6366f1] text-white text-sm font-semibold hover:bg-[#5558e6] disabled:opacity-50 transition-colors">
              {saving ? 'Đang lưu…' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Omit<CategoryRow, 'created_at'>>(BLANK)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [, startTransition] = useTransition()

  async function load() {
    try {
      setCategories(await getCategories())
    } catch {
      // table not created yet — show empty
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing({ ...BLANK, id: nanoid() })
    setModal('create')
  }

  function openEdit(c: CategoryRow) {
    const { created_at: _, ...rest } = c
    void _
    setEditing(rest)
    setModal('edit')
  }

  async function handleSave(row: Omit<CategoryRow, 'created_at'>) {
    setSaving(true)
    try {
      await upsertCategory(row)
      setModal(null)
      startTransition(load)
    } catch (e: unknown) {
      alert((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteCategory(deleteTarget.id)
      setDeleteTarget(null)
      startTransition(load)
    } catch (e: unknown) {
      alert((e as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  const filtered = search.trim()
    ? categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase())
      )
    : categories

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="shrink-0">
          <h1 className="font-jakarta font-extrabold text-[#EEEEF4] text-2xl lg:text-3xl">Danh mục <span className="text-[#484858] font-normal">({categories.length})</span></h1>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-[#6366f1] text-white text-sm font-semibold hover:bg-[#5558e6] transition-colors">
          <Plus size={15} /> Thêm danh mục
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484858] pointer-events-none" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm danh mục…"
          className="w-full sm:w-80 h-9 pl-9 pr-3 bg-[#111118] border border-[#1E1E28] rounded-xl text-sm text-[#EEEEF4] placeholder-[#383848] focus:outline-none focus:border-[#6366f1]/60 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sm text-[#484858]">Đang tải…</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-[#484858] mb-3">
              {search ? 'Không tìm thấy kết quả.' : 'Chưa có danh mục nào.'}
            </p>
            {!search && (
              <button onClick={openCreate}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-[#6366f1] text-white text-sm font-semibold hover:bg-[#5558e6] transition-colors">
                <Plus size={13} /> Thêm danh mục đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1A1A22]">
                  <th className="text-left px-6 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide">Danh mục</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide hidden md:table-cell">Slug</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide hidden lg:table-cell">Mô tả</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide hidden md:table-cell">Thứ tự</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide hidden lg:table-cell">Ngày tạo</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A22]">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-[#16161E] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: c.color + '20' }}>
                          <span className="text-sm font-black" style={{ color: c.color }}>
                            {c.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[#EEEEF4]">{c.name}</p>
                          {c.description && (
                            <p className="text-sm text-[#484858] mt-0.5 line-clamp-1 md:hidden">{c.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="font-mono text-sm text-[#7A7A90] bg-[#1A1A22] px-1.5 py-0.5 rounded">{c.slug}</span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-sm text-[#484858] line-clamp-1">{c.description ?? '—'}</span>
                    </td>
                    <td className="px-4 py-4 text-right hidden md:table-cell">
                      <span className="text-sm text-[#7A7A90] tabular-nums">{c.sort_order}</span>
                    </td>
                    <td className="px-4 py-4 text-right hidden lg:table-cell">
                      <span className="text-sm text-[#383848]">{relDate(c.created_at)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(c)} title="Chỉnh sửa"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#484858] hover:text-[#EEEEF4] hover:bg-[#1A1A22] transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteTarget(c)} title="Xoá"
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

      {/* Create / Edit modal */}
      {modal && (
        <CategoryModal
          initial={editing}
          isNew={modal === 'create'}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm bg-[#0D0D14] border border-[#1E1E28] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto">
              <Trash2 size={18} className="text-red-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-[#EEEEF4]">Xoá danh mục?</p>
              <p className="text-sm text-[#484858] mt-1">
                <span className="text-[#EEEEF4]">{deleteTarget.name}</span> sẽ bị xoá vĩnh viễn.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 h-9 rounded-xl border border-[#1E1E28] text-sm text-[#7A7A90] hover:text-[#EEEEF4] transition-colors">
                Huỷ
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 h-9 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors">
                {deleting ? 'Đang xoá…' : 'Xoá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
