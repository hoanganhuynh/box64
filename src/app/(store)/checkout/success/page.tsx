'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, Package, ArrowRight, Copy, Check } from 'lucide-react'
import { formatVND } from '@/lib/utils/format'
import type { CartItem } from '@/lib/types'

interface BankSettings {
  bank_id: string
  account_number: string
  account_name: string
  qr_image_url: string | null
}

interface LastOrder {
  orderId: string
  items: CartItem[]
  shippingFee?: number
  amount?: number
  paymentMethod?: string
  customerName?: string
}

function toTransferDesc(customerName: string | undefined, orderId: string): string {
  const name = (customerName ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, m => m === 'đ' ? 'd' : 'D')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
  return name ? `${name} ${orderId}` : orderId
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

function VietQRSection({
  orderId, amount, customerName, settings,
}: {
  orderId: string
  amount: number
  customerName?: string
  settings: BankSettings | null
}) {
  const bankId = settings?.bank_id ?? ''
  const account = settings?.account_number ?? ''
  const accountName = settings?.account_name ?? ''
  const qrImageUrl = settings?.qr_image_url

  const transferDesc = toTransferDesc(customerName, orderId)
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${account}-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(transferDesc)}&accountName=${encodeURIComponent(accountName)}`

  return (
    <div className="w-full bg-surface border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <p className="text-[11px] text-gold uppercase tracking-widest font-bold mb-0.5">Thanh toán ngay</p>
        <p className="text-xs text-muted">Quét mã QR bằng app ngân hàng bất kỳ</p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center px-5 pb-4">
        <div className="rounded-xl overflow-hidden border border-white/10 bg-white p-2">
          {qrImageUrl ? (
            <Image src={qrImageUrl} alt="QR chuyển khoản" width={220} height={220} className="block" unoptimized />
          ) : account ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrUrl} alt="VietQR thanh toán" width={220} height={220} className="block" />
          ) : (
            <Image src="/QR-bank.png" alt="QR chuyển khoản" width={220} height={220} className="block" />
          )}
        </div>
      </div>

      {/* Bank details */}
      <div className="border-t border-border mx-5 pt-4 pb-5 flex flex-col gap-2.5 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted text-xs">Ngân hàng</span>
          <span className="font-semibold text-primary text-xs">{bankId}</span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-muted text-xs shrink-0">Số tài khoản</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-primary text-sm">{account}</span>
            <CopyButton text={account} />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted text-xs shrink-0">Chủ tài khoản</span>
          <span className="font-medium text-primary text-xs text-right">{accountName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted text-xs shrink-0">Số tiền</span>
          <span className="font-extrabold text-gold">{formatVND(amount)}</span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-muted text-xs shrink-0">Nội dung CK</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-primary text-sm">{transferDesc}</span>
            <CopyButton text={transferDesc} />
          </div>
        </div>
      </div>

      <div className="bg-gold/5 border-t border-white/10 px-5 py-3">
        <p className="text-[11px] text-muted text-center leading-relaxed">
          Đơn hàng được xử lý sau khi xác nhận chuyển khoản · thường trong 1–2 giờ
        </p>
      </div>
    </div>
  )
}

function SuccessContent() {
  const params = useSearchParams()
  const orderId = params.get('order') ?? '—'
  const [order, setOrder] = useState<LastOrder | null>(null)
  const [bankSettings, setBankSettings] = useState<BankSettings | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('lastOrder')
    if (raw) {
      try { setOrder(JSON.parse(raw)) } catch {}
    }
    fetch('/api/bank-settings').then(r => r.json()).then(setBankSettings).catch(() => {})
  }, [])

  const subtotal = order?.items.reduce((s, i) => s + i.unit_price * i.quantity, 0) ?? 0
  const shippingFee = order?.shippingFee ?? 0
  const total = order?.amount ?? subtotal
  const isVietQR = !order?.paymentMethod || order.paymentMethod === 'vietqr'

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
          {isVietQR
            ? 'Vui lòng chuyển khoản để xác nhận đơn hàng.'
            : 'Chi tiết đơn hàng đã được gửi đến email của bạn.'}
        </p>
      </div>

      {/* VietQR payment block */}
      {isVietQR && total > 0 && (
        <VietQRSection
          orderId={orderId}
          amount={total}
          customerName={order?.customerName}
          settings={bankSettings}
        />
      )}

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
