'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { StatusBadge, STATUS_OPTIONS } from './StatusBadge'
import { updateOrderStatus } from '../actions'
import type { OrderRow } from '@/lib/admin/queries'

function vnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + ' ₫'
}

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'vừa xong'
  if (m < 60) return `${m} phút trước`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} giờ trước`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} ngày trước`
  return new Date(iso).toLocaleDateString('vi-VN')
}

function StatusSelect({ orderId, current }: { orderId: string; current: string }) {
  const [value, setValue] = useState(current)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function select(next: string) {
    setOpen(false)
    if (next === value) return
    setValue(next)
    startTransition(async () => {
      await updateOrderStatus(orderId, next)
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        disabled={isPending}
        className="flex items-center gap-1 cursor-pointer disabled:opacity-50"
        aria-label="Thay đổi trạng thái"
      >
        <StatusBadge status={value} />
        <ChevronDown size={11} className={`text-[#484858] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1.5 z-20 bg-[#16161E] border border-[#1E1E28] rounded-xl overflow-hidden shadow-2xl min-w-[168px]">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => select(opt.value)}
                className={
                  value === opt.value
                    ? 'w-full text-left px-4 py-2.5 text-xs font-semibold text-[#F0A500] bg-[#F0A500]/10 transition-colors'
                    : 'w-full text-left px-4 py-2.5 text-xs font-medium text-[#7A7A90] hover:bg-white/[0.04] hover:text-[#EEEEF4] transition-colors'
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  if (!orders.length) {
    return (
      <div className="text-center py-16 text-[#383848] text-sm">
        Không có đơn hàng nào.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1A1A22]">
            {['Mã đơn', 'Khách hàng', 'Sản phẩm', 'Tổng tiền', 'Trạng thái', 'Thời gian', ''].map(h => (
              <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-[#484858] uppercase tracking-wide whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="border-b border-[#16161E] hover:bg-white/[0.02] transition-colors group">
              <td className="px-5 py-4">
                <span className="font-mono text-[11px] text-[#F0A500] font-semibold">{order.id}</span>
              </td>
              <td className="px-5 py-4">
                <p className="font-semibold text-[#EEEEF4] text-xs leading-tight">{order.shipping?.name ?? '—'}</p>
                <p className="text-[11px] text-[#484858] mt-0.5">{order.shipping?.phone ?? ''}</p>
              </td>
              <td className="px-5 py-4">
                <p className="text-xs text-[#7A7A90]">{order.items?.length ?? 0} sản phẩm</p>
                <p className="text-[11px] text-[#484858] mt-0.5 truncate max-w-[160px]">
                  {order.items?.[0]?.product_name ?? ''}
                  {(order.items?.length ?? 0) > 1 ? ` +${order.items.length - 1}` : ''}
                </p>
              </td>
              <td className="px-5 py-4 font-bold text-[#EEEEF4] whitespace-nowrap tabular-nums">
                {vnd(order.total)}
              </td>
              <td className="px-5 py-4">
                <StatusSelect orderId={order.id} current={order.status} />
              </td>
              <td className="px-5 py-4 text-[11px] text-[#484858] whitespace-nowrap">
                {relativeDate(order.created_at)}
              </td>
              <td className="px-5 py-4">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center w-7 h-7 rounded-lg text-[#484858] hover:text-[#F0A500] hover:bg-[#F0A500]/10"
                  aria-label="Xem chi tiết"
                >
                  <ArrowRight size={14} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
