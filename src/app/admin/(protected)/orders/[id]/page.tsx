export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, User, CreditCard, MessageSquare } from 'lucide-react'
import { getOrder } from '@/lib/admin/queries'
import { StatusBadge, STATUS_OPTIONS } from '../../_components/StatusBadge'
import { updateOrderStatus, updatePaymentStatus } from '../../actions'

function vnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + ' ₫'
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#16161E] last:border-0">
      {icon && <span className="text-[#484858] mt-0.5 shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm font-medium text-[#EEEEF4]">{value}</p>
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
    <div className="p-6 lg:p-8">
      {/* Back + Header */}
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#484858] hover:text-[#7A7A90] transition-colors mb-4 uppercase tracking-wide"
        >
          <ArrowLeft size={13} /> Đơn hàng
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-mono font-bold text-[#EEEEF4] text-xl lg:text-2xl leading-none">
              {order.id}
            </h1>
            <p className="text-sm text-[#484858] mt-1.5 capitalize">{createdAt}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main — items */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1A1A22]">
              <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide">Sản phẩm</p>
            </div>
            <div className="divide-y divide-[#16161E]">
              {(order.items ?? []).map((item, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  {item.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-12 h-12 rounded-xl object-cover bg-[#16161E] shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#EEEEF4] leading-tight">{item.product_name}</p>
                    <p className="text-sm text-[#484858] mt-0.5">
                      x{item.quantity}
                      {item.variant_label && <span className="ml-1.5 text-[#6366f1]">· {item.variant_label}</span>}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-[#EEEEF4] whitespace-nowrap tabular-nums">
                    {vnd(item.unit_price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-6 py-4 border-t border-[#1E1E28] space-y-2.5 bg-[#0F0F15]">
              <div className="flex justify-between text-sm text-[#7A7A90]">
                <span>Tạm tính</span>
                <span className="tabular-nums">{vnd(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-400">
                  <span>Giảm giá {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                  <span className="tabular-nums">-{vnd(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-2 border-t border-[#1E1E28]">
                <span className="text-[#EEEEF4]">Tổng cộng</span>
                <span className="text-[#F0A500] tabular-nums">{vnd(order.total)}</span>
              </div>
            </div>
          </div>

          {order.note && (
            <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl px-6 py-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={13} className="text-[#484858]" />
                <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide">Ghi chú</p>
              </div>
              <p className="text-sm text-[#7A7A90] leading-relaxed">{order.note}</p>
            </div>
          )}

          {/* Design preview — only for box_custom items with design_data */}
          {(order.items ?? []).filter(i => i.design_data).map((item, i) => {
            const d = item.design_data!
            const specs = [
              ['Engine', d.spec_engine], ['Power', d.spec_power],
              ['Torque', d.spec_torque], ['0–100', d.spec_acceleration],
              ['Top Speed', d.spec_top_speed], ['Bodykit', d.spec_bodykit],
            ].filter(([, v]) => v)

            return (
              <div key={i} className="bg-[#111118] border border-[#1E1E28] rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#1A1A22] flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide">Thiết kế — {item.product_name}</p>
                  <span className="text-sm font-semibold text-[#F0A500] bg-[#F0A500]/10 px-2 py-0.5 rounded-full">
                    {d.box_size?.toUpperCase()} × {d.quantity}
                  </span>
                </div>

                <div className="px-6 py-5 space-y-5">
                  {/* Car image */}
                  {d.car_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.car_image_url} alt="Car" className="h-28 w-full object-contain rounded-xl bg-[#0F0F15]" />
                  )}

                  {/* Car name + colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide mb-1">Tên xe</p>
                      <p className="text-sm text-[#EEEEF4]">{d.car_name || '—'}</p>
                      {d.specs_line && <p className="text-sm text-[#484858] mt-0.5">{d.specs_line}</p>}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide mb-2">Màu</p>
                      <div className="flex items-center gap-2">
                        {[
                          { color: d.bg_color, label: 'BG' },
                          { color: d.accent_color, label: 'Accent' },
                          { color: d.text_color, label: 'Text' },
                        ].map(({ color, label }) => (
                          <div key={label} className="flex flex-col items-center gap-1">
                            <span
                              className="w-6 h-6 rounded-full border border-[#2A2A38] shrink-0"
                              style={{ background: color }}
                              title={color}
                            />
                            <span className="text-[9px] text-[#383848]">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Specs */}
                  {specs.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide mb-2">Thông số kỹ thuật</p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                        {specs.map(([k, v]) => (
                          <div key={k} className="flex items-center gap-2 text-sm">
                            <span className="text-[#383848] w-20 shrink-0">{k}</span>
                            <span className="text-[#EEEEF4] truncate">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warning text */}
                  {d.warning_text && (
                    <div>
                      <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide mb-1">Warning text</p>
                      <p className="text-sm text-[#7A7A90] font-mono">{d.warning_text}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Right — customer + status */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl px-5 py-2">
            <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide py-3 border-b border-[#1A1A22]">
              Khách hàng
            </p>
            <InfoRow label="Họ tên"     value={shipping.name ?? '—'}             icon={<User size={14} />} />
            <InfoRow label="Điện thoại" value={shipping.phone ?? '—'}            icon={<Phone size={14} />} />
            <InfoRow label="Địa chỉ"   value={addressParts.join(', ') || '—'}   icon={<MapPin size={14} />} />
            <InfoRow label="Thanh toán" value={order.payment_method ?? '—'}      icon={<CreditCard size={14} />} />
          </div>

          {/* Payment status — VietQR chuyển khoản cần admin xác nhận thủ công */}
          <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide">
                Trạng thái thanh toán
              </p>
              <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${
                order.payment_status === 'paid'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : order.payment_status === 'cancelled'
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-[#F0A500]/10 text-[#F0A500]'
              }`}>
                {order.payment_status === 'paid' ? 'Đã thanh toán'
                  : order.payment_status === 'cancelled' ? 'Đã huỷ'
                  : 'Chờ chuyển khoản'}
              </span>
            </div>
            {order.payment_status !== 'paid' && (
              <form>
                <button
                  formAction={async () => {
                    'use server'
                    await updatePaymentStatus(id, 'paid')
                  }}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15 transition-colors"
                >
                  ✓ Xác nhận đã nhận chuyển khoản
                </button>
              </form>
            )}
          </div>

          <div className="bg-[#111118] border border-[#1E1E28] rounded-2xl px-5 py-4">
            <p className="text-sm font-semibold text-[#484858] uppercase tracking-wide mb-3">
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
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors border ${
                    order.status === opt.value
                      ? 'bg-[#F0A500]/10 border-[#F0A500]/25 text-[#F0A500]'
                      : 'bg-transparent border-[#1E1E28] text-[#7A7A90] hover:text-[#EEEEF4] hover:border-[#2A2A38]'
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
