export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, User, CreditCard, MessageSquare } from 'lucide-react'
import { getOrder } from '@/lib/admin/queries'
import { StatusBadge, STATUS_OPTIONS } from '../../_components/StatusBadge'
import { updateOrderStatus } from '../../actions'

function vnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + ' ₫'
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#111120] last:border-0">
      {icon && <span className="text-[#333] mt-0.5 shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-[#444] uppercase tracking-[0.14em] mb-0.5">{label}</p>
        <p className="text-sm text-white">{value}</p>
      </div>
    </div>
  )
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let order
  try {
    order = await getOrder(id)
  } catch {
    notFound()
  }

  const shipping = order.shipping ?? {}
  const addressParts = [
    shipping.line1,
    shipping.ward,
    shipping.district,
    shipping.city,
  ].filter(Boolean)

  const createdAt = new Date(order.created_at).toLocaleString('vi-VN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="p-6 lg:p-8 max-w-[900px]">
      {/* Back + Header */}
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-[11px] font-bold text-[#444] hover:text-white transition-colors mb-4 uppercase tracking-[0.14em]"
        >
          <ArrowLeft size={13} /> Đơn hàng
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-jakarta font-extrabold text-white text-xl lg:text-2xl leading-none">
              {order.id}
            </h1>
            <p className="text-[12px] text-[#444] mt-1.5">{createdAt}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main — items + payment */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Items */}
          <div className="bg-[#0D0D17] border border-[#1C1C26] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#1C1C26]">
              <p className="text-[10px] font-bold text-[#444] uppercase tracking-[0.16em]">Sản phẩm</p>
            </div>
            <div className="divide-y divide-[#111120]">
              {(order.items ?? []).map((item, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4">
                  {item.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-12 h-12 rounded-lg object-cover bg-[#111120]"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white leading-tight">{item.product_name}</p>
                    <p className="text-[11px] text-[#444] mt-0.5">x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-white whitespace-nowrap">
                    {vnd(item.unit_price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-5 py-4 border-t border-[#1C1C26] space-y-2">
              <div className="flex justify-between text-sm text-[#555]">
                <span>Tạm tính</span>
                <span>{vnd(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Giảm giá {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                  <span>-{vnd(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-[#111120]">
                <span>Tổng cộng</span>
                <span className="text-[#F0A500]">{vnd(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Note */}
          {order.note && (
            <div className="bg-[#0D0D17] border border-[#1C1C26] rounded-xl px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={13} className="text-[#444]" />
                <p className="text-[10px] font-bold text-[#444] uppercase tracking-[0.14em]">Ghi chú</p>
              </div>
              <p className="text-sm text-[#888] leading-relaxed">{order.note}</p>
            </div>
          )}
        </div>

        {/* Sidebar — customer + status */}
        <div className="flex flex-col gap-4">
          {/* Customer */}
          <div className="bg-[#0D0D17] border border-[#1C1C26] rounded-xl px-5 py-2">
            <p className="text-[10px] font-bold text-[#444] uppercase tracking-[0.16em] py-3 border-b border-[#111120]">
              Khách hàng
            </p>
            <InfoRow label="Họ tên" value={shipping.name ?? '—'} icon={<User size={14} />} />
            <InfoRow label="Số điện thoại" value={shipping.phone ?? '—'} icon={<Phone size={14} />} />
            <InfoRow label="Địa chỉ" value={addressParts.join(', ') || '—'} icon={<MapPin size={14} />} />
            <InfoRow label="Thanh toán" value={order.payment_method ?? '—'} icon={<CreditCard size={14} />} />
          </div>

          {/* Update status */}
          <div className="bg-[#0D0D17] border border-[#1C1C26] rounded-xl px-5 py-4">
            <p className="text-[10px] font-bold text-[#444] uppercase tracking-[0.16em] mb-3">
              Cập nhật trạng thái
            </p>
            <form className="flex flex-col gap-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  formAction={async () => {
                    'use server'
                    await updateOrderStatus(id, opt.value)
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold transition-colors border ${
                    order.status === opt.value
                      ? 'bg-[#F0A500]/10 border-[#F0A500]/25 text-[#F0A500]'
                      : 'bg-transparent border-[#1C1C26] text-[#555] hover:text-white hover:border-[#2A2A35]'
                  }`}
                >
                  {order.status === opt.value && '✓ '}
                  {opt.label}
                </button>
              ))}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
