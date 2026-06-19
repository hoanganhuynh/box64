import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/types'
import CountdownBadge from './CountdownBadge'
import PriceDisplay from './PriceDisplay'

interface Props { product: Product }

export default function ProductCard({ product }: Props) {
  const promo = product.promotion
  const isActive = promo && new Date(promo.ends_at) > new Date()
  const isOutOfStock = product.stock === 0 && product.status !== 'pre_order'
  const isPreOrder = product.status === 'pre_order'

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col bg-white rounded-xl border border-[#EBE3D8] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 ease-out overflow-hidden"
    >
      {/* ── Image ── */}
      <div className="relative aspect-square overflow-hidden bg-[#F5F0EA]">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-300 ease-out group-hover:scale-105 ${isOutOfStock ? 'opacity-50' : ''}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {isActive && promo!.discount_pct > 0 && (
          <span className="absolute top-3 left-3 bg-gold text-[#07070C] text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide uppercase leading-none">
            -{promo!.discount_pct}%
          </span>
        )}
        {isPreOrder && !isActive && (
          <span className="absolute top-3 left-3 bg-[#1D4ED8] text-white text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide uppercase leading-none">
            Pre-order
          </span>
        )}
        <span className="absolute top-3 right-3 bg-black/55 backdrop-blur-sm text-white/90 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">
          Custom
        </span>
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider uppercase">
              Out of stock
            </span>
          </div>
        )}
        {isActive && (promo!.type === 'sale' || promo!.type === 'flash_sale') && (
          <div className="absolute bottom-2.5 left-2.5">
            <CountdownBadge
              label={promo!.type === 'flash_sale' ? 'ENDS IN' : 'SALE ENDS'}
              endDate={promo!.ends_at}
              variant={promo!.type}
            />
          </div>
        )}
        {isPreOrder && isActive && (
          <div className="absolute bottom-2.5 left-2.5">
            <CountdownBadge label="SHIPS IN" endDate={promo!.ends_at} variant="pre_order" />
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
          Custom Box
        </p>
        <h3 className="font-semibold text-ink text-sm leading-snug line-clamp-2 group-hover:text-gold-mid transition-colors duration-200 flex-1">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center justify-between gap-2">
          <PriceDisplay
            price={product.price}
            discountPct={isActive && promo!.discount_pct > 0 ? promo!.discount_pct : undefined}
          />
          {product.stock > 0 && product.stock <= 5 && (
            <span className="text-xs text-error font-medium shrink-0">Only {product.stock} left</span>
          )}
        </div>
      </div>
    </Link>
  )
}
