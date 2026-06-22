import Image from 'next/image'
import { DUMMY_PRODUCTS } from '@/lib/data/products'

const TYPE_LABEL: Record<string, string> = {
  box_catalog: 'Box Catalog',
  box_custom:  'Box Custom',
  water_decal: 'Water Decal',
  accessory_3d: 'Phụ kiện 3D',
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  active:       { label: 'Đang bán',    color: 'text-emerald-400 bg-emerald-500/10' },
  pre_order:    { label: 'Pre-order',   color: 'text-blue-400 bg-blue-500/10' },
  out_of_stock: { label: 'Hết hàng',   color: 'text-red-400 bg-red-500/10' },
}

function vnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + ' ₫'
}

export default function ProductsPage() {
  const products = DUMMY_PRODUCTS

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-jakarta font-extrabold text-[#EEEEF4] text-2xl lg:text-3xl">Sản phẩm</h1>
        <p className="text-sm text-[#484858] mt-1">{products.length} sản phẩm</p>
      </div>

      <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1A1A22]">
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-[#484858] uppercase tracking-wide">Sản phẩm</th>
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-[#484858] uppercase tracking-wide hidden md:table-cell">Loại</th>
                <th className="text-right px-6 py-3 text-[11px] font-semibold text-[#484858] uppercase tracking-wide">Giá</th>
                <th className="text-center px-6 py-3 text-[11px] font-semibold text-[#484858] uppercase tracking-wide hidden lg:table-cell">Vật liệu</th>
                <th className="text-center px-6 py-3 text-[11px] font-semibold text-[#484858] uppercase tracking-wide">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A22]">
              {products.map(p => {
                const status = STATUS_LABEL[p.status] ?? STATUS_LABEL.active
                const hasPromo = !!p.promotion
                const salePrice = hasPromo
                  ? Math.round(p.price * (1 - (p.promotion!.discount_pct / 100)))
                  : null

                return (
                  <tr key={p.id} className="hover:bg-[#16161E] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1A1A22] shrink-0">
                          {p.images[0] && (
                            <Image
                              src={p.images[0]}
                              alt={p.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#EEEEF4] leading-snug line-clamp-2 max-w-[280px]">{p.name}</p>
                          <p className="text-[11px] text-[#383848] mt-0.5">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-xs text-[#7A7A90] bg-[#1A1A22] px-2 py-1 rounded-md">
                        {TYPE_LABEL[p.type] ?? p.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {salePrice ? (
                        <div>
                          <p className="font-semibold text-[#F0A500] tabular-nums">{vnd(salePrice)}</p>
                          <p className="text-[11px] text-[#383848] line-through tabular-nums">{vnd(p.price)}</p>
                        </div>
                      ) : (
                        <span className="font-semibold text-[#EEEEF4] tabular-nums">{vnd(p.price)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center hidden lg:table-cell">
                      {p.material ? (
                        <span className="text-xs text-[#7A7A90]">
                          {p.material === 'box_protect' ? 'Box + Protect' : 'Box Only'}
                        </span>
                      ) : (
                        <span className="text-xs text-[#2A2A38]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
