export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
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
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-bold text-[#333] uppercase tracking-[0.2em] mb-1">{today}</p>
        <h1 className="font-jakarta font-extrabold text-white text-2xl lg:text-3xl">Tổng quan</h1>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatsCard
          label="Doanh thu"
          value={vnd(stats.totalRevenue)}
          sub={`Tháng này: ${vnd(stats.monthRevenue)}`}
          accent
          icon={<TrendingUp size={16} />}
        />
        <StatsCard
          label="Đơn hàng"
          value={stats.totalOrders.toString()}
          sub={`Tháng này: ${stats.monthOrders} · Hôm nay: ${stats.todayOrders}`}
          icon={<ShoppingBag size={16} />}
        />
        <StatsCard
          label="Giá trị TB"
          value={vnd(stats.avgOrder)}
          sub="Trên mỗi đơn hàng"
          icon={<BarChart2 size={16} />}
        />
        <StatsCard
          label="Khách hàng"
          value={stats.totalCustomers.toString()}
          sub="Đã đặt hàng"
          icon={<Users size={16} />}
        />
      </div>

      {/* Chart + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-[#0D0D17] border border-[#1C1C26] rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] font-bold text-[#444] uppercase tracking-[0.16em]">Doanh thu 30 ngày</p>
              <p className="text-white font-bold text-lg mt-0.5">{vnd(stats.chartData.reduce((s, d) => s + d.revenue, 0))}</p>
            </div>
            <span className="text-[10px] font-bold text-[#F0A500] bg-[#F0A500]/10 px-2.5 py-1 rounded-full border border-[#F0A500]/20">
              {stats.chartData.reduce((s, d) => s + d.orders, 0)} đơn
            </span>
          </div>
          <RevenueChart data={stats.chartData} />
        </div>

        {/* Top products */}
        <div className="bg-[#0D0D17] border border-[#1C1C26] rounded-xl p-5">
          <p className="text-[11px] font-bold text-[#444] uppercase tracking-[0.16em] mb-4">Sản phẩm bán chạy</p>
          {stats.topProducts.length === 0 ? (
            <p className="text-[#333] text-sm text-center py-8">Chưa có dữ liệu</p>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-start gap-3">
                  <span className="text-[11px] font-bold text-[#333] w-4 shrink-0 mt-0.5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white leading-tight line-clamp-2">{p.name}</p>
                    <p className="text-[11px] text-[#444] mt-0.5">{p.qty} bán · {vnd(p.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-[#0D0D17] border border-[#1C1C26] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1C1C26]">
          <p className="text-[11px] font-bold text-[#444] uppercase tracking-[0.16em]">Đơn hàng gần đây</p>
          <a href="/admin/orders" className="text-[11px] font-bold text-[#F0A500] hover:text-[#F0A500]/80 transition-colors">
            Xem tất cả →
          </a>
        </div>
        <OrdersTable orders={stats.recentOrders} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="p-8 flex items-center gap-3 text-[#444] text-sm">
        <span className="w-4 h-4 border-2 border-[#F0A500] border-t-transparent rounded-full animate-spin" />
        Đang tải dữ liệu...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
