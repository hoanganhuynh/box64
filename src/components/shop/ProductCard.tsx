import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/types'
import CountdownBadge from './CountdownBadge'
import PriceDisplay from './PriceDisplay'
import { Package2 } from 'lucide-react'

interface Props { product: Product }

const tintClass: Record<string, string> = {
  sale:       'tint-gold',
  flash_sale: 'tint-gold',
  pre_order:  'tint-blue',
}

export default function ProductCard({ product }: Props) {
  const promo = product.promotion
  const isActive = promo && new Date(promo.ends_at) > new Date()
  const cardTint = isActive ? (tintClass[promo.type] ?? 'tint-slate') : 'tint-slate'

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group bg-surface rounded border border-border hover:border-gold/40 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className={`relative aspect-[3/2] overflow-hidden bg-[#111212] ${cardTint}`}>
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
        {isActive && (
          <span className="absolute top-2 left-2 bg-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wider uppercase">
            {promo!.label}
          </span>
        )}
        {isActive && promo!.type === 'pre_order' && (
          <CountdownBadge label="SHIPS IN" endDate={promo!.ends_at} variant="pre_order" />
        )}
        {isActive && promo!.type !== 'pre_order' && (
          <CountdownBadge
            label={promo!.type === 'flash_sale' ? 'ENDS IN' : 'SALE ENDS'}
            endDate={promo!.ends_at}
            variant={promo!.type}
          />
        )}
        {product.type === 'box_custom' && (
          <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white/80 text-[9px] font-bold px-2 py-0.5 rounded-sm tracking-wider uppercase flex items-center gap-1">
            <Package2 size={9} /> Custom
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-xs text-muted font-medium uppercase tracking-wider">
          {product.type === 'box_custom' ? 'Box Custom' : 'Box Catalog'}
        </p>
        <h3 className="font-semibold text-primary text-sm leading-snug line-clamp-2 group-hover:text-gold transition-colors">
          {product.name}
        </h3>
        <div className="mt-auto pt-2">
          <PriceDisplay price={product.price} discountPct={isActive ? promo!.discount_pct : undefined} />
        </div>
      </div>
    </Link>
  )
}
