export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getOrders } from '@/lib/admin/queries'
import { OrdersTable } from '../_components/OrdersTable'
import { SearchInput } from './SearchInput'

const STATUS_TABS = [
  { value: 'all',       label: 'Tất cả' },
  { value: 'pending',   label: 'Chờ xử lý' },
  { value: 'printing',  label: 'Đang in' },
  { value: 'shipped',   label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã huỷ' },
]

async function OrdersContent({ status, page, search }: { status: string; page: number; search: string }) {
  const { orders, total, pageSize } = await getOrders({ status, page, search })
  const totalPages = Math.ceil(total / pageSize)

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-jakarta font-extrabold text-[#EEEEF4] text-2xl lg:text-3xl">
          Đơn hàng <span className="text-[#484858] font-normal">({total})</span>
        </h1>
        <a
          href="/admin/api/export"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111118] border border-[#1E1E28] text-sm font-semibold text-[#7A7A90] hover:text-[#EEEEF4] hover:border-[#2A2A38] transition-colors"
        >
          ↓ Xuất CSV
        </a>
      </div>

      <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl overflow-hidden">
        <OrdersTable orders={orders} />
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 0 && (
            <Link
              href={`/admin/orders?status=${status}&page=${page - 1}&search=${search}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111118] border border-[#1E1E28] text-sm font-medium text-[#7A7A90] hover:text-[#EEEEF4] hover:border-[#2A2A38] transition-colors"
            >
              <ChevronLeft size={14} /> Trước
            </Link>
          )}
          <span className="text-sm font-medium text-[#484858] px-3 tabular-nums">
            {page + 1} / {totalPages}
          </span>
          {page < totalPages - 1 && (
            <Link
              href={`/admin/orders?status=${status}&page=${page + 1}&search=${search}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111118] border border-[#1E1E28] text-sm font-medium text-[#7A7A90] hover:text-[#EEEEF4] hover:border-[#2A2A38] transition-colors"
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
  searchParams: Promise<{ status?: string; page?: string; search?: string }>
}) {
  const params = await searchParams
  const status = params.status ?? 'all'
  const page = Math.max(0, parseInt(params.page ?? '0', 10))
  const search = params.search ?? ''

  return (
    <div className="p-6 lg:p-8">
      {/* Search + status tabs */}
      <div className="flex flex-col gap-3 mb-6">
        <SearchInput defaultValue={search} />
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map(tab => (
            <Link
              key={tab.value}
              href={`/admin/orders?status=${tab.value}&page=0${search ? `&search=${search}` : ''}`}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                status === tab.value
                  ? 'bg-[#F0A500] text-[#0A0A0F]'
                  : 'bg-[#111118] border border-[#1E1E28] text-[#7A7A90] hover:text-[#EEEEF4] hover:border-[#2A2A38]'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <Suspense
        key={`${status}-${page}-${search}`}
        fallback={
          <div className="flex items-center gap-3 text-[#484858] text-sm py-8">
            <span className="w-4 h-4 border-2 border-[#F0A500] border-t-transparent rounded-full animate-spin" />
            Đang tải...
          </div>
        }
      >
        <OrdersContent status={status} page={page} search={search} />
      </Suspense>
    </div>
  )
}
