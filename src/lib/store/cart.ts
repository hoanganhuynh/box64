'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product, ProductVariant } from '@/lib/types'
import { getDiscountedPrice } from '@/lib/data/products'

export interface FlyEvent {
  id: number
  imgSrc: string
  startRect: { top: number; left: number; width: number; height: number }
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, qty?: number, variant?: ProductVariant) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  totalItems: () => number
  subtotal: () => number
  flyEvent: FlyEvent | null
  triggerFly: (imgSrc: string, startRect: FlyEvent['startRect']) => void
  clearFly: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1, variant) => {
        // A product with variants gets one cart line per variant — so a
        // customer can order both the custom and zin version of the same box.
        const lineKey = variant ? `${product.id}::${variant.key}` : product.id
        const existing = get().items.find(i =>
          (variant ? `${i.product_id}::${i.variant_key}` : i.product_id) === lineKey
        )
        if (existing) {
          set(s => ({
            items: s.items.map(i =>
              i.id === existing.id
                ? { ...i, quantity: Math.min(i.quantity + qty, 99) }
                : i
            ),
          }))
        } else {
          const item: CartItem = {
            id: `${lineKey}-${Date.now()}`,
            product_id: product.id,
            product_name: product.name,
            unit_price: variant ? variant.price : getDiscountedPrice(product),
            quantity: qty,
            image_url: product.images[0] ?? '',
            material: product.material,
            brand: product.brand,
            variant_key: variant?.key,
            variant_label: variant?.label,
          }
          set(s => ({ items: [...s.items, item] }))
        }
      },

      removeItem: (id) =>
        set(s => ({ items: s.items.filter(i => i.id !== id) })),

      updateQty: (id, qty) => {
        if (qty < 1) { get().removeItem(id); return }
        set(s => ({
          items: s.items.map(i => i.id === id ? { ...i, quantity: Math.min(qty, 99) } : i),
        }))
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0),

      flyEvent: null,
      triggerFly: (imgSrc, startRect) =>
        set({ flyEvent: { id: Date.now(), imgSrc, startRect } }),
      clearFly: () => set({ flyEvent: null }),
    }),
    { name: 'box64-cart', partialize: (s) => ({ items: s.items }) }
  )
)
