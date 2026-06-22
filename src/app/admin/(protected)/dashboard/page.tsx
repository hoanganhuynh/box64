export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import Link from 'next/link'
import { TrendingUp, ShoppingBag, Users, BarChart2 } from 'lucide-react'
import { getDashboardStats } from '@/lib/admin/queries'
import { StatsCard } from '../_components/StatsCard'
import { RevenueChart } from '../_components/RevenueChart'
import { OrdersTable } from '../_components/OrdersTable'

function vnd(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace('.0', '') + ' tỷ'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + ' triệu'
  return new Intl.NumberFormat('vi-VN').format(n) + ' ₫'
}

async function DashboardContent() {
  const stats = await getDashboardStats()
  const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-[#484858] mb-1 capitalize">{today}</p>
        <h1 className="font-jakarta font-extrabold text-[#EEEEF4] text-2xl lg:text-3xl">Tổng quan</h1>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          label="Doanh thu"
          value={vnd(stats.totalRevenue)}
          sub={`Tháng này: ${vnd(stats.monthRevenue)}`}
          accent
          icon={<TrendingUp size={18} />}
        />
        <StatsCard
          label="Đơn hàng"
          value={stats.totalOrders.toString()}
          sub={`Tháng này: ${stats.monthOrders} · Hôm nay: ${stats.todayOrders}`}
          icon={<ShoppingBag size={18} />}
          iconBg="bg-blue-500/10 text-blue-400"
        />
        <StatsCard
          label="Giá trị TB"
          value={vnd(stats.avgOrder)}
          sub="Trên mỗi đơn hàng"
          icon={<BarChart2 size={18} />}
          iconBg="bg-violet-500/10 text-violet-400"
        />
        <StatsCard
          label="Khách hàng"
          value={stats.totalCustomers.toString()}
          sub="Đã đặt hàng"
          icon={<Users size={18} />}
          iconBg="bg-emerald-500/10 text-emerald-400"
        />
      </div>

      {/* Chart + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-[#111118] border border-[#1E1E28] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] font-semibold text-[#484858] uppercase tracking-wide">Doanh thu 30 ngày</p>
              <p className="text-[#EEEEF4] font-bold text-lg mt-0.5">{vnd(stats.chartData.reduce((s, d) => s + d.revenue, 0))}</p>
            </div>
            <span className="text-[11px] font-semibold text-[#F0A500] bg-[#F0A500]/10 px-3 py-1 rounded-full">
              {stats.chartData.reduce((s, d) => s + d.orders, 0)} đơn
            </span>
          </div>
          <RevenueChart data={stats.chartData} />
        </div>

        <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl p-6">
          <p className="text-[11px] font-semibold text-[#484858] uppercase tracking-wide mb-5">Bán chạy</p>
          {stats.topProducts.length === 0 ? (
            <p className="text-[#383848] text-sm text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <div className="flex flex-col gap-4">
              {stats.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-start gap-3">
                  <span className="text-xs font-bold text-[#2A2A38] w-5 shrink-0 mt-0.5 tabular-nums">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#EEEEF4] leading-snug line-clamp-2">{p.name}</p>
                    <p className="text-[11px] text-[#484858] mt-1">{p.qty} bán · {vnd(p.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1A22]">
          <p className="text-sm font-semibold text-[#EEEEF4]">Đơn hàng gần đây</p>
          <Link href="/admin/orders" className="text-[12px] font-semibold text-[#F0A500] hover:text-[#F0A500]/80 transition-colors">
            Xem tất cả →
          </Link>
        </div>
        <OrdersTable orders={stats.recentOrders} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="p-8 flex items-center gap-3 text-[#484858] text-sm">
        <span className="w-4 h-4 border-2 border-[#F0A500] border-t-transparent rounded-full animate-spin" />
        Đang tải dữ liệu...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
