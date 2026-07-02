'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ShoppingCart, Check } from 'lucide-react'
import type { Product, ProductVariant } from '@/lib/types'
import { useCartStore } from '@/lib/store/cart'
import { formatVND } from '@/lib/utils/format'

interface Props {
  product: Product
  salePrice: number
  variant?: ProductVariant
}

export default function StickyCartBar({ product, salePrice, variant }: Props) {
  const [visible, setVisible] = useState(false)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore(s => s.addItem)

  useEffect(() => {
    const el = document.querySelector('[data-atc-trigger]')
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const isOutOfStock = product.stock === 0 && product.status !== 'pre_order'
  const displayPrice = variant ? variant.price : salePrice

  const handleAdd = () => {
    if (isOutOfStock) return
    addItem(product, 1, variant)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      {/* Sticky bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-[#07070C]/95 backdrop-blur-sm border-t border-border transition-transform duration-150 ease-out ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          {/* Thumbnail */}
          <div className="shrink-0 w-12 h-12 rounded-sm overflow-hidden border border-white/10 bg-[#0C0C18]">
            <Image
              src={product.images[0]}
              alt={product.name}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Name + price */}
          <div className="flex-1 min-w-0">
            <p className="text-white/50 text-[11px] truncate leading-none mb-1">{product.name}</p>
            <p className="text-white font-bold text-base leading-none">{formatVND(displayPrice)}</p>
          </div>

          {/* CTA */}
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className="shrink-0 inline-flex items-center gap-2 bg-gold text-[#07070C] text-xs font-bold h-11 px-5 rounded-sm uppercase tracking-wide transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {added ? (
              <><Check size={14} strokeWidth={2.5} /> Added!</>
            ) : isOutOfStock ? 'Out of stock' : (
              <><ShoppingCart size={14} strokeWidth={2} /> {product.status === 'pre_order' ? 'Pre-order' : 'Add to Cart'}</>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
