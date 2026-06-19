'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight2, TruckFast, ShieldTick } from 'iconsax-react'
import type { Product } from '@/lib/types'
import { getDiscountedPrice } from '@/lib/data/products'
import { formatVND, formatCountdown } from '@/lib/utils/format'

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[52px]">
      <span className="font-display font-extrabold text-white text-4xl sm:text-5xl tabular-nums leading-none">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">{label}</span>
    </div>
  )
}

export default function PreOrderSpotlight({ product }: { product: Product }) {
  const launchDate = product.promotion?.ends_at ?? ''
  const [timeLeft, setTimeLeft] = useState(
    formatCountdown(new Date(launchDate).getTime() - Date.now())
  )

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(formatCountdown(new Date(launchDate).getTime() - Date.now()))
    }, 1000)
    return () => clearInterval(id)
  }, [launchDate])

  const price = getDiscountedPrice(product)

  return (
    <section aria-labelledby="preorder-heading" className="relative overflow-hidden bg-bg">
      {/* ── ambient gold glow blobs ── */}
      <div className="absolute top-1/2 -translate-y-1/2 left-[5%] w-[55vw] max-w-[560px] h-[55vw] max-h-[560px] rounded-full bg-gold opacity-[0.07] blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 right-[8%] w-[35vw] max-w-[380px] h-[35vw] max-h-[380px] rounded-full bg-gold-mid opacity-[0.05] blur-[100px] pointer-events-none" />

      {/* ── subtle noise texture ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }}
      />

      {/* ── top separator ── */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

        {/* ── left: product image ── */}
        <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
          <div className="relative w-full max-w-[420px]">
            {/* glow ring behind image */}
            <div className="absolute -inset-4 rounded-3xl bg-gold opacity-[0.04] blur-2xl" />

            <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/[0.08]"
              style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)' }}>
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 42vw"
              />
              {/* inner vignette — blends edges into dark bg */}
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{ boxShadow: 'inset 0 0 100px rgba(7,7,12,0.55)' }}
              />
            </div>

            {/* PRE-ORDER floating badge */}
            <div className="absolute -top-3 -right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 bg-gold text-[#07070C] font-display font-extrabold text-[11px] uppercase tracking-[0.15em] px-3.5 py-2 rounded-full"
              style={{ boxShadow: '0 4px 20px rgba(245,158,11,0.45)' }}>
              Pre-Order
            </div>
          </div>
        </div>

        {/* ── right: content ── */}
        <div className="order-1 lg:order-2 flex flex-col gap-7">

          {/* pulsing live indicator */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold" />
            </span>
            <span className="text-gold text-xs font-bold tracking-[0.22em] uppercase">
              <span className="opacity-40 mr-1 tracking-[0.05em]">//</span>Coming Soon
            </span>
          </div>

          {/* product name */}
          <div>
            <h2
              id="preorder-heading"
              className="font-display font-extrabold text-primary uppercase text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.0] mb-3"
            >
              {product.name}
            </h2>
            <p className="text-muted text-sm leading-relaxed max-w-sm">{product.description}</p>
          </div>

          {/* countdown panel */}
          <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur-sm px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted mb-4">Launches in</p>
            <div className="flex items-end gap-3 sm:gap-5">
              <CountdownBlock value={timeLeft.days} label="Days" />
              <span className="font-display font-extrabold text-white/15 text-4xl pb-5 leading-none">:</span>
              <CountdownBlock value={timeLeft.hours} label="Hours" />
              <span className="font-display font-extrabold text-white/15 text-4xl pb-5 leading-none">:</span>
              <CountdownBlock value={timeLeft.minutes} label="Min" />
              <span className="font-display font-extrabold text-white/15 text-4xl pb-5 leading-none">:</span>
              <CountdownBlock value={timeLeft.seconds} label="Sec" />
            </div>
          </div>

          {/* price + CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted mb-1">Launch price</p>
              <p className="font-display font-extrabold text-gold leading-none text-5xl">{formatVND(price)}</p>
            </div>
            <Link
              href={`/shop/${product.slug}`}
              className="inline-flex items-center gap-2.5 h-12 px-7 rounded-sm bg-gold text-[#07070C] font-bold text-sm transition-all duration-200 whitespace-nowrap hover:bg-gold-mid"
              style={{ boxShadow: '0 4px 24px rgba(245,158,11,0.3)' }}
            >
              Pre-order Now
              <ArrowRight2 size={15} color="currentColor" />
            </Link>
          </div>

          {/* trust signals */}
          <div className="flex flex-wrap gap-5 pt-1 border-t border-border">
            <span className="flex items-center gap-1.5 text-xs text-muted font-medium">
              <TruckFast size={13} color="var(--text-muted)" />
              Free nationwide delivery
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted font-medium">
              <ShieldTick size={13} color="var(--text-muted)" />
              Secure payment
            </span>
          </div>
        </div>
      </div>

      {/* ── bottom separator ── */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  )
}
