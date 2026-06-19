'use client'

import { useState, useEffect, useRef } from 'react'
import type { Product } from '@/lib/types'
import { useCartStore } from '@/lib/store/cart'
import { formatVND } from '@/lib/utils/format'

interface Props {
  product: Product
  salePrice: number
}

export default function StickyCartBar({ product, salePrice }: Props) {
  const [visible, setVisible] = useState(false)
  const [added, setAdded] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const addItem = useCartStore(s => s.addItem)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const isOutOfStock = product.stock === 0 && product.status !== 'pre_order'

  const handleAdd = () => {
    if (isOutOfStock) return
    addItem(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      {/* Sentinel - must be placed directly after AddToCartButton in the parent */}
      <div ref={sentinelRef} aria-hidden="true" />

      {/* Sticky bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-[#07070C]/95 backdrop-blur-sm border-t border-border transition-transform duration-300 ease-out ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-white/40 text-[10px] truncate">{product.name}</p>
            <p className="text-white font-bold text-sm leading-tight">{formatVND(salePrice)}</p>
          </div>
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className="shrink-0 bg-gold text-[#07070C] text-xs font-bold px-5 py-2.5 rounded-sm uppercase tracking-wide transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {added
              ? 'Added!'
              : isOutOfStock
                ? 'Out of stock'
                : product.status === 'pre_order'
                  ? 'Pre-order'
                  : 'Add to Cart'}
          </button>
        </div>
      </div>
    </>
  )
}
