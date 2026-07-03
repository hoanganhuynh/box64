import type { CartItem } from '@/lib/types'
import type { FlashItemRow } from './flash'

export interface FlashClaim {
  index: number      // position in the items array
  itemId: string     // flash_sale_items.id to claim against
  qty: number
  salePrice: number
}

// Pure: which cart lines need a flash-stock claim. Variant lines are skipped —
// flash prices apply to the base product price only.
export function flashClaimPlan(items: CartItem[], flash: Map<string, FlashItemRow>): FlashClaim[] {
  const plan: FlashClaim[] = []
  items.forEach((item, index) => {
    if ((item as { variant_label?: string }).variant_label) return
    const fp = flash.get(item.product_id)
    if (!fp) return
    plan.push({ index, itemId: fp.id, qty: item.quantity, salePrice: fp.sale_price })
  })
  return plan
}
