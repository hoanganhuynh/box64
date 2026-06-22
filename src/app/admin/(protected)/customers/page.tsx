export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getCustomers } from '@/lib/admin/queries'

function vnd(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + ' triệu'
  return new Intl.NumberFormat('vi-VN').format(n) + ' ₫'
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'Hôm nay'
  if (d === 1) return 'Hôm qua'
  if (d < 30) return `${d} ngày trước`
  const m = Math.floor(d / 30)
  return `${m} tháng trước`
}

async function CustomersContent() {
  const customers = await getCustomers()

  return (
    <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#1A1A22]">
        <p className="text-sm font-semibold text-[#EEEEF4]">{customers.length} khách hàng</p>
      </div>

      {customers.length === 0 ? (
        <div className="py-16 text-center text-[#383848] text-sm">Chưa có khách hàng</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1A1A22]">
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-[#484858] uppercase tracking-wide">Khách hàng</th>
                <th className="text-right px-6 py-3 text-[11px] font-semibold text-[#484858] uppercase tracking-wide">Đơn hàng</th>
                <th className="text-right px-6 py-3 text-[11px] font-semibold text-[#484858] uppercase tracking-wide">Đã chi</th>
                <th className="text-right px-6 py-3 text-[11px] font-semibold text-[#484858] uppercase tracking-wide hidden lg:table-cell">Đơn gần nhất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A22]">
              {customers.map((c, i) => (
                <tr key={c.phone} className="hover:bg-[#16161E] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1E1E28] flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-[#F0A500]">
                          {c.name.trim().split(' ').pop()?.charAt(0).toUpperCase() ?? '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-[#EEEEF4]">{c.name}</p>
                        <p className="text-xs text-[#484858] mt-0.5">{c.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[#EEEEF4] font-medium tabular-nums">{c.orders}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[#F0A500] font-semibold tabular-nums">{vnd(c.spent)}</span>
                  </td>
                  <td className="px-6 py-4 text-right hidden lg:table-cell">
                    <span className="text-xs text-[#484858]">{timeAgo(c.lastOrder)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function CustomersPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-jakarta font-extrabold text-[#EEEEF4] text-2xl lg:text-3xl">Khách hàng</h1>
        <p className="text-sm text-[#484858] mt-1">Danh sách khách hàng từ đơn hàng</p>
      </div>

      <Suspense fallback={
        <div className="p-8 flex items-center gap-3 text-[#484858] text-sm">
          <span className="w-4 h-4 border-2 border-[#F0A500] border-t-transparent rounded-full animate-spin" />
          Đang tải...
        </div>
      }>
        <CustomersContent />
      </Suspense>
    </div>
  )
}
