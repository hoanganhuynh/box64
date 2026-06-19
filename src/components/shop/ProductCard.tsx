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
  const isCustom = product.type === 'box_custom'

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col bg-surface rounded-sm border border-border hover:border-gold/50 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* ── Image ── */}
      <div className="relative aspect-square overflow-hidden bg-[#09090F]">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-300 group-hover:scale-105 ${isOutOfStock ? 'opacity-50' : ''}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {isActive && promo!.discount_pct > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wider uppercase leading-none">
            -{promo!.discount_pct}%
          </span>
        )}
        {isPreOrder && !isActive && (
          <span className="absolute top-2.5 left-2.5 bg-[#1D4ED8] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wider uppercase leading-none">
            Pre-order
          </span>
        )}
        {isCustom && (
          <span className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-sm text-white/90 text-[9px] font-bold px-2 py-0.5 rounded-sm tracking-wider uppercase">
            Custom
          </span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-sm tracking-wider uppercase">
              Out of stock
            </span>
          </div>
        )}
        {isActive && (promo!.type === 'sale' || promo!.type === 'flash_sale') && (
          <div className="absolute bottom-2 left-2">
            <CountdownBadge
              label={promo!.type === 'flash_sale' ? 'ENDS IN' : 'SALE ENDS'}
              endDate={promo!.ends_at}
              variant={promo!.type}
            />
          </div>
        )}
        {isPreOrder && isActive && (
          <div className="absolute bottom-2 left-2">
            <CountdownBadge label="SHIPS IN" endDate={promo!.ends_at} variant="pre_order" />
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">
          {isCustom ? 'Custom Box' : 'MiniGT Template'}
        </p>
        <h3 className="font-semibold text-primary text-sm leading-snug line-clamp-2 group-hover:text-gold transition-colors flex-1">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center justify-between gap-2">
          <PriceDisplay
            price={product.price}
            discountPct={isActive && promo!.discount_pct > 0 ? promo!.discount_pct : undefined}
          />
          {product.stock > 0 && product.stock <= 5 && (
            <span className="text-[10px] text-error font-medium shrink-0">Only {product.stock} left</span>
          )}
        </div>
      </div>
    </Link>
  )
}
