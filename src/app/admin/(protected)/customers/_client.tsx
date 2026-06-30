'use client'
import { useState } from 'react'
import { Search } from 'lucide-react'
import type { CustomerRow } from '@/lib/admin/queries'

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
  return `${Math.floor(d / 30)} tháng trước`
}

export default function CustomersClient({ customers }: { customers: CustomerRow[] }) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
      )
    : customers

  return (
    <>
      <h1 className="font-jakarta font-extrabold text-[#EEEEF4] text-2xl lg:text-3xl mb-6">
        Khách hàng <span className="text-[#484858] font-normal">({customers.length})</span>
      </h1>
      <div className="mb-4 relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484858] pointer-events-none" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc SĐT…"
          className="w-full sm:w-80 h-9 pl-9 pr-3 bg-[#111118] border border-[#1E1E28] rounded-xl text-sm text-[#EEEEF4] placeholder-[#383848] focus:outline-none focus:border-[#6366f1]/60 transition-colors"
        />
      </div>

      <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1A1A22]">
          <p className="text-sm font-semibold text-[#EEEEF4]">
            {filtered.length} <span className="text-[#484858] font-normal">/ {customers.length} khách hàng</span>
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[#383848] text-sm">
            {search ? 'Không tìm thấy kết quả' : 'Chưa có khách hàng'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1A1A22]">
                  <th className="text-left px-6 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide">Khách hàng</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide">Đơn hàng</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide">Đã chi</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-[#484858] uppercase tracking-wide hidden lg:table-cell">Đơn gần nhất</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A22]">
                {filtered.map(c => (
                  <tr key={c.phone} className="hover:bg-[#16161E] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1E1E28] flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-[#F0A500]">
                            {c.name.trim().split(' ').pop()?.charAt(0).toUpperCase() ?? '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[#EEEEF4]">{c.name}</p>
                          <p className="text-sm text-[#484858] mt-0.5">{c.phone}</p>
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
                      <span className="text-sm text-[#484858]">{timeAgo(c.lastOrder)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
