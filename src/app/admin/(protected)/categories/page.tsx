import { DUMMY_PRODUCTS } from '@/lib/data/products'
import type { ProductType } from '@/lib/types'

const CATEGORIES: { type: ProductType; label: string; desc: string; color: string }[] = [
  { type: 'box_catalog', label: 'Box Catalog',   desc: 'Template MiniGT có sẵn',     color: '#6366f1' },
  { type: 'box_custom',  label: 'Box Custom',    desc: 'Thiết kế theo yêu cầu',      color: '#F0A500' },
  { type: 'water_decal', label: 'Water Decal',   desc: 'Decal dán nước trang trí',   color: '#22c55e' },
  { type: 'accessory_3d',label: 'Phụ kiện 3D',  desc: 'Phụ kiện in 3D cho xe',      color: '#e54c10' },
]

function vnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + ' ₫'
}

export default function CategoriesPage() {
  const byType = Object.fromEntries(
    CATEGORIES.map(c => [c.type, DUMMY_PRODUCTS.filter(p => p.type === c.type)])
  )

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-jakarta font-extrabold text-[#EEEEF4] text-2xl lg:text-3xl">Danh mục</h1>
        <p className="text-sm text-[#484858] mt-1">{CATEGORIES.length} danh mục sản phẩm</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {CATEGORIES.map(cat => {
          const products = byType[cat.type] ?? []
          const totalStock = products.reduce((s, p) => s + p.stock, 0)
          const avgPrice = products.length > 0
            ? Math.round(products.reduce((s, p) => s + p.price, 0) / products.length)
            : 0

          return (
            <div key={cat.type} className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: cat.color + '18' }}
                >
                  <span className="text-lg font-black" style={{ color: cat.color }}>
                    {cat.label.charAt(0)}
                  </span>
                </div>
                <span className="text-2xl font-black text-[#EEEEF4] tabular-nums">
                  {products.length}
                </span>
              </div>

              <h3 className="font-semibold text-[#EEEEF4] text-base">{cat.label}</h3>
              <p className="text-xs text-[#484858] mt-1 mb-4">{cat.desc}</p>

              {products.length > 0 ? (
                <div className="flex items-center gap-4 pt-4 border-t border-[#1A1A22]">
                  <div>
                    <p className="text-[10px] text-[#383848] uppercase tracking-wide">Giá TB</p>
                    <p className="text-sm font-semibold text-[#EEEEF4] tabular-nums mt-0.5">{vnd(avgPrice)}</p>
                  </div>
                  <div className="h-8 w-px bg-[#1A1A22]" />
                  <div>
                    <p className="text-[10px] text-[#383848] uppercase tracking-wide">Tồn kho</p>
                    <p className="text-sm font-semibold text-[#EEEEF4] tabular-nums mt-0.5">
                      {totalStock >= 999 * products.length ? '∞' : totalStock}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-[#1A1A22]">
                  <span className="text-xs text-[#2A2A38]">Chưa có sản phẩm</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Product breakdown per category */}
      {CATEGORIES.filter(c => (byType[c.type] ?? []).length > 0).map(cat => {
        const products = byType[cat.type] ?? []
        return (
          <div key={cat.type} className="bg-[#111118] border border-[#1E1E28] rounded-2xl overflow-hidden mb-4">
            <div className="px-6 py-4 border-b border-[#1A1A22] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
              <p className="text-sm font-semibold text-[#EEEEF4]">{cat.label}</p>
              <span className="text-xs text-[#484858]">— {products.length} sản phẩm</span>
            </div>
            <div className="divide-y divide-[#1A1A22]">
              {products.map(p => (
                <div key={p.id} className="px-6 py-3 flex items-center gap-3 hover:bg-[#16161E] transition-colors">
                  <p className="flex-1 text-sm text-[#EEEEF4] line-clamp-1">{p.name}</p>
                  <span className="text-xs font-semibold text-[#7A7A90] tabular-nums shrink-0">
                    {new Intl.NumberFormat('vi-VN').format(p.price)} ₫
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    p.status === 'active' ? 'text-emerald-400 bg-emerald-500/10' :
                    p.status === 'pre_order' ? 'text-blue-400 bg-blue-500/10' :
                    'text-red-400 bg-red-500/10'
                  }`}>
                    {p.status === 'active' ? 'Đang bán' : p.status === 'pre_order' ? 'Pre-order' : 'Hết hàng'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
