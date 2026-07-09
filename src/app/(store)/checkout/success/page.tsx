'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, Package, ArrowRight, Copy, Check, Loader2 } from 'lucide-react'
import { formatVND } from '@/lib/utils/format'
import { useCartStore } from '@/lib/store/cart'
import { getPendingSpinCount } from '@/app/actions/gamification'
import type { CartItem } from '@/lib/types'

interface LastOrder {
  orderId: string
  items: CartItem[]
  shippingFee?: number
  amount?: number
  paymentMethod?: string
  customerName?: string
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} aria-label="Copy" className="text-muted hover:text-gold transition-colors shrink-0">
      {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
    </button>
  )
}

type PaymentStatus = 'checking' | 'paid' | 'pending'

// The spin is granted by a DB trigger the moment the order flips to paid —
// poll a few times so the CTA appears as soon as the IPN lands.
function SpinCta() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    let attempts = 0
    async function poll() {
      attempts += 1
      try {
        const c = await getPendingSpinCount()
        if (cancelled) return
        if (c > 0) { setCount(c); return }
      } catch {}
      if (!cancelled && attempts < 6) setTimeout(poll, 3000)
    }
    poll()
    return () => { cancelled = true }
  }, [])

  if (count === 0) return null
  return (
    <Link href="/spin" className="w-full flex items-center justify-between gap-3 rounded-xl border border-gold/30 bg-gold/5 px-5 py-4 hover:bg-gold/10 transition-colors">
      <p className="text-sm font-bold text-gold text-left">🎡 Bạn có {count} lượt quay may mắn!</p>
      <span className="text-xs font-semibold text-gold shrink-0">Quay ngay →</span>
    </Link>
  )
}

// SePay already showed the VietQR and captured the payment on its own
// hosted checkout page before redirecting here — we just poll our own
// order record (updated by SePay's IPN webhook) to confirm and reflect it.
function PaymentStatusCard({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<PaymentStatus>('checking')
  const attemptsRef = useRef(0)

  useEffect(() => {
    let cancelled = false
    async function poll() {
      attemptsRef.current += 1
      try {
        const res = await fetch(`/api/orders/${orderId}/status`)
        if (res.ok) {
          const data = await res.json() as { payment_status: string }
          if (data.payment_status === 'paid') {
            if (!cancelled) setStatus('paid')
            return
          }
        }
      } catch {}
      if (attemptsRef.current >= 8) {
        if (!cancelled) setStatus('pending')
        return
      }
      if (!cancelled) setTimeout(poll, 2000)
    }
    poll()
    return () => { cancelled = true }
  }, [orderId])

  return (
    <div className="w-full bg-surface border border-white/10 rounded-xl px-5 py-4 flex items-center gap-3">
      {status === 'checking' && (
        <>
          <Loader2 size={18} className="text-gold animate-spin shrink-0" />
          <div className="text-left">
            <p className="text-sm font-semibold text-primary">Đang xác nhận thanh toán…</p>
            <p className="text-[11px] text-muted mt-0.5">Thường mất vài giây sau khi chuyển khoản</p>
          </div>
        </>
      )}
      {status === 'paid' && (
        <>
          <CheckCircle2 size={18} className="text-success shrink-0" />
          <div className="text-left">
            <p className="text-sm font-semibold text-success">Đã xác nhận thanh toán</p>
            <p className="text-[11px] text-muted mt-0.5">Đơn hàng của bạn đang được xử lý</p>
          </div>
        </>
      )}
      {status === 'pending' && (
        <>
          <Loader2 size={18} className="text-gold shrink-0" />
          <div className="text-left">
            <p className="text-sm font-semibold text-primary">Đang chờ xác nhận</p>
            <p className="text-[11px] text-muted mt-0.5">Nếu bạn đã chuyển khoản, đơn sẽ tự cập nhật trong ít phút</p>
          </div>
        </>
      )}
    </div>
  )
}

function SuccessContent() {
  const params = useSearchParams()
  const orderId = params.get('order') ?? '—'
  const [order, setOrder] = useState<LastOrder | null>(null)
  const removeItems = useCartStore(s => s.removeItems)

  useEffect(() => {
    const raw = sessionStorage.getItem('lastOrder')
    if (raw) {
      try {
        const parsed: LastOrder = JSON.parse(raw)
        setOrder(parsed)
        // Reaching this page means SePay confirmed (or is confirming) the
        // payment — safe to remove the ordered items here rather than before
        // redirecting. Only the items that were actually ordered are removed;
        // anything left unselected on the cart page stays in the cart.
        removeItems(parsed.items.map(i => i.id))
      } catch {}
    }
  }, [removeItems])

  const subtotal = order?.items.reduce((s, i) => s + i.unit_price * i.quantity, 0) ?? 0
  const shippingFee = order?.shippingFee ?? 0
  const total = order?.amount ?? subtotal
  const isSepay = order?.paymentMethod === 'sepay'

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 flex flex-col items-center text-center gap-5">

      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-success flex items-center justify-center">
        <CheckCircle2 size={36} className="text-white" />
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

      {/* Payment status */}
      {isSepay && orderId !== '—' && <PaymentStatusCard orderId={orderId} />}

      {/* Lucky spin CTA — appears once the paid trigger grants the spin */}
      <SpinCta />

      {/* Order ID */}
      <div className="w-full bg-surface border border-border rounded-xl px-5 py-4">
        <p className="text-[11px] text-muted uppercase tracking-widest font-bold mb-2">Mã đơn hàng</p>
        <div className="flex items-center justify-center gap-2">
          <span className="font-mono font-bold text-primary text-lg tracking-wider">{orderId}</span>
          <CopyButton text={orderId} />
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
                  <Image src={item.image_url || '/products/p1.jpg'} alt={item.product_name}
                    fill className="object-cover" sizes="48px" />
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
          <div className="border-t border-border mt-3 pt-3 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted">Tạm tính</span>
              <span className="text-xs text-primary">{formatVND(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted">Phí vận chuyển</span>
              {shippingFee === 0
                ? <span className="text-xs text-success font-medium">Miễn phí</span>
                : <span className="text-xs text-primary">{formatVND(shippingFee)}</span>}
            </div>
            <div className="flex justify-between items-center border-t border-border pt-2 mt-1">
              <span className="text-sm font-bold text-primary">Tổng cộng</span>
              <span className="text-base font-extrabold text-gold">{formatVND(total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Support */}
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
          <a href="https://www.facebook.com/figbox.gr" target="_blank" rel="noopener noreferrer"
            className="shrink-0 h-8 px-3 rounded-lg bg-[#1877F2] text-white text-xs font-semibold flex items-center hover:bg-[#1877F2]/90 transition-colors">
            Nhắn tin
          </a>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Link href="/orders"
          className="flex-1 inline-flex min-h-[54px] items-center justify-center gap-2.5 rounded-lg border border-border bg-surface/70 px-5 py-3.5 text-base font-bold text-primary transition-all duration-200 hover:border-gold/40 hover:bg-surface hover:text-gold active:scale-[0.98]">
          <Package size={18} /> Đơn hàng của tôi
        </Link>
        <Link href="/shop"
          className="flex-1 inline-flex min-h-[54px] items-center justify-center gap-2.5 rounded-lg bg-gold px-5 py-3.5 text-base font-extrabold text-[#07070C] shadow-[0_14px_32px_rgba(245,158,11,0.18)] transition-all duration-200 hover:bg-gold-mid active:scale-[0.98]">
          Tiếp tục mua sắm <ArrowRight size={18} />
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
