import { Suspense } from 'react'
import type { Metadata } from 'next'
import { DUMMY_PRODUCTS } from '@/lib/data/products'
import ProductGrid from '@/components/shop/ProductGrid'
import FilterTabs from '@/components/shop/FilterTabs'
import SaleBanner from '@/components/shop/SaleBanner'
import type { Product } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Shop — figbox.store | Custom 1:64 MiniGT Diecast Boxes',
  description: 'Browse premium custom boxes for MiniGT 1:64 diecast cars. 350gsm matte print, laser-cut, hand-folded. Nationwide delivery in Vietnam.',
  alternates: { canonical: '/shop' },
  openGraph: {
    title: 'Shop — figbox.store',
    description: 'Premium custom packaging for MiniGT 1:64 diecast collectors.',
    url: '/shop',
  },
}

function filterProducts(products: Product[], type: string, brand: string): Product[] {
  let result = products
  if (type === 'sale') {
    result = result.filter(p => {
      const promo = p.promotion
      return promo && ['sale', 'flash_sale'].includes(promo.type) && new Date(promo.ends_at) > new Date()
    })
  } else if (type === 'pre_order') {
    result = result.filter(p => p.status === 'pre_order')
  } else if (type) {
    result = result.filter(p => p.type === type)
  }
  if (brand) result = result.filter(p => p.brand === brand)
  return result
}

function sortProducts(products: Product[], sort: string): Product[] {
  if (sort === 'price_asc') return [...products].sort((a, b) => a.price - b.price)
  if (sort === 'price_desc') return [...products].sort((a, b) => b.price - a.price)
  return products
}

const TAB_LABELS: Record<string, string> = {
  '': 'All Products',
  'box_custom': 'Box Custom',
  'water_decal': 'Water Decal',
  'accessory_3d': '3D Accessories',
  'pre_order': 'Pre-order',
  'sale': 'On Sale',
}

interface PageProps {
  searchParams: Promise<{ type?: string; brand?: string; sort?: string }>
}

export default async function ShopPage({ searchParams }: PageProps) {
  const { type = '', brand = '', sort = '' } = await searchParams
  const filtered = filterProducts(DUMMY_PRODUCTS, type, brand)
  const products = sortProducts(filtered, sort)

  const hasFlashSale = DUMMY_PRODUCTS.some(p =>
    p.promotion?.type === 'flash_sale' && new Date(p.promotion.ends_at) > new Date()
  )

  const heading = TAB_LABELS[type] ?? 'Shop'

  return (
    <>
      {hasFlashSale && (
        <SaleBanner message="Flash Sale — Up to 30% off select boxes. Limited time only!" />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <h1 className="font-jakarta font-extrabold text-primary text-2xl sm:text-3xl">{heading}</h1>
            <p className="text-muted text-sm mt-0.5">
              {products.length} {products.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <Suspense>
            <SortSelect current={sort} type={type} brand={brand} />
          </Suspense>
        </div>

        {/* ── Filters ── */}
        <div className="mb-7">
          <Suspense>
            <FilterTabs />
          </Suspense>
        </div>

        {/* ── Grid ── */}
        <ProductGrid products={products} />
      </div>
    </>
  )
}

function SortSelect({ current, type, brand }: { current: string; type: string; brand: string }) {
  return (
    <form method="GET" action="/shop" className="flex items-center gap-2">
      {type && <input type="hidden" name="type" value={type} />}
      {brand && <input type="hidden" name="brand" value={brand} />}
      <label htmlFor="sort" className="text-muted text-xs whitespace-nowrap">Sort by</label>
      <select
        id="sort"
        name="sort"
        defaultValue={current}
        className="text-sm border border-border rounded-sm bg-surface text-primary px-3 py-1.5 focus:outline-none focus:border-gold/50 cursor-pointer"
        // Native submit on change via js
        onChange={undefined}
      >
        <option value="">Default</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
      <button type="submit" className="text-xs bg-surface border border-border text-muted hover:text-primary hover:border-gold/40 px-3 py-1.5 rounded-sm transition-colors">
        Go
      </button>
    </form>
  )
}
