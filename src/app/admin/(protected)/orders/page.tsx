export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getOrders } from '@/lib/admin/queries'
import { OrdersTable } from '../_components/OrdersTable'

const STATUS_TABS = [
  { value: 'all',       label: 'Tất cả' },
  { value: 'pending',   label: 'Chờ xử lý' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipped',   label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã huỷ' },
]

async function OrdersContent({ status, page }: { status: string; page: number }) {
  const { orders, total, pageSize } = await getOrders({ status, page })
  const totalPages = Math.ceil(total / pageSize)

  return (
    <>
      <div className="bg-[#0D0D17] border border-[#1C1C26] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1C1C26] flex items-center justify-between">
          <p className="text-[11px] font-bold text-[#444] uppercase tracking-[0.16em]">
            {total} đơn hàng
          </p>
        </div>
        <OrdersTable orders={orders} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 0 && (
            <Link
              href={`/admin/orders?status=${status}&page=${page - 1}`}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#0D0D17] border border-[#1C1C26] text-xs text-[#888] hover:text-white hover:border-[#2A2A35] transition-colors"
            >
              <ChevronLeft size={14} /> Trước
            </Link>
          )}
          <span className="text-xs text-[#444] px-3">
            {page + 1} / {totalPages}
          </span>
          {page < totalPages - 1 && (
            <Link
              href={`/admin/orders?status=${status}&page=${page + 1}`}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#0D0D17] border border-[#1C1C26] text-xs text-[#888] hover:text-white hover:border-[#2A2A35] transition-colors"
            >
              Tiếp <ChevronRight size={14} />
            </Link>
          )}
        </div>
      )}
    </>
  )
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const params = await searchParams
  const status = params.status ?? 'all'
  const page = Math.max(0, parseInt(params.page ?? '0', 10))

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-jakarta font-extrabold text-white text-2xl lg:text-3xl">Đơn hàng</h1>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 flex-wrap mb-6">
        {STATUS_TABS.map(tab => (
          <Link
            key={tab.value}
            href={`/admin/orders?status=${tab.value}&page=0`}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              status === tab.value
                ? 'bg-[#F0A500] text-[#07070C]'
                : 'bg-[#0D0D17] border border-[#1C1C26] text-[#555] hover:text-white hover:border-[#2A2A35]'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Suspense fallback={
        <div className="flex items-center gap-3 text-[#444] text-sm py-8">
          <span className="w-4 h-4 border-2 border-[#F0A500] border-t-transparent rounded-full animate-spin" />
          Đang tải...
        </div>
      }>
        <OrdersContent status={status} page={page} />
      </Suspense>
    </div>
  )
}
