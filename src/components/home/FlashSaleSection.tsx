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
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Flash size={22} color="#FFF" variant="Bold" />
              <h2 id="flash-sale-heading" className="font-jakarta font-black text-white text-2xl sm:text-3xl uppercase tracking-tight">
                Flash Sale
              </h2>
            </div>
            <span className="hidden sm:block w-px h-7 bg-white/30" />
            <div className="hidden sm:flex items-center gap-3 text-white/85 text-sm font-medium">
              Ends in <FlashCountdown endDate={endDate} />
            </div>
          </div>
          <Link href="/shop?type=sale" className="flex items-center gap-1 text-white text-xs font-semibold hover:text-white/70 transition-colors">
            View all <ArrowRight2 size={14} color="currentColor" />
          </Link>
        </div>

        {/* Mobile countdown */}
        <div className="flex sm:hidden items-center gap-2 text-white/85 text-xs mb-6 font-medium">
          Ends in <FlashCountdown endDate={endDate} />
        </div>

        {/* ── 3 vertical product cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {products.slice(0, 3).map(p => {
            const salePrice = getDiscountedPrice(p)
            return (
              <Link
                key={p.id}
                href={`/shop/${p.slug}`}
                className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-200 ease-out"
              >
                {/* Large image */}
                <div className="relative aspect-square overflow-hidden bg-[#F5F0EA]">
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  {/* Big bold badge */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-white text-[#EA580C] font-black text-sm px-3 py-1.5 rounded-full shadow-md leading-none">
                      -{p.promotion!.discount_pct}%
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col p-4 gap-3 flex-1">
                  <p className="text-ink font-semibold text-sm leading-snug line-clamp-2 flex-1 group-hover:text-[#EA580C] transition-colors">
                    {p.name}
                  </p>
                  <div className="flex items-baseline gap-2 pt-2 border-t border-[#F0E8E0]">
                    <span className="font-black text-[#EA580C] text-lg leading-none">{formatVND(salePrice)}</span>
                    <span className="line-through text-[#B0A090] text-sm">{formatVND(p.price)}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[#EA580C] text-xs font-semibold">
                    Shop now <ArrowRight2 size={11} color="currentColor" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
