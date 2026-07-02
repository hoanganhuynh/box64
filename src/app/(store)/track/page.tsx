'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Search, Package, AlertTriangle, Copy, Check } from 'lucide-react'
import { trackOrder, type TrackedOrder } from '@/app/actions/orders'
import { formatVND } from '@/lib/utils/format'
import { StatusBadge, PaymentBadge } from '@/components/shop/OrderStatusBadges'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} aria-label="Copy" className="text-muted hover:text-gold transition-colors shrink-0">
      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
    </button>
  )
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<TrackedOrder | null>(null)
  const [searched, setSearched] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!orderId.trim() || !phone.trim()) return
    setLoading(true)
    setError('')
    setOrder(null)
    const result = await trackOrder(orderId, phone)
    setLoading(false)
    setSearched(true)
    if (!result) {
      setError('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn và số điện thoại.')
      return
    }
    setOrder(result)
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8">
        <p className="text-gold text-[10px] font-bold tracking-[0.2em] uppercase mb-2.5">
          <span className="opacity-40 mr-1.5">//</span>Theo dõi đơn hàng
        </p>
        <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl">
          Tra cứu đơn hàng
        </h1>
        <p className="text-white/40 text-sm mt-2">
          Nhập mã đơn hàng và số điện thoại đặt hàng để xem trạng thái.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Mã đơn hàng</span>
          <input
            type="text"
            required
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
            placeholder="VD: FBX-M1A2B3-C4D5"
            className="w-full h-11 bg-surface border border-border rounded-sm px-3.5 text-sm text-primary font-mono placeholder:text-faint focus:outline-none focus:border-gold/40 transition-colors"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Số điện thoại đặt hàng</span>
          <input
            type="tel"
            required
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="0901 234 567"
            className="w-full h-11 bg-surface border border-border rounded-sm px-3.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:border-gold/40 transition-colors"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="h-11 rounded-sm bg-gold text-[#07070C] font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Search size={15} />
          {loading ? 'Đang tìm…' : 'Tra cứu'}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2.5 bg-error/10 border border-error/20 rounded-sm px-4 py-3 text-sm text-error mb-8">
          <AlertTriangle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {order && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono font-bold text-primary text-sm tracking-wider truncate">{order.id}</span>
              <CopyButton text={order.id} />
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="flex flex-col divide-y divide-border">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="relative w-11 h-11 rounded-sm overflow-hidden bg-[#0F1729] shrink-0">
                  <Image src={item.image_url || '/products/p1.jpg'} alt={item.product_name}
                    fill className="object-cover" sizes="44px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary line-clamp-1 leading-snug">{item.product_name}</p>
                  <p className="text-xs text-muted mt-0.5">
                    x{item.quantity}
                    {item.variant_label && <span className="text-gold"> · {item.variant_label}</span>}
                  </p>
                </div>
                <p className="text-sm font-semibold text-primary shrink-0">
                  {formatVND(item.unit_price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-border bg-bg/40 flex-wrap">
            <div className="flex flex-col gap-0.5">
              <PaymentBadge status={order.payment_status} />
              <p className="text-[11px] text-faint">
                {new Date(order.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              {order.discount > 0 && (
                <p className="text-[11px] text-success">Đã giảm {formatVND(order.discount)}{order.coupon_code ? ` (${order.coupon_code})` : ''}</p>
              )}
              <p className="font-extrabold text-gold text-base">{formatVND(order.total)}</p>
            </div>
          </div>
        </div>
      )}

      {!order && !error && searched === false && (
        <div className="py-16 text-center border border-border rounded-xl">
          <Package size={28} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/25 text-sm">Kết quả tra cứu sẽ hiện tại đây</p>
        </div>
      )}
    </div>
  )
}
