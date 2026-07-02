'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, Copy, Check } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { getMyOrder, type OrderDetail } from '@/app/actions/orders'
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
      {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
    </button>
  )
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [mounted, setMounted] = useState(false)
  const [order, setOrder] = useState<OrderDetail | null | undefined>(undefined)

  useEffect(() => {
    setMounted(true)
    const supabase = createSupabaseClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace(`/login?next=/orders/${params.id}`)
        return
      }
      const result = await getMyOrder(params.id)
      setOrder(result)
    })
  }, [router, params.id])

  if (!mounted || order === undefined) return null

  if (order === null) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-white/50 text-base font-semibold mb-2">Không tìm thấy đơn hàng</p>
        <p className="text-white/25 text-sm mb-7">Đơn hàng này không tồn tại hoặc không thuộc về tài khoản của bạn.</p>
        <Link href="/orders" className="text-gold hover:text-gold-mid text-sm font-semibold transition-colors">
          ← Về danh sách đơn hàng
        </Link>
      </div>
    )
  }

  const addressParts = [order.shipping.line1, order.shipping.ward, order.shipping.district, order.shipping.city].filter(Boolean)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <Link href="/orders" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-6">
        <ArrowLeft size={14} /> Đơn hàng của tôi
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono font-extrabold text-white text-xl tracking-wider">{order.id}</h1>
            <CopyButton text={order.id} />
          </div>
          <p className="text-white/40 text-sm mt-1.5">
            {new Date(order.created_at).toLocaleString('vi-VN', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={order.status} />
          <PaymentBadge status={order.payment_status} />
        </div>
      </div>

      {/* Shipping */}
      <div className="bg-surface border border-border rounded-xl px-5 py-4 mb-4">
        <p className="flex items-center gap-1.5 text-[11px] text-muted uppercase tracking-widest font-bold mb-3">
          <MapPin size={13} className="text-gold" /> Địa chỉ giao hàng
        </p>
        <p className="text-sm font-semibold text-primary">{order.shipping.name} · {order.shipping.phone}</p>
        <p className="text-sm text-muted mt-1">{addressParts.join(', ')}</p>
      </div>

      {/* Items */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden mb-4">
        <div className="px-5 py-3.5 border-b border-border">
          <p className="text-[11px] text-muted uppercase tracking-widest font-bold">Sản phẩm</p>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <div className="relative w-14 h-14 rounded-sm overflow-hidden bg-[#0F1729] shrink-0">
                <Image src={item.image_url || '/products/p1.jpg'} alt={item.product_name}
                  fill className="object-cover" sizes="56px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary leading-snug">{item.product_name}</p>
                <p className="text-xs text-muted mt-0.5">
                  x{item.quantity} · {formatVND(item.unit_price)}
                  {item.variant_label && <span className="text-gold"> · {item.variant_label}</span>}
                </p>
              </div>
              <p className="text-sm font-semibold text-primary shrink-0">
                {formatVND(item.unit_price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-border px-5 py-4 flex flex-col gap-2 text-sm bg-bg/40">
          <div className="flex justify-between">
            <span className="text-muted">Tạm tính</span>
            <span className="text-primary">{formatVND(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted">Giảm giá{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
              <span className="text-success">-{formatVND(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2 mt-1">
            <span className="font-bold text-primary">Tổng cộng</span>
            <span className="font-extrabold text-gold text-base">{formatVND(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Note */}
      {order.note && (
        <div className="bg-surface border border-border rounded-xl px-5 py-4">
          <p className="text-[11px] text-muted uppercase tracking-widest font-bold mb-2">Ghi chú</p>
          <p className="text-sm text-muted leading-relaxed">{order.note}</p>
        </div>
      )}
    </div>
  )
}
