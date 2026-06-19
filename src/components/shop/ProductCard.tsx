'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/types'
import CountdownBadge from './CountdownBadge'
import PriceDisplay from './PriceDisplay'
import { useCartStore } from '@/lib/store/cart'

interface Props {
  product: Product
  variant?: 'dark' | 'light'
}

export default function ProductCard({ product, variant = 'dark' }: Props) {
  const promo = product.promotion
  const isActive = promo && new Date(promo.ends_at) > new Date()
  const isOutOfStock = product.stock === 0 && product.status !== 'pre_order'
  const isPreOrder = product.status === 'pre_order'
  const dark = variant === 'dark'
  const addItem = useCartStore(s => s.addItem)
  const [added, setAdded] = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return
    addItem(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className={`group flex flex-col rounded-xl overflow-hidden transition-all duration-200 ease-out ${
      dark
        ? 'bg-surface border border-border hover:border-gold/25 hover:shadow-[0_8px_40px_rgba(0,0,0,0.55)] hover:-translate-y-1'
        : 'bg-white border border-[#EBE3D8] shadow-sm hover:shadow-xl hover:-translate-y-1'
    }`}>

      {/* ── Image ── */}
      <Link href={`/shop/${product.slug}`} className={`relative block aspect-square overflow-hidden ${dark ? 'bg-[#0C0C18]' : 'bg-[#F5F0EA]'}`}>
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-300 ease-out group-hover:scale-105 ${isOutOfStock ? 'opacity-50' : ''}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Top-left: discount / pre-order */}
        {isActive && promo!.discount_pct > 0 && (
          <span className="absolute top-3 left-3 bg-gold text-[#07070C] text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide uppercase leading-none">
            Sale off {promo!.discount_pct}%
          </span>
        )}
        {isPreOrder && !isActive && (
          <span className="absolute top-3 left-3 bg-[#1D4ED8] text-white text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide uppercase leading-none">
            Pre-order
          </span>
        )}

        {/* Top-right: hot / new release / limited */}
        {product.tags?.includes('hot') && (
          <span className="absolute top-3 right-3 bg-[#EA580C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase leading-none">
            Hot
          </span>
        )}
        {!product.tags?.includes('hot') && product.tags?.includes('new') && (
          <span className="absolute top-3 right-3 bg-[#16A34A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase leading-none">
            New Release
          </span>
        )}
        {!product.tags?.includes('hot') && !product.tags?.includes('new') && product.tags?.includes('limited') && (
          <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white/90 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase leading-none">
            Limited
          </span>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider uppercase">
              Out of stock
            </span>
          </div>
        )}

        {/* Countdown bottom-left */}
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
      </Link>

      {/* ── Info ── */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">

        {/* MiniGT badge + material */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="inline-flex items-center h-[18px] px-1.5 rounded bg-[#0f0f0f] text-white font-extrabold leading-none border border-[#333]"
            style={{ fontSize: '9px', letterSpacing: '0.01em' }}
          >
            Mi<span style={{ color: '#e8002d' }}>N</span>i<span style={{ color: '#e8002d' }}>GT</span>
          </span>
          {product.material && (
            <span className={`text-[10px] border rounded px-1.5 py-0.5 leading-none ${
              dark ? 'text-[#a08070] border-[#3a2e28]' : 'text-[#A08070] border-[#EBE0D5]'
            }`}>
              {product.material === 'box_seal' ? 'Box + Seal' : 'Box Only'}
            </span>
          )}
        </div>

        {/* Name + price — clickable */}
        <Link href={`/shop/${product.slug}`} className="flex flex-col gap-1.5 flex-1">
          <h3 className={`font-semibold text-sm leading-snug line-clamp-2 transition-colors duration-200 ${
            dark
              ? 'text-primary group-hover:text-gold'
              : 'text-ink group-hover:text-gold-mid'
          }`}>
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-2">
            <PriceDisplay
              price={product.price}
              discountPct={isActive && promo!.discount_pct > 0 ? promo!.discount_pct : undefined}
              dark={dark}
            />
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-xs text-error font-medium shrink-0">Only {product.stock} left</span>
            )}
          </div>
        </Link>

        {/* Add to Cart */}
        <button
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`w-full h-9 rounded-sm text-xs font-bold tracking-wide uppercase transition-all active:scale-[0.98] ${
            isOutOfStock
              ? dark
                ? 'bg-surface border border-border text-faint cursor-not-allowed'
                : 'bg-[#F0EDE8] text-[#B0A090] cursor-not-allowed'
              : added
                ? 'bg-[#16A34A] text-white'
                : dark
                  ? 'bg-gold text-[#07070C] hover:opacity-90'
                  : 'bg-[#07070C] text-white hover:bg-[#1a1a1a]'
          }`}
        >
          {added ? '✓ Added!' : isOutOfStock ? 'Out of stock' : isPreOrder ? 'Pre-order' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
