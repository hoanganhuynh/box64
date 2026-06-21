'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ExternalLink, ChevronDown } from 'lucide-react'
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
        <ChevronDown size={12} className={`text-[#444] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-[#111120] border border-[#1C1C26] rounded-xl overflow-hidden shadow-2xl min-w-[160px]">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => select(opt.value)}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-white/5 transition-colors flex items-center gap-2 ${value === opt.value ? 'text-[#F0A500]' : 'text-[#888]'}`}
              >
                {value === opt.value && <span className="w-1 h-1 rounded-full bg-[#F0A500]" />}
                {value !== opt.value && <span className="w-1 h-1" />}
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
      <div className="text-center py-16 text-[#444] text-sm">
        Không có đơn hàng nào.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1C1C26]">
            {['Mã đơn', 'Khách hàng', 'Sản phẩm', 'Tổng tiền', 'Trạng thái', 'Thời gian', ''].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#444] uppercase tracking-[0.16em] whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="border-b border-[#0F0F18] hover:bg-white/[0.02] transition-colors group">
              <td className="px-4 py-3.5">
                <span className="font-mono text-[11px] text-[#F0A500] tracking-wide">{order.id}</span>
              </td>
              <td className="px-4 py-3.5">
                <p className="font-medium text-white text-xs leading-tight">{order.shipping?.name ?? '—'}</p>
                <p className="text-[11px] text-[#444] mt-0.5">{order.shipping?.phone ?? ''}</p>
              </td>
              <td className="px-4 py-3.5">
                <p className="text-xs text-[#888]">{order.items?.length ?? 0} sản phẩm</p>
                <p className="text-[11px] text-[#444] mt-0.5 truncate max-w-[160px]">
                  {order.items?.[0]?.product_name ?? ''}
                  {(order.items?.length ?? 0) > 1 ? ` +${order.items.length - 1}` : ''}
                </p>
              </td>
              <td className="px-4 py-3.5 font-bold text-white whitespace-nowrap">
                {vnd(order.total)}
              </td>
              <td className="px-4 py-3.5">
                <StatusSelect orderId={order.id} current={order.status} />
              </td>
              <td className="px-4 py-3.5 text-[11px] text-[#444] whitespace-nowrap">
                {relativeDate(order.created_at)}
              </td>
              <td className="px-4 py-3.5">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[#444] hover:text-[#F0A500] p-1 rounded"
                  aria-label="Xem chi tiết"
                >
                  <ExternalLink size={14} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
