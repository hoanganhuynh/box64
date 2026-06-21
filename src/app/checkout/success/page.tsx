'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle2, Package, ArrowRight, Copy } from 'lucide-react'
import { useState } from 'react'

function SuccessContent() {
  const params = useSearchParams()
  const orderId = params.get('order') ?? '—'
  const [copied, setCopied] = useState(false)

  function copyId() {
    navigator.clipboard.writeText(orderId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
            {copied ? <CheckCircle2 size={14} className="text-success" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Payment instructions */}
      <div className="w-full bg-gold/5 border border-gold/15 rounded-xl px-5 py-4 text-left">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🏦</span>
          <p className="text-sm font-bold text-primary">Thông tin chuyển khoản</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Row label="Ngân hàng" value="Vietcombank" />
          <Row label="Số tài khoản" value="1234567890" />
          <Row label="Chủ tài khoản" value="NGUYEN VAN A" />
          <Row
            label="Nội dung CK"
            value={orderId}
            highlight
          />
        </div>
        <p className="text-[11px] text-muted mt-3 leading-relaxed">
          Vui lòng chuyển khoản trong vòng <span className="text-gold font-semibold">24 giờ</span>. Đơn hàng sẽ được xử lý sau khi chúng tôi xác nhận thanh toán.
        </p>
      </div>

      {/* What's next */}
      <div className="w-full bg-surface border border-border rounded-xl px-5 py-4 text-left">
        <p className="text-[11px] text-muted uppercase tracking-widest font-bold mb-3">Tiếp theo</p>
        <div className="flex flex-col gap-3">
          {[
            { icon: '💳', text: 'Chuyển khoản theo thông tin trên' },
            { icon: '📦', text: 'Shop xác nhận và bắt đầu in hộp' },
            { icon: '🚚', text: 'Giao hàng toàn quốc 3–5 ngày làm việc' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-muted">
              <span className="text-base shrink-0">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Link
          href={`/orders`}
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

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted text-xs shrink-0">{label}</span>
      <span className={`font-mono font-semibold text-xs text-right ${highlight ? 'text-gold' : 'text-primary'}`}>
        {value}
      </span>
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
