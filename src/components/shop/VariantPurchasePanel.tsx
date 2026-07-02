'use client'
import { useState } from 'react'
import type { Product, ProductVariant } from '@/lib/types'
import { formatVND } from '@/lib/utils/format'
import AddToCartButton from './AddToCartButton'
import StickyCartBar from './StickyCartBar'

interface Props {
  product: Product
  salePrice: number
  isActive: boolean
  discountPct: number
}

function pickDefault(variants: ProductVariant[]): ProductVariant {
  return variants.find(v => v.is_default) ?? variants[0]
}

export default function VariantPurchasePanel({ product, salePrice, isActive, discountPct }: Props) {
  const variants = product.variants ?? []
  const hasSelector = variants.length > 1
  const [selectedKey, setSelectedKey] = useState(() =>
    hasSelector ? pickDefault(variants).key : undefined
  )

  const activeVariant = hasSelector
    ? variants.find(v => v.key === selectedKey) ?? pickDefault(variants)
    : variants.length === 1 ? variants[0] : undefined

  const displayPrice = activeVariant ? activeVariant.price : salePrice
  const showStrikethrough = !activeVariant && isActive && discountPct > 0

  return (
    <div className="flex flex-col gap-5">
      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className={`font-extrabold text-3xl ${showStrikethrough ? 'text-error' : 'text-primary'}`}>
          {formatVND(displayPrice)}
        </span>
        {showStrikethrough && (
          <span className="text-faint line-through text-base">{formatVND(product.price)}</span>
        )}
      </div>

      {/* Variant selector — only shown when the product offers more than one box type */}
      {hasSelector && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-medium text-muted uppercase tracking-widest">Loại hộp</p>
          <div className="flex flex-wrap gap-2">
            {variants.map(v => (
              <button
                key={v.key}
                type="button"
                onClick={() => setSelectedKey(v.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold leading-none transition-colors ${
                  v.key === selectedKey
                    ? 'border-gold/70 bg-gold/10 text-gold'
                    : 'border-border text-muted hover:border-gold/50 hover:text-primary'
                }`}
              >
                {v.label}
                <span className="opacity-60">· {formatVND(v.price)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <AddToCartButton product={product} variant={activeVariant} />
      <StickyCartBar product={product} salePrice={salePrice} variant={activeVariant} />
    </div>
  )
}
