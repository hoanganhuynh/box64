'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Flash } from 'iconsax-react'
import type { Product } from '@/lib/types'
import CountdownBadge from './CountdownBadge'
import PriceDisplay from './PriceDisplay'
import BrandLogo from '@/components/ui/BrandLogo'

interface Props {
  product: Product
  variant?: 'dark' | 'light'
  showFlashProgress?: boolean
}

const FLASH_TOTAL = 20

function getSoldCount(slug: string): number {
  const sum = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return (sum % 80) + 20
}

function getFlashSoldCount(slug: string): number {
  const sum = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return (sum % 15) + 3
}

export default function ProductCard({ product, variant = 'dark', showFlashProgress = false }: Props) {
  const promo = product.promotion
  const isActive = promo && new Date(promo.ends_at) > new Date()
  const isFlashSale = isActive && promo!.type === 'flash_sale'
  const isOutOfStock = product.stock === 0 && product.status !== 'pre_order'
  const isPreOrder = product.status === 'pre_order'
  const dark = variant === 'dark'

  const images = product.images
  const [imgIndex, setImgIndex] = useState(0)
  const pointerStart = useRef<{ x: number; y: number } | null>(null)

  const sold = getSoldCount(product.slug)
  const flashSold = (isFlashSale && showFlashProgress) ? getFlashSoldCount(product.slug) : 0
  const flashPct = Math.round((flashSold / FLASH_TOTAL) * 100)

  const onPointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY }
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!pointerStart.current || images.length < 2) return
    const dx = e.clientX - pointerStart.current.x
    const dy = e.clientY - pointerStart.current.y
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) setImgIndex(i => (i + 1) % images.length)
      else setImgIndex(i => (i - 1 + images.length) % images.length)
    }
    pointerStart.current = null
  }

  return (
    <div className={`group flex flex-col h-full rounded-xl overflow-hidden transition-all duration-200 ease-out ${
      dark
        ? 'bg-surface border border-border hover:border-gold/25 hover:shadow-[0_8px_40px_rgba(0,0,0,0.55)] hover:-translate-y-1'
        : 'bg-white border border-[#EBE3D8] shadow-sm hover:shadow-xl hover:-translate-y-1'
    }`}>

      {/* ── Image ── */}
      <Link
        href={`/shop/${product.slug}`}
        className={`relative block aspect-square overflow-hidden select-none ${dark ? 'bg-[#0C0C18]' : 'bg-[#F5F0EA]'}`}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <Image
          src={images[imgIndex] ?? images[0]}
          alt={product.name}
          fill
          draggable={false}
          className={`object-cover transition-transform duration-300 ease-out group-hover:scale-105 ${isOutOfStock ? 'opacity-50' : ''}`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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

        {/* Top-right: hot / new / limited */}
        {product.tags?.includes('hot') && (
          <span className="absolute top-3 right-3 bg-[#EA580C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase leading-none">
            Hot
          </span>
        )}
        {!product.tags?.includes('hot') && product.tags?.includes('new') && (
          <span className="absolute top-3 right-3 bg-[#16A34A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase leading-none">
            New
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

        {/* Countdown */}
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

        {/* Dot indicators — only if multiple images */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-200 ${
                  i === imgIndex
                    ? 'w-4 h-1.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </Link>

      {/* ── Info ── */}
      <div className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-2.5 flex-1">

        {/* MiniGT logo + brand + material + sold */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Image
            src="/mini-gt-seeklogo.svg"
            alt="MiniGT"
            width={38}
            height={18}
            className={`object-contain shrink-0 ${dark ? 'invert' : ''}`}
          />
          {product.brand && product.brand !== 'other' && (
            <BrandLogo brand={product.brand} size={30} variant={variant} />
          )}
          {product.material && (
            <span className={`text-[10px] border rounded px-1.5 py-0.5 leading-none ${
              dark ? 'text-[#a08070] border-[#3a2e28]' : 'text-[#A08070] border-[#EBE0D5]'
            }`}>
              {product.material === 'box_protect' ? 'Box + Protect' : 'Box Only'}
            </span>
          )}
          {!(isFlashSale && showFlashProgress) && (
            <span className={`text-[10px] font-semibold ml-auto ${dark ? 'text-white/30' : 'text-[#B0A090]'}`}>
              {sold} sold
            </span>
          )}
        </div>

        {/* Name + price */}
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
              <span className="hidden sm:inline text-xs text-error font-medium shrink-0">Only {product.stock} left</span>
            )}
          </div>
        </Link>

        {/* Flash sale progress bar — only in FlashSaleSection */}
        {isFlashSale && showFlashProgress && (
          <div
            className="relative h-[26px] rounded-full overflow-hidden"
            style={{ background: '#6B2500' }}
            role="meter"
            aria-valuenow={flashSold}
            aria-valuemax={FLASH_TOTAL}
            aria-label={`${flashSold}/${FLASH_TOTAL} slots sold`}
          >
            <div
              className="absolute inset-y-0 left-0 transition-none"
              style={{ width: `${flashPct}%`, background: 'linear-gradient(90deg, #C2410C 0%, #F97316 100%)' }}
            />
            <div
              className="absolute inset-y-0 left-0 pointer-events-none"
              style={{ width: `${flashPct}%`, background: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, transparent 60%)' }}
            />
            <div className="relative h-full flex items-center gap-1 px-2.5">
              <Flash size={11} color="#FCD34D" variant="Bold" />
              <span className="text-white text-[10px] font-bold tracking-wide leading-none drop-shadow-sm">
                {flashSold}/{FLASH_TOTAL} slots sold
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
