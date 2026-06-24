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
    <section aria-labelledby="flash-sale-heading" className="relative bg-gold-mid">

      {/* Decorative backgrounds — clipped inside this wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 2px, transparent 2px, transparent 16px)',
          }}
        />
        <div
          className="absolute top-0 right-0 w-40 h-28"
          style={{
            backgroundImage: 'repeating-conic-gradient(rgba(0,0,0,0.11) 0% 25%, transparent 0% 50%)',
            backgroundSize: '10px 10px',
            maskImage: 'linear-gradient(to bottom-left, black 25%, transparent 75%)',
            WebkitMaskImage: 'linear-gradient(to bottom-left, black 25%, transparent 75%)',
          }}
        />
      </div>

      {/* Header */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <div className="flex items-center justify-between gap-4">
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
      </div>

      {/* Mobile/tablet: carousel swipe */}
      <div className="relative pb-8 lg:hidden">
        <div className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none [-webkit-overflow-scrolling:touch] pl-5 sm:pl-6 [scroll-padding-left:1.25rem] sm:[scroll-padding-left:1.5rem]">
          {products.map(p => (
            <div key={p.id} className="snap-start shrink-0 w-[75%] sm:w-[44%]">
              <ProductCard product={p} variant="light" />
            </div>
          ))}
          <div className="shrink-0 w-4 sm:w-6" aria-hidden="true" />
        </div>
      </div>

      {/* Desktop: 3-col grid, equal-height cards */}
      <div className="hidden lg:block relative max-w-7xl mx-auto px-6 pb-10">
        <div className="grid grid-cols-3 gap-5 items-stretch">
          {products.slice(0, 3).map(p => (
            <div key={p.id} className="flex flex-col">
              <ProductCard product={p} variant="light" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
