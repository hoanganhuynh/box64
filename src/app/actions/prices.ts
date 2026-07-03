'use server'
import { getCurrentPrices } from '@/lib/storefront/products'

// Re-syncs cart line prices against current admin-set prices whenever the
// customer revisits their cart/checkout — cart items store a unit_price
// snapshot from add-to-cart time, so this is how a later price edit in
// admin reaches items already sitting in someone's cart.
export async function getCartPrices(productIds: string[]): Promise<Record<string, number>> {
  return getCurrentPrices(productIds)
}
