'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Package, ArrowRight, Copy, Check } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { getMyOrders, type MyOrder } from '@/app/actions/orders'
import { formatVND } from '@/lib/utils/format'
import { StatusBadge, PaymentBadge } from '@/components/shop/OrderStatusBadges'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
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

export default function OrdersPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [orders, setOrders] = useState<MyOrder[] | null>(null)

  useEffect(() => {
    setMounted(true)
    const supabase = createSupabaseClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace('/login?next=/orders')
        return
      }
      const list = await getMyOrders()
      setOrders(list)
    })
  }, [router])

  if (!mounted || orders === null) return null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8">
        <p className="text-gold text-[10px] font-bold tracking-[0.2em] uppercase mb-2.5">
          <span className="opacity-40 mr-1.5">//</span>Tài khoản
        </p>
        <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl">
          Đơn hàng của tôi
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="py-20 text-center border border-border rounded-xl">
          <Package size={32} className="text-white/15 mx-auto mb-4" />
          <p className="text-white/50 text-base font-semibold">Bạn chưa có đơn hàng nào</p>
          <p className="text-white/25 text-sm mt-2 mb-7">Khám phá các mẫu box và đặt hàng ngay</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 h-10 px-6 rounded-sm bg-gold text-[#07070C] font-bold text-sm hover:bg-gold-mid transition-colors"
          >
            Xem cửa hàng <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-surface border border-border rounded-xl overflow-hidden hover:border-gold/30 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono font-bold text-primary text-sm tracking-wider truncate">{order.id}</span>
                  <CopyButton text={order.id} />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={order.status} />
                </div>
              </div>

              {/* Items */}
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

              {/* Footer */}
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
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
