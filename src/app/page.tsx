import type { Metadata } from 'next'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight2, ShieldTick, TruckFast, Flash, Star1,
  Designtools, Printer, Scissor, Layer, TickCircle, Box,
  Call,
  type Icon,
} from 'iconsax-react'
import {
  BESTSELLERS, NEW_ARRIVALS,
  getPreOrderProducts,
} from '@/lib/data/products'
import ProductCard from '@/components/shop/ProductCard'
import FlashSaleSection from '@/components/home/FlashSaleSection'
import ReviewsStrip from '@/components/home/ReviewsStrip'
import PreOrderSpotlight from '@/components/home/PreOrderSpotlight'
import RaceMarquee from '@/components/home/RaceMarquee'

// ── SEO ───────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'figbox.store — Custom Diecast Box & 1:64 Scale Packaging Vietnam',
  description:
    'Premium custom packaging for 1:64 diecast and MiniGT collectors. AI-designed, 350gsm matte print, laser-cut and hand-folded in Vietnam. Ships nationwide 3–5 days.',
  keywords: ['custom diecast box', 'miniGT box packaging', 'diecast box vietnam', 'custom box 1:64', 'figbox', '1:64 packaging', '1:64 diecast box'],
  openGraph: {
    title: 'figbox.store — Custom Diecast Box · 1:64 Packaging',
    description: 'Premium custom packaging for 1:64 diecast collectors. 350gsm matte print, laser-cut, hand-folded. Ships nationwide.',
    type: 'website',
    siteName: 'figbox.store',
  },
}

// ── Production process steps ──────────────────────────────────────────────────

const PROCESS: { icon: Icon; label: string }[] = [
  { icon: Designtools, label: 'Design'       },
  { icon: Printer,     label: 'Test Print'   },
  { icon: TickCircle,  label: 'QC Check'     },
  { icon: Box,         label: '350gsm Print' },
  { icon: Scissor,     label: 'Laser Cut'    },
  { icon: Layer,       label: 'Hand Fold'    },
  { icon: TruckFast,   label: 'Ship'         },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const preOrders = getPreOrderProducts()
  const preOrderItem = preOrders[0]

  return (
    <>
      {/* ─── 1. HERO ─── dark + banner.jpg ─────────────────────── */}
      <section aria-labelledby="hero-heading" className="relative overflow-hidden min-h-[480px] md:min-h-[560px] flex items-center">
        <Image
          src="/banner.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Base dark layer — light tint only, keep image visible */}
        <div className="absolute inset-0 bg-[#07070C]/30" aria-hidden="true" />
        {/* Left-heavy gradient — darkens text zone, fades right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07070C]/95 from-[25%] via-[#07070C]/50 via-[55%] to-transparent" aria-hidden="true" />
        {/* Bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070C]/40 via-transparent to-transparent" aria-hidden="true" />
        {/* Racing telemetry grid */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.013) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.013) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        {/* Diagonal speed lines */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 -translate-y-1/2 right-[-10%] flex flex-col gap-8" style={{ transform: 'rotate(-14deg) translateY(-50%)' }}>
            <div className="w-[560px] h-px bg-gold/[0.16]" />
            <div className="w-[700px] h-px bg-gold/[0.09]" />
            <div className="w-[440px] h-px bg-white/[0.06]" />
            <div className="w-[620px] h-px bg-gold/[0.12]" />
            <div className="w-[380px] h-px bg-white/[0.04]" />
          </div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="max-w-xl">
            <p className="text-gold text-xs font-bold tracking-[0.2em] uppercase mb-4">
              <span className="opacity-40 mr-1.5 tracking-[0.05em]">//</span>Custom Diecast Box · 1:64 Scale · Made in Vietnam
            </p>
            <h1
              id="hero-heading"
              className="font-display font-extrabold uppercase text-white text-5xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-5"
              style={{ textShadow: '0 2px 32px rgba(0,0,0,0.8)' }}
            >
              Custom Box<br />
              for your{' '}
              <span className="text-gold">Diecast</span>
            </h1>
            <p
              className="text-white/80 text-base md:text-lg mb-8 leading-relaxed font-light"
              style={{ textShadow: '0 1px 12px rgba(0,0,0,0.6)' }}
            >
              Designed to the millimetre. Printed on 350gsm matte stock. Laser-cut and hand-folded in Vietnam. Ships in 3–5 days.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-sm bg-gold text-[#07070C] font-bold text-sm hover:bg-gold-mid transition-colors"
              >
                Shop All Boxes <ArrowRight2 size={15} color="currentColor" />
              </Link>
              <a
                href="tel:+84901234567"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-sm border border-white/25 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                <Call size={15} color="currentColor" /> 0901 234 567
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. FLASH SALE ─── orange ───────────────────────────── */}
      <FlashSaleSection />

      {/* ─── 4. TOP BOXES ─── light warm ────────────────────────── */}
      <section aria-labelledby="top-boxes-heading" className="bg-warm py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-7">
            <div>
              <p className="text-gold-mid text-xs font-bold tracking-widest uppercase mb-1">
                <span className="opacity-40 mr-1.5">◆</span>Fan Favourites
              </p>
              <h2 id="top-boxes-heading" className="font-display font-extrabold text-ink text-3xl sm:text-4xl">
                Best-Selling Boxes
              </h2>
            </div>
            <Link href="/shop" className="flex items-center gap-1 text-sm font-medium text-gold-mid hover:text-gold transition-colors">
              View all <ArrowRight2 size={14} color="currentColor" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {BESTSELLERS.slice(0, 4).map(p => <ProductCard key={p.id} product={p} variant="light" />)}
          </div>
        </div>
      </section>

      {/* ─── Race marquee ───────────────────────────────────────── */}
      <RaceMarquee />

      {/* ─── 5. NEW ARRIVALS ─── dark ───────────────────────────── */}
      <section
        aria-labelledby="new-arrivals-heading"
        className="relative overflow-hidden bg-bg py-14"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 8px)',
          backgroundSize: '8px 8px',
        }}
      >
        {/* Racing number watermark */}
        <div
          aria-hidden="true"
          className="absolute -top-6 -right-4 font-display font-extrabold leading-none select-none pointer-events-none"
          style={{
            fontSize: 'clamp(140px, 22vw, 260px)',
            color: 'rgba(255,255,255,0.028)',
            letterSpacing: '-0.04em',
          }}
        >
          03
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-7">
            <div>
              <p className="text-gold text-xs font-bold tracking-widest uppercase mb-1">
                <span className="opacity-40 mr-1.5 tracking-[0.05em]">//</span>Just Dropped
              </p>
              <h2 id="new-arrivals-heading" className="font-display font-extrabold text-primary text-3xl sm:text-4xl">
                New Arrivals
              </h2>
            </div>
            <Link href="/shop" className="flex items-center gap-1 text-sm font-medium text-gold hover:text-gold-mid transition-colors">
              View all <ArrowRight2 size={14} color="currentColor" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {NEW_ARRIVALS.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ─── 6. PRE-ORDER ─── cinematic spotlight ──────────────── */}
      {preOrderItem && <PreOrderSpotlight product={preOrderItem} />}

      {/* ─── 7. PRODUCTION PROCESS ─── dark race track ──────────── */}
      <section
        aria-labelledby="process-heading"
        className="relative overflow-hidden bg-bg border-y border-border py-16"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 8px)',
          backgroundSize: '8px 8px',
        }}
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-14">
            <p className="text-gold text-xs font-bold tracking-[0.22em] uppercase mb-3">
              <span className="opacity-40 mr-1.5 tracking-[0.05em]">//</span>How It&apos;s Made
            </p>
            <h2 id="process-heading" className="font-display font-extrabold text-white uppercase leading-none text-4xl sm:text-5xl">
              7 Steps. Zero Compromise.
            </h2>
          </div>

          {/* ── Desktop: horizontal race track ── */}
          <div className="hidden lg:block relative">
            <div
              className="absolute"
              style={{
                top: '28px',
                left: 'calc(100% / 14)',
                right: 'calc(100% / 14)',
                height: '1px',
                background: 'linear-gradient(90deg, rgba(245,158,11,0.55) 0%, rgba(245,158,11,0.06) 100%)',
              }}
              aria-hidden="true"
            />
            <div className="grid grid-cols-7 gap-2">
              {PROCESS.map((step, i) => {
                const Icon = step.icon
                return (
                  <div
                    key={i}
                    className="step-reveal flex flex-col items-center gap-3"
                    style={{ animationDelay: `${i * 0.09}s` } as React.CSSProperties}
                  >
                    <div
                      className="relative w-14 h-14 rounded-full bg-surface flex items-center justify-center"
                      style={{ border: '1.5px solid rgba(245,158,11,0.7)' }}
                    >
                      <Icon size={20} color="rgba(245,158,11,1)" variant="Bold" />
                      <span
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-bg border border-border flex items-center justify-center font-display font-extrabold"
                        style={{ fontSize: '9px', color: 'rgba(245,158,11,1)' }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <p className="font-display font-extrabold uppercase text-center text-[10px] tracking-[0.15em] leading-tight text-primary">
                      {step.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Mobile / tablet: vertical track ── */}
          <div className="lg:hidden relative">
            <div
              className="absolute left-[17px] top-0 bottom-0 w-px"
              style={{ background: 'linear-gradient(to bottom, rgba(245,158,11,0.5), rgba(245,158,11,0.04))' }}
              aria-hidden="true"
            />
            <div className="flex flex-col">
              {PROCESS.map((step, i) => {
                const Icon = step.icon
                return (
                  <div
                    key={i}
                    className="step-reveal relative flex items-center gap-4 py-3.5 pl-12"
                    style={{ animationDelay: `${i * 0.08}s` } as React.CSSProperties}
                  >
                    <div
                      className="absolute left-0 z-10 w-[35px] h-[35px] rounded-full bg-bg flex items-center justify-center"
                      style={{ border: '1.5px solid rgba(245,158,11,0.65)' }}
                    >
                      <span
                        className="font-display font-extrabold"
                        style={{ fontSize: '9px', color: 'rgba(245,158,11,1)' }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <Icon size={15} color="rgba(245,158,11,1)" variant="Bold" />
                    <p className="font-display font-extrabold uppercase text-[11px] tracking-[0.12em] text-primary">
                      {step.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. REVIEWS ─── dark ────────────────────────────────── */}
      <ReviewsStrip />

      {/* ─── 9. CTA ─── dark racing ─────────────────────────────── */}
      <section
        aria-labelledby="cta-heading"
        className="relative overflow-hidden bg-bg"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '48px 48px' }}
      >
        {/* Gold top accent stripe */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden="true" />
        {/* Ambient gold glow */}
        <div aria-hidden="true" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[320px] rounded-full bg-gold opacity-[0.05] blur-[140px] pointer-events-none" />

        {/* ── Timing-board stat bar ── */}
        <div className="relative border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-3 divide-x divide-border">
            {([
              { value: '500+', label: 'Boxes Shipped' },
              { value: '4.9★', label: 'Collector Rating' },
              { value: '3–5d', label: 'Nationwide Delivery' },
            ] as const).map(({ value, label }) => (
              <div key={label} className="py-6 sm:py-8 flex flex-col items-center gap-1">
                <span className="font-display font-extrabold text-white text-3xl sm:text-5xl tabular-nums leading-none">{value}</span>
                <span className="text-faint text-[10px] font-bold uppercase tracking-[0.18em] mt-1">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main CTA body ── */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 lg:gap-12">

            {/* Left: headline */}
            <div className="flex-1">
              <p className="text-gold text-xs font-bold tracking-[0.22em] uppercase mb-5">
                <span className="opacity-40 mr-1.5 tracking-[0.05em]">//</span>Custom Order
              </p>
              <h2
                id="cta-heading"
                className="font-display font-extrabold uppercase text-white leading-[0.9] text-4xl sm:text-5xl lg:text-7xl mb-6"
              >
                Your car.<br />
                Your design.<br />
                <span className="text-gold">Your box.</span>
              </h2>
              <p className="text-muted text-sm leading-relaxed max-w-md">
                Send us your car photo — we handle design, print, and delivery.
              </p>
            </div>

            {/* Center: floating product showcase — desktop only */}
            <div className="hidden lg:flex shrink-0 items-center justify-center">
              <div
                className="relative w-[220px] aspect-square rounded-xl overflow-hidden"
                style={{
                  transform: 'rotate(-6deg)',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.75), 0 0 50px rgba(245,158,11,0.12)',
                }}
              >
                <Image
                  src="/products/p1.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="220px"
                />
                <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 60px rgba(7,7,12,0.45)' }} aria-hidden="true" />
              </div>
            </div>

            {/* Right: CTAs + spec badges */}
            <div className="flex flex-col items-start lg:items-end gap-5 shrink-0">
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 rounded-sm bg-gold text-[#07070C] font-bold text-sm hover:bg-gold-mid transition-colors"
                  style={{ boxShadow: '0 4px 24px rgba(245,158,11,0.35)' }}
                >
                  Browse Boxes <ArrowRight2 size={15} color="currentColor" />
                </Link>
                <a
                  href="tel:+84901234567"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-sm border border-border text-white font-semibold text-sm hover:bg-surface transition-colors"
                >
                  <Call size={15} color="currentColor" /> 0901 234 567
                </a>
              </div>

              {/* Spec badges */}
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: ShieldTick, label: 'Quality Guarantee' },
                  { icon: TruckFast,  label: 'Free Nationwide Ship' },
                  { icon: Box,        label: '350gsm Matte Stock' },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30 border border-white/[0.08] px-3 py-1.5 rounded-full"
                  >
                    <Icon size={10} color="currentColor" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
