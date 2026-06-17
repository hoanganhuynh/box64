import type { Product } from '@/lib/types'
import ProductCard from './ProductCard'

interface Props {
  products: Product[]
  emptyMessage?: string
}

export default function ProductGrid({ products, emptyMessage = 'No products found.' }: Props) {
  if (products.length === 0) {
    return (
      <div className="py-24 text-center text-muted">
        {emptyMessage}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
