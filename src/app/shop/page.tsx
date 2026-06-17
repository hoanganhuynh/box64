import { Suspense } from 'react'
import { DUMMY_PRODUCTS } from '@/lib/data/products'
import ProductGrid from '@/components/shop/ProductGrid'
import FilterTabs from '@/components/shop/FilterTabs'
import SaleBanner from '@/components/shop/SaleBanner'
import type { Product } from '@/lib/types'

function filterProducts(products: Product[], type: string): Product[] {
  if (!type) return products
  if (type === 'sale') {
    return products.filter(p => {
      const promo = p.promotion
      return promo && ['sale', 'flash_sale'].includes(promo.type) && new Date(promo.ends_at) > new Date()
    })
  }
  if (type === 'pre_order') return products.filter(p => p.status === 'pre_order')
  return products.filter(p => p.type === type)
}

interface PageProps {
  searchParams: Promise<{ type?: string }>
}

export default async function ShopPage({ searchParams }: PageProps) {
  const { type = '' } = await searchParams
  const products = filterProducts(DUMMY_PRODUCTS, type)

  const hasFlashSale = DUMMY_PRODUCTS.some(p =>
    p.promotion?.type === 'flash_sale' && new Date(p.promotion.ends_at) > new Date()
  )

  return (
    <>
      {hasFlashSale && (
        <SaleBanner message="Flash Sale — Up to 30% off select boxes. Limited time only!" />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-jakarta font-extrabold text-primary text-3xl mb-1">Shop</h1>
          <p className="text-muted text-sm">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
        </div>
        <div className="mb-6">
          <Suspense>
            <FilterTabs />
          </Suspense>
        </div>
        <ProductGrid products={products} />
      </div>
    </>
  )
}
