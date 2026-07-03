import { getFlashSales, getProductsForPicker } from './actions'
import { FlashSalesClient } from './FlashSalesClient'

export const dynamic = 'force-dynamic'

export default async function FlashSalesPage() {
  const [sales, products] = await Promise.all([getFlashSales(), getProductsForPicker()])
  return <FlashSalesClient initialSales={sales} products={products} />
}
