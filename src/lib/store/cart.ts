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
  // Tracks items the customer unchecked on the cart page — absence from this
  // list means selected, so new/existing items are selected by default with
  // no extra bookkeeping on add.
  deselectedIds: string[]
  addItem: (product: Product, qty?: number, variant?: ProductVariant) => void
  removeItem: (id: string) => void
  removeItems: (ids: string[]) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  toggleSelected: (id: string) => void
  selectAll: () => void
  deselectAll: () => void
  syncPrices: (priceById: Record<string, number>) => Array<{ id: string; from: number; to: number }>
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
      deselectedIds: [],

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
            car_make: product.car_make,
            color: product.color,
            manufacturer: product.manufacturer,
            product_type: product.type,
            variant_key: variant?.key,
            variant_label: variant?.label,
          }
          set(s => ({ items: [...s.items, item] }))
        }
      },

      removeItem: (id) =>
        set(s => ({
          items: s.items.filter(i => i.id !== id),
          deselectedIds: s.deselectedIds.filter(d => d !== id),
        })),

      removeItems: (ids) =>
        set(s => ({
          items: s.items.filter(i => !ids.includes(i.id)),
          deselectedIds: s.deselectedIds.filter(d => !ids.includes(d)),
        })),

      updateQty: (id, qty) => {
        if (qty < 1) { get().removeItem(id); return }
        set(s => ({
          items: s.items.map(i => i.id === id ? { ...i, quantity: Math.min(qty, 99) } : i),
        }))
      },

      clearCart: () => set({ items: [], deselectedIds: [] }),

      toggleSelected: (id) =>
        set(s => ({
          deselectedIds: s.deselectedIds.includes(id)
            ? s.deselectedIds.filter(d => d !== id)
            : [...s.deselectedIds, id],
        })),

      selectAll: () => set({ deselectedIds: [] }),

      deselectAll: () => set(s => ({ deselectedIds: s.items.map(i => i.id) })),

      // Re-syncs base-product cart lines against current admin-set prices —
      // called on cart/checkout mount, since unit_price is otherwise a
      // snapshot from add-to-cart time. Variant-priced lines are skipped:
      // variant.price is its own fixed quote, not the product's base price.
      syncPrices: (priceById) => {
        const changed: Array<{ id: string; from: number; to: number }> = []
        set(s => ({
          items: s.items.map(i => {
            if (i.variant_key) return i
            const next = priceById[i.product_id]
            if (next == null || next === i.unit_price) return i
            changed.push({ id: i.id, from: i.unit_price, to: next })
            return { ...i, unit_price: next }
          }),
        }))
        return changed
      },

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0),

      flyEvent: null,
      triggerFly: (imgSrc, startRect) =>
        set({ flyEvent: { id: Date.now(), imgSrc, startRect } }),
      clearFly: () => set({ flyEvent: null }),
    }),
    { name: 'box64-cart', partialize: (s) => ({ items: s.items, deselectedIds: s.deselectedIds }) }
  )
)
