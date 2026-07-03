'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Zap, X } from 'lucide-react'
import { formatVND } from '@/lib/utils/format'
import {
  upsertFlashSale, deleteFlashSale, toggleFlashSaleActive,
  type FlashSaleRow, type PickerProduct, type UpsertFlashSaleInput,
} from './actions'

type SaleStatus = 'upcoming' | 'running' | 'ended'

function saleStatus(s: { starts_at: string; ends_at: string }): SaleStatus {
  const now = Date.now()
  if (now < new Date(s.starts_at).getTime()) return 'upcoming'
  if (now >= new Date(s.ends_at).getTime()) return 'ended'
  return 'running'
}

const STATUS_CHIP: Record<SaleStatus, { label: string; cls: string }> = {
  upcoming: { label: 'Sắp diễn ra', cls: 'bg-sky-500/10 text-sky-400' },
  running: { label: 'Đang chạy', cls: 'bg-emerald-500/10 text-emerald-500' },
  ended: { label: 'Đã kết thúc', cls: 'bg-zinc-500/10 text-[#484858]' },
}

const INACTIVE_CHIP = 'bg-zinc-500/10 text-[#484858]'

// datetime-local wants "YYYY-MM-DDTHH:mm" in local time
function toLocalInput(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface ItemDraft { product_id: string; sale_price: number; quantity_limit: number | null }

interface Draft {
  id?: string
  name: string
  starts_at: string // datetime-local value
  ends_at: string
  active: boolean
  items: ItemDraft[]
}

const EMPTY_DRAFT: Draft = { name: '', starts_at: '', ends_at: '', active: true, items: [] }

const INPUT = 'w-full bg-[#0D0D14] border border-[#1E1E28] rounded-lg px-3 h-9 text-sm text-[#EEEEF4] placeholder:text-[#383848] focus:outline-none focus:border-[#6366f1] transition-colors'

export function FlashSalesClient({ initialSales, products }: {
  initialSales: FlashSaleRow[]
  products: PickerProduct[]
}) {
  const router = useRouter()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const productById = useMemo(() => new Map(products.map(p => [p.id, p])), [products])

  const pickerResults = useMemo(() => {
    if (!draft) return []
    const q = search.trim().toLowerCase()
    if (!q) return []
    const chosen = new Set(draft.items.map(i => i.product_id))
    return products
      .filter(p => !chosen.has(p.id) && (p.name.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q)))
      .slice(0, 8)
  }, [draft, search, products])

  function openEdit(sale?: FlashSaleRow) {
    setError('')
    setSearch('')
    if (!sale) { setDraft({ ...EMPTY_DRAFT }); return }
    setDraft({
      id: sale.id,
      name: sale.name,
      starts_at: toLocalInput(sale.starts_at),
      ends_at: toLocalInput(sale.ends_at),
      active: sale.active,
      items: sale.flash_sale_items.map(i => ({
        product_id: i.product_id, sale_price: i.sale_price, quantity_limit: i.quantity_limit,
      })),
    })
  }

  async function onSave() {
    if (!draft) return
    setSaving(true)
    setError('')
    const payload: UpsertFlashSaleInput = {
      id: draft.id,
      name: draft.name,
      starts_at: draft.starts_at ? new Date(draft.starts_at).toISOString() : '',
      ends_at: draft.ends_at ? new Date(draft.ends_at).toISOString() : '',
      active: draft.active,
      items: draft.items,
    }
    const res = await upsertFlashSale(payload)
    setSaving(false)
    if (res.error) { setError(res.error); return }
    setDraft(null)
    router.refresh()
  }

  async function onDelete(sale: FlashSaleRow) {
    if (!confirm(`Xóa flash sale "${sale.name}"?`)) return
    await deleteFlashSale(sale.id)
    router.refresh()
  }

  async function onToggle(sale: FlashSaleRow) {
    await toggleFlashSaleActive(sale.id, !sale.active)
    router.refresh()
  }

  function addItem(p: PickerProduct) {
    if (!draft) return
    setDraft({ ...draft, items: [...draft.items, { product_id: p.id, sale_price: p.price, quantity_limit: null }] })
    setSearch('')
  }

  function updateItem(productId: string, patch: Partial<ItemDraft>) {
    if (!draft) return
    setDraft({ ...draft, items: draft.items.map(i => i.product_id === productId ? { ...i, ...patch } : i) })
  }

  function removeItem(productId: string) {
    if (!draft) return
    setDraft({ ...draft, items: draft.items.filter(i => i.product_id !== productId) })
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <h1 className="font-jakarta font-extrabold text-[#EEEEF4] text-2xl lg:text-3xl flex items-center gap-2">
          <Zap size={24} className="text-amber-400" />
          Flash sale <span className="text-[#484858] font-normal">({initialSales.length})</span>
        </h1>
        <button onClick={() => openEdit()}
          className="h-9 px-4 rounded-xl bg-[#6366f1] text-sm font-semibold text-white hover:bg-[#5558e6] transition-colors flex items-center gap-1.5">
          <Plus size={14} /> Tạo đợt sale
        </button>
      </div>

      {initialSales.length === 0 ? (
        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl py-16 text-center text-[#484858] text-sm">
          Chưa có đợt flash sale nào.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {initialSales.map(sale => {
            const status = saleStatus(sale)
            const chip = sale.active ? STATUS_CHIP[status] : { label: 'Tắt', cls: INACTIVE_CHIP }
            return (
              <div key={sale.id} className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-sm font-semibold px-2 py-0.5 rounded-lg ${chip.cls}`}>{chip.label}</span>
                    <h2 className="font-semibold text-[#EEEEF4] text-base">{sale.name}</h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onToggle(sale)}
                      className="text-sm font-medium text-[#7A7A90] hover:text-[#EEEEF4] transition-colors px-2">
                      {sale.active ? 'Tắt' : 'Bật'}
                    </button>
                    <button onClick={() => openEdit(sale)}
                      className="text-[#484858] hover:text-[#EEEEF4] transition-colors p-1.5">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => onDelete(sale)}
                      className="text-[#484858] hover:text-[#EEEEF4] transition-colors p-1.5">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[#7A7A90] mb-4">
                  {new Date(sale.starts_at).toLocaleString('vi-VN')} → {new Date(sale.ends_at).toLocaleString('vi-VN')}
                </p>
                <div className="flex flex-col gap-2">
                  {sale.flash_sale_items.map(item => (
                    <div key={item.id} className="flex items-center justify-between gap-3 text-sm border-t border-[#1A1A22] pt-2">
                      <span className="text-[#EEEEF4]">{item.products?.name ?? item.product_id}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[#484858] line-through">{formatVND(item.products?.price ?? 0)}</span>
                        <span className="text-red-400 font-bold">{formatVND(item.sale_price)}</span>
                        <span className="text-[#7A7A90] text-sm">
                          {item.quantity_limit ? `${item.sold_count}/${item.quantity_limit}` : 'Không giới hạn'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#111118] border border-[#1E1E28] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1A22] shrink-0">
              <h2 className="font-semibold text-[#EEEEF4] text-base">{draft.id ? 'Sửa flash sale' : 'Tạo flash sale'}</h2>
              <button onClick={() => setDraft(null)} className="text-[#484858] hover:text-[#EEEEF4] transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Tên đợt sale *</span>
                <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Flash sale cuối tuần" className={INPUT} />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Bắt đầu *</span>
                  <input type="datetime-local" value={draft.starts_at}
                    onChange={e => setDraft({ ...draft, starts_at: e.target.value })} className={INPUT} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Kết thúc *</span>
                  <input type="datetime-local" value={draft.ends_at}
                    onChange={e => setDraft({ ...draft, ends_at: e.target.value })} className={INPUT} />
                </label>
              </div>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={draft.active}
                  onChange={e => setDraft({ ...draft, active: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#6366f1]" />
                <span className="text-sm font-medium text-[#7A7A90]">Kích hoạt</span>
              </label>

              <div className="flex flex-col gap-1.5 relative">
                <span className="text-sm font-semibold text-[#7A7A90] uppercase tracking-wide">Thêm sản phẩm</span>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm theo tên hoặc SKU..." className={INPUT} />
                {pickerResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-[#0D0D14] border border-[#1E1E28] rounded-lg shadow-2xl max-h-56 overflow-y-auto">
                    {pickerResults.map(p => (
                      <button key={p.id} type="button" onClick={() => addItem(p)}
                        className="w-full text-left px-3 py-2 text-sm text-[#EEEEF4] hover:bg-[#16161E] transition-colors flex items-center justify-between gap-2">
                        <span>{p.name}</span>
                        <span className="text-[#484858]">{formatVND(p.price)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {draft.items.length > 0 && (
                <div className="flex flex-col gap-3">
                  {draft.items.map(item => {
                    const product = productById.get(item.product_id)
                    const basePrice = product?.price ?? 0
                    const pctOff = basePrice > 0 ? Math.round((1 - item.sale_price / basePrice) * 100) : 0
                    return (
                      <div key={item.product_id} className="bg-[#0D0D14] border border-[#1E1E28] rounded-lg p-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-[#EEEEF4] font-medium">{product?.name ?? item.product_id}</span>
                          <button type="button" onClick={() => removeItem(item.product_id)}
                            className="text-[#484858] hover:text-[#EEEEF4] transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-sm text-[#484858] line-through">{formatVND(basePrice)}</span>
                          <label className="flex items-center gap-1.5">
                            <span className="text-sm text-[#7A7A90]">Giá sale</span>
                            <input type="number" min={0} value={item.sale_price}
                              onChange={e => updateItem(item.product_id, { sale_price: parseInt(e.target.value) || 0 })}
                              className="w-28 bg-[#111118] border border-[#1E1E28] rounded-lg px-2 h-8 text-sm text-[#EEEEF4] focus:outline-none focus:border-[#6366f1]" />
                          </label>
                          {basePrice > 0 && (
                            <span className="text-sm font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                              -{pctOff}%
                            </span>
                          )}
                          <label className="flex items-center gap-1.5">
                            <span className="text-sm text-[#7A7A90]">Giới hạn</span>
                            <input type="number" min={0} value={item.quantity_limit ?? ''} placeholder="Không giới hạn"
                              onChange={e => updateItem(item.product_id, { quantity_limit: e.target.value ? (parseInt(e.target.value) || null) : null })}
                              className="w-28 bg-[#111118] border border-[#1E1E28] rounded-lg px-2 h-8 text-sm text-[#EEEEF4] placeholder:text-[#383848] focus:outline-none focus:border-[#6366f1]" />
                          </label>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1A1A22] shrink-0">
              <button onClick={() => setDraft(null)}
                className="h-9 px-4 rounded-lg text-sm font-medium text-[#7A7A90] hover:text-[#EEEEF4] transition-colors">
                Huỷ
              </button>
              <button onClick={onSave} disabled={saving}
                className="h-9 px-5 rounded-lg text-sm font-semibold bg-[#6366f1] text-white hover:bg-[#5558e6] disabled:opacity-50 transition-colors">
                {saving ? 'Đang lưu…' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
