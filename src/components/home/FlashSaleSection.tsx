import { Flash } from 'iconsax-react'
import { getFlashSaleProducts } from '@/lib/data/products'
import FlashCountdown from './FlashCountdown'
import ProductCard from '@/components/shop/ProductCard'

export default function FlashSaleSection() {
  const products = getFlashSaleProducts()
  if (products.length === 0) return null

  const endDate = products.reduce((min, p) => {
    const end = p.promotion!.ends_at
    return end < min ? end : min
  }, products[0].promotion!.ends_at)

  return (
    <section aria-labelledby="flash-sale-heading" className="relative overflow-hidden bg-gold-mid">

      {/* Diagonal livery stripes */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 2px, transparent 2px, transparent 16px)',
        }}
      />

      {/* Checkered flag corner */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 w-40 h-28 pointer-events-none"
        style={{
          backgroundImage: 'repeating-conic-gradient(rgba(0,0,0,0.11) 0% 25%, transparent 0% 50%)',
          backgroundSize: '10px 10px',
          maskImage: 'linear-gradient(to bottom-left, black 25%, transparent 75%)',
          WebkitMaskImage: 'linear-gradient(to bottom-left, black 25%, transparent 75%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Flash size={22} color="#FFF" variant="Bold" />
            <h2 id="flash-sale-heading" className="font-jakarta font-black text-white text-2xl sm:text-3xl uppercase tracking-tight">
              Flash Sale
            </h2>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-white/55 text-[10px] font-bold uppercase tracking-[0.2em]">Ends in</span>
            <FlashCountdown endDate={endDate} large />
          </div>
        </div>

        {/* Cards — reuse ProductCard for consistent hierarchy + Add to Cart */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {products.slice(0, 3).map(p => (
            <ProductCard key={p.id} product={p} variant="light" />
          ))}
        </div>
      </div>
    </section>
  )
}
