'use client'
import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import type { Product } from '@/lib/types'
import { useCartStore } from '@/lib/store/cart'

interface Props { product: Product }

export default function AddToCartButton({ product }: Props) {
  const addItem = useCartStore(s => s.addItem)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const isOutOfStock = product.stock === 0 && product.status !== 'pre_order'

  const handleAdd = () => {
    if (isOutOfStock) return
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Qty + button row */}
      <div className="flex items-center gap-3">
        {/* Quantity stepper */}
        <div className="flex items-center border border-border rounded-sm overflow-hidden bg-surface">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-11 h-11 flex items-center justify-center text-muted hover:bg-bg hover:text-primary transition-colors text-lg font-light"
            disabled={qty <= 1}
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-semibold text-primary">{qty}</span>
          <button
            onClick={() => setQty(q => Math.min(99, q + 1))}
            className="w-11 h-11 flex items-center justify-center text-muted hover:bg-bg hover:text-primary transition-colors text-lg font-light"
            disabled={qty >= 99}
          >
            +
          </button>
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`flex-1 h-11 flex items-center justify-center gap-2 rounded-sm font-semibold text-sm transition-all
            ${isOutOfStock
              ? 'bg-bg text-faint cursor-not-allowed border border-border'
              : added
                ? 'bg-success text-white'
                : 'bg-gold text-[#07070C] hover:opacity-90 active:scale-[0.98]'
            }`}
        >
          {added ? (
            <><Check size={15} /> Added to cart</>
          ) : isOutOfStock ? (
            'Out of stock'
          ) : product.status === 'pre_order' ? (
            <><ShoppingCart size={15} /> Pre-order Now</>
          ) : (
            <><ShoppingCart size={15} /> Add to Cart</>
          )}
        </button>
      </div>
    </div>
  )
}
