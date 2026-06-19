import Link from 'next/link'
import Image from 'next/image'
import { Flash, ArrowRight2 } from 'iconsax-react'
import { getFlashSaleProducts, getDiscountedPrice } from '@/lib/data/products'
import { formatVND } from '@/lib/utils/format'
import FlashCountdown from './FlashCountdown'

function formatReleaseDate(d: string) {
  const [y, m] = d.split('-')
  return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m - 1]} ${y}`
}

export default function FlashSaleSection() {
  const products = getFlashSaleProducts()
  if (products.length === 0) return null

  const endDate = products.reduce((min, p) => {
    const end = p.promotion!.ends_at
    return end < min ? end : min
  }, products[0].promotion!.ends_at)

  return (
    <section aria-labelledby="flash-sale-heading" className="relative overflow-hidden bg-gold-mid">

      {/* ── Diagonal livery stripes ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 2px, transparent 2px, transparent 16px)',
        }}
      />

      {/* ── Checkered flag corner — top right ── */}
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
        {/* ── Header ── */}
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
                <div className="flex flex-col p-4 gap-2.5 flex-1">
                  <p className="text-ink font-semibold text-sm leading-snug line-clamp-2 flex-1 group-hover:text-[#EA580C] transition-colors">
                    {p.name}
                  </p>

                  {/* Meta row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* MiniGT logo badge */}
                    <span className="inline-flex items-center h-[18px] px-1.5 rounded bg-[#0f0f0f] text-white font-extrabold leading-none" style={{ fontSize: '9px', letterSpacing: '0.01em' }}>
                      Mi<span style={{ color: '#e8002d' }}>N</span>i<span style={{ color: '#e8002d' }}>GT</span>
                    </span>
                    {/* Material */}
                    <span className="text-[10px] font-medium text-[#A08070] border border-[#EBE0D5] rounded px-1.5 py-0.5 leading-none">
                      {p.material === 'box_seal' ? 'Box + Seal' : 'Box Only'}
                    </span>
                    {/* Release date */}
                    {p.release_date && (
                      <span className="text-[10px] text-[#A08070] leading-none">
                        {formatReleaseDate(p.release_date)}
                      </span>
                    )}
                  </div>

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
