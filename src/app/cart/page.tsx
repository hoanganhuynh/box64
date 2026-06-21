'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Trash2, ArrowRight, ShoppingBag, Truck } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { formatVND } from '@/lib/utils/format'

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal, totalItems } = useCartStore()
  const total = subtotal()
  const count = totalItems()

  if (count === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center">
          <ShoppingBag size={32} className="text-faint" />
        </div>
        <div>
          <h1 className="font-jakarta font-extrabold text-primary text-2xl mb-2">Your cart is empty</h1>
          <p className="text-muted text-sm">Browse our collection and add something you like.</p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 h-11 px-7 rounded-sm bg-gold text-[#07070C] font-semibold text-sm hover:bg-gold/90 transition-colors"
        >
          <ShoppingCart size={15} /> Browse Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="flex items-baseline gap-3 mb-8">
        <h1 className="font-jakarta font-extrabold text-primary text-2xl sm:text-3xl">Shopping Cart</h1>
        <span className="text-muted text-sm">{count} {count === 1 ? 'item' : 'items'}</span>
      </div>

      {/* Freeship progress */}
      <FreeshipBanner subtotal={total} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Items list (2/3) ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {items.map(item => (
            <article
              key={item.id}
              className="flex gap-4 bg-surface border border-border rounded-sm p-4 group"
            >
              {/* Thumbnail */}
              <Link href="#" className="relative shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-sm overflow-hidden bg-[#0F1729]">
                <Image src={item.image_url || '/products/p1.jpg'} alt={item.product_name} fill className="object-cover" sizes="128px" />
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-primary text-base leading-snug line-clamp-2 mb-1">
                  {item.product_name}
                </p>
                <p className="text-xs text-muted mb-3">{formatVND(item.unit_price)} / item</p>

                {/* Qty stepper + remove */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-sm overflow-hidden bg-bg">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-11 h-11 flex items-center justify-center text-muted hover:text-primary hover:bg-surface transition-colors text-base"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-primary">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-11 h-11 flex items-center justify-center text-muted hover:text-primary hover:bg-surface transition-colors text-base"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex items-center gap-1 text-xs text-faint hover:text-error transition-colors"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>

              {/* Line total */}
              <div className="shrink-0 text-right">
                <p className="font-bold text-primary text-sm">{formatVND(item.unit_price * item.quantity)}</p>
              </div>
            </article>
          ))}

          {/* Continue shopping */}
          <Link href="/shop" className="text-xs text-muted hover:text-primary transition-colors w-fit inline-flex items-center gap-1">
            ← Continue shopping
          </Link>
        </div>

        {/* ── Order summary (1/3) ── */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-border rounded-sm p-6 sticky top-24">
            <h2 className="font-jakarta font-bold text-primary text-base mb-5">Order Summary</h2>

            <div className="flex flex-col gap-3 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal ({count} items)</span>
                <span className="font-semibold text-primary">{formatVND(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span className="text-muted text-xs italic">Calculated at checkout</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold text-primary">Total</span>
                <span className="font-extrabold text-primary text-base">{formatVND(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full h-12 rounded-sm bg-gold text-white font-semibold text-sm hover:bg-gold-mid transition-colors"
            >
              Proceed to Checkout <ArrowRight size={15} />
            </Link>

            <p className="text-[10px] text-faint text-center mt-3">
              Secure checkout — VNPay · MoMo · PayPal
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const FREESHIP_THRESHOLD = 500000

function FreeshipBanner({ subtotal }: { subtotal: number }) {
  const remaining = FREESHIP_THRESHOLD - subtotal
  const pct = Math.min(100, Math.round((subtotal / FREESHIP_THRESHOLD) * 100))
  const qualified = remaining <= 0

  return (
    <div className="mb-6 rounded-sm border border-border bg-surface px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <Truck size={14} className={qualified ? 'text-success' : 'text-muted'} />
        <p className="text-xs font-medium text-primary">
          {qualified
            ? 'You qualify for free nationwide shipping!'
            : <>Add <span className="text-gold font-bold">{formatVND(remaining)}</span> more for free nationwide shipping</>
          }
        </p>
      </div>
      <div className="h-1.5 rounded-full bg-bg overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${qualified ? 'bg-success' : 'bg-gold'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
