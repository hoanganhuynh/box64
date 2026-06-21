'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, Package, ArrowRight, Copy } from 'lucide-react'
import { formatVND } from '@/lib/utils/format'
import type { CartItem } from '@/lib/types'

interface LastOrder {
  orderId: string
  items: CartItem[]
}

function SuccessContent() {
  const params = useSearchParams()
  const orderId = params.get('order') ?? '—'
  const [copied, setCopied] = useState(false)
  const [order, setOrder] = useState<LastOrder | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('lastOrder')
    if (raw) {
      try { setOrder(JSON.parse(raw)) } catch {}
    }
  }, [])

  function copyId() {
    navigator.clipboard.writeText(orderId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const total = order?.items.reduce((s, i) => s + i.unit_price * i.quantity, 0) ?? 0

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 flex flex-col items-center text-center gap-6">

      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
        <CheckCircle2 size={36} className="text-gold" />
      </div>

      {/* Heading */}
      <div>
        <p className="text-gold text-[10px] font-bold tracking-[0.22em] uppercase mb-2">
          <span className="opacity-40 mr-1.5">//</span>Đặt hàng thành công
        </p>
        <h1 className="font-jakarta font-extrabold text-primary text-2xl sm:text-3xl leading-tight">
          Cảm ơn bạn đã đặt hàng!
        </h1>
        <p className="text-sm text-muted mt-2">
          Chi tiết đơn hàng đã được gửi đến email của bạn.
        </p>
      </div>

      {/* Order ID */}
      <div className="w-full bg-surface border border-border rounded-xl px-5 py-4">
        <p className="text-[11px] text-muted uppercase tracking-widest font-bold mb-2">Mã đơn hàng</p>
        <div className="flex items-center justify-center gap-2">
          <span className="font-mono font-bold text-primary text-lg tracking-wider">{orderId}</span>
          <button
            onClick={copyId}
            className="text-muted hover:text-gold transition-colors"
            aria-label="Copy order ID"
          >
            {copied ? <CheckCircle2 size={14} className="text-gold" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Items list */}
      {order && order.items.length > 0 && (
        <div className="w-full bg-surface border border-border rounded-xl px-5 py-4 text-left">
          <p className="text-[11px] text-muted uppercase tracking-widest font-bold mb-3">
            Sản phẩm đã đặt
          </p>
          <div className="flex flex-col divide-y divide-border">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="relative w-12 h-12 rounded-sm overflow-hidden bg-[#0F1729] shrink-0">
                  <Image
                    src={item.image_url || '/products/p1.jpg'}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary line-clamp-2 leading-snug">
                    {item.product_name}
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">x{item.quantity} · {formatVND(item.unit_price)}</p>
                </div>
                <p className="text-sm font-semibold text-primary shrink-0">
                  {formatVND(item.unit_price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
            <span className="text-sm font-bold text-primary">Tổng cộng</span>
            <span className="text-base font-extrabold text-gold">{formatVND(total)}</span>
          </div>
        </div>
      )}

      {/* Support via Facebook */}
      <div className="w-full bg-surface border border-border rounded-xl px-5 py-4 text-left">
        <p className="text-[11px] text-muted uppercase tracking-widest font-bold mb-3">Hỗ trợ</p>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-primary font-medium">Liên hệ qua Facebook</p>
            <p className="text-[11px] text-muted">Phản hồi trong vòng 1–2 giờ trong giờ hành chính</p>
          </div>
          <a
            href="https://www.facebook.com/figbox.gr"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 h-8 px-3 rounded-lg bg-[#1877F2] text-white text-xs font-semibold flex items-center hover:bg-[#1877F2]/90 transition-colors"
          >
            Nhắn tin
          </a>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Link
          href="/orders"
          className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg border border-border text-sm font-semibold text-primary hover:border-gold/40 hover:text-gold transition-colors"
        >
          <Package size={15} /> Đơn hàng của tôi
        </Link>
        <Link
          href="/shop"
          className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg bg-gold text-[#07070C] text-sm font-bold hover:bg-gold/90 transition-colors"
        >
          Tiếp tục mua sắm <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
