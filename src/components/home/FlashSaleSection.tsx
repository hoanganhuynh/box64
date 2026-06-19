import Link from 'next/link'
import Image from 'next/image'
import { Flash, ArrowRight2 } from 'iconsax-react'
import { getFlashSaleProducts, getDiscountedPrice } from '@/lib/data/products'
import { formatVND } from '@/lib/utils/format'
import FlashCountdown from './FlashCountdown'

export default function FlashSaleSection() {
  const products = getFlashSaleProducts()
  if (products.length === 0) return null

  const endDate = products.reduce((min, p) => {
    const end = p.promotion!.ends_at
    return end < min ? end : min
  }, products[0].promotion!.ends_at)

  return (
    <section aria-labelledby="flash-sale-heading" className="bg-gold-mid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Flash size={24} color="#FFF" variant="Bold" />
              <h2 id="flash-sale-heading" className="font-jakarta font-black text-white text-2xl sm:text-3xl uppercase tracking-tight">
                Flash Sale
              </h2>
            </div>
            <span className="hidden sm:block w-px h-7 bg-white/30" />
            <div className="hidden sm:flex items-center gap-3 text-white/80 text-sm font-medium">
              Kết thúc sau <FlashCountdown endDate={endDate} />
            </div>
          </div>
          <Link href="/shop?type=sale" className="flex items-center gap-1 text-white text-xs font-semibold hover:text-white/70 transition-colors">
            Xem tất cả <ArrowRight2 size={14} color="currentColor" />
          </Link>
        </div>

        {/* Mobile countdown */}
        <div className="flex sm:hidden items-center gap-2 text-white/80 text-xs mb-5 font-medium">
          Kết thúc sau <FlashCountdown endDate={endDate} />
        </div>

        {/* ── Product cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.slice(0, 3).map(p => {
            const salePrice = getDiscountedPrice(p)
            return (
              <Link
                key={p.id}
                href={`/shop/${p.slug}`}
                className="group flex bg-white/15 border border-white/20 hover:bg-white/25 rounded-sm overflow-hidden transition-all"
              >
                <div className="relative w-28 sm:w-32 shrink-0 bg-black/20">
                  <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="33vw" />
                  <span className="absolute top-2 left-2 bg-white text-[#EA580C] text-[9px] font-black px-1.5 py-0.5 rounded-sm tracking-wider">
                    -{p.promotion!.discount_pct}%
                  </span>
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                  <p className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-white/80 transition-colors">
                    {p.name}
                  </p>
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="font-black text-white text-base">{formatVND(salePrice)}</span>
                    <span className="line-through text-white/50 text-xs">{formatVND(p.price)}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
