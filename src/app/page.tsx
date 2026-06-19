import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight2, ShieldTick, TruckFast, Flash, Star1,
  Designtools, Printer, Scissor, Layer, TickCircle, Box,
  Call,
} from 'iconsax-react'
import {
  BESTSELLERS, NEW_ARRIVALS,
  getPreOrderProducts, getDiscountedPrice,
} from '@/lib/data/products'
import { formatVND } from '@/lib/utils/format'
import ProductCard from '@/components/shop/ProductCard'
import FlashSaleSection from '@/components/home/FlashSaleSection'
import ReviewsStrip from '@/components/home/ReviewsStrip'

// ── SEO ───────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'figbox.store — Premium Custom 1:64 Diecast Box | MiniGT',
  description:
    'figbox.store makes premium custom packaging for 1:64 MiniGT diecast cars. Designed in Illustrator, printed on 350gsm, laser-cut, hand folded. Nationwide delivery.',
  keywords: ['miniGT box', 'diecast box', 'custom box 1:64', 'figbox', '1:64 packaging', 'diecast packaging vietnam'],
  openGraph: {
    title: 'figbox.store — Premium Custom Diecast Box',
    description: 'Custom 1:64 diecast box packaging. Handcrafted in Vietnam. Ship nationwide.',
    type: 'website',
    siteName: 'figbox.store',
  },
}

// ── Production process steps ──────────────────────────────────────────────────

const PROCESS = [
  {
    icon: Designtools,
    title: 'Design in\nIllustrator',
    desc: 'Each box is a dedicated AI file. Colors, fonts, and layout crafted down to the millimetre.',
  },
  {
    icon: Printer,
    title: 'Test\nPrint',
    desc: 'A draft print on regular paper checks layout and color accuracy before committing to premium stock.',
  },
  {
    icon: TickCircle,
    title: 'Review\n& QC',
    desc: 'Color-match and millimetre-level inspection. Only approved designs move to the final print.',
  },
  {
    icon: Box,
    title: 'Print on\n350gsm Stock',
    desc: 'Offset-printed on 350gsm matte-coated board — thick, rigid, true-to-color.',
  },
  {
    icon: Scissor,
    title: 'Precision\nLaser Cut',
    desc: 'CNC laser follows the AI file exactly. Zero deviation, even at 0.5 mm.',
  },
  {
    icon: Layer,
    title: 'Hand Fold\n& Seal',
    desc: 'Every box is folded and sealed by hand. Sharp corners, no peeling, no shifting.',
  },
  {
    icon: TruckFast,
    title: 'Pack\n& Ship',
    desc: 'Bubble-wrapped, boxed, and dispatched nationwide in 3–5 days via GHTK · J&T · VN Post.',
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const preOrders = getPreOrderProducts()
  const preOrderItem = preOrders[0]

  return (
    <>
      {/* ─── 1. ANNOUNCEMENT BAR ─── gold ──────────────────────── */}
      <div className="bg-gold text-[#07070C] text-[11px] font-semibold py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
          <span className="flex items-center gap-1.5">
            <TruckFast size={12} color="currentColor" /> Free shipping on orders 500k+
          </span>
          <span className="w-px h-3 bg-black/20 hidden sm:block" />
          <span className="flex items-center gap-1.5">
            <Flash size={12} color="currentColor" variant="Bold" /> Flash Sale live — up to 15% off
          </span>
          <span className="w-px h-3 bg-black/20 hidden sm:block" />
          <span className="hidden sm:flex items-center gap-1.5">
            <Star1 size={11} color="currentColor" variant="Bold" /> 4.9★ · 500+ boxes shipped
          </span>
        </div>
      </div>

      {/* ─── 2. HERO ─── dark + banner.jpg ─────────────────────── */}
      <section aria-labelledby="hero-heading" className="relative overflow-hidden min-h-[480px] md:min-h-[560px] flex items-center">
        <Image
          src="/banner.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Base dark layer */}
        <div className="absolute inset-0 bg-[#07070C]/65" aria-hidden="true" />
        {/* Left-heavy gradient for text zone */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07070C] from-[35%] via-[#07070C]/60 via-[65%] to-transparent" aria-hidden="true" />
        {/* Bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070C]/60 via-transparent to-transparent" aria-hidden="true" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="max-w-xl">
            <p className="text-gold text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
              1:64 Scale · MiniGT · Handcrafted in Vietnam
            </p>
            <h1
              id="hero-heading"
              className="font-jakarta font-extrabold text-white text-4xl sm:text-5xl lg:text-6xl leading-[1.07] mb-5"
              style={{ textShadow: '0 2px 24px rgba(0,0,0,0.7)' }}
            >
              Custom Box<br />
              for your{' '}
              <span className="text-gold">Diecast</span>
            </h1>
            <p
              className="text-white/75 text-base md:text-lg mb-8 leading-relaxed"
              style={{ textShadow: '0 1px 12px rgba(0,0,0,0.6)' }}
            >
              Designed in Illustrator. Printed on 350gsm. Laser-cut. Hand folded. Nationwide delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-sm bg-gold text-[#07070C] font-bold text-sm hover:bg-gold-mid transition-colors"
              >
                View Boxes <ArrowRight2 size={15} color="currentColor" />
              </Link>
              <a
                href="tel:+84901234567"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-sm border border-white/25 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                <Call size={15} color="currentColor" /> 0901 234 567
              </a>
            </div>
            <div className="flex items-center gap-6">
              {[
                { value: '500+', label: 'boxes shipped' },
                { value: '4.9★', label: 'collector rating' },
                { value: '3–5d', label: 'nationwide delivery' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <span className="font-jakarta font-black text-white text-xl leading-none block">{value}</span>
                  <span className="text-white/35 text-[9px] font-medium uppercase tracking-wider">{label}</span>
                </div>
              ))}
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
              <p className="text-gold-mid text-[10px] font-bold tracking-widest uppercase mb-1">Community Favourites</p>
              <h2 id="top-boxes-heading" className="font-jakarta font-extrabold text-ink text-2xl">
                Top Boxes
              </h2>
            </div>
            <Link href="/shop" className="flex items-center gap-1 text-sm font-medium text-gold-mid hover:text-gold transition-colors">
              View all <ArrowRight2 size={14} color="currentColor" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BESTSELLERS.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ─── 5. NEW ARRIVALS ─── dark ───────────────────────────── */}
      <section aria-labelledby="new-arrivals-heading" className="bg-bg py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-7">
            <div>
              <p className="text-gold text-[10px] font-bold tracking-widest uppercase mb-1">Just Dropped</p>
              <h2 id="new-arrivals-heading" className="font-jakarta font-extrabold text-primary text-2xl">
                New Arrivals
              </h2>
            </div>
            <Link href="/shop" className="flex items-center gap-1 text-sm font-medium text-gold hover:text-gold-mid transition-colors">
              View all <ArrowRight2 size={14} color="currentColor" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {NEW_ARRIVALS.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ─── 6. PRE-ORDER ─── orange-tint ─────────────────────── */}
      {preOrderItem && (
        <section aria-labelledby="preorder-heading" className="bg-[#FFF3E8] border-y border-[#F5D9B8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-1 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-gold-mid uppercase tracking-widest border border-gold-mid/40 px-2.5 py-1 rounded-sm mb-3">
                Coming Soon
              </span>
              <h2 id="preorder-heading" className="font-jakarta font-extrabold text-ink text-2xl mb-2">
                {preOrderItem.name}
              </h2>
              <p className="text-ink-muted text-sm max-w-md mb-5">{preOrderItem.description}</p>
              <div className="flex items-center gap-4 justify-center sm:justify-start">
                <div>
                  <p className="text-[10px] text-ink-faint uppercase tracking-wider mb-0.5">Launch price</p>
                  <p className="font-black text-gold-mid text-xl">{formatVND(getDiscountedPrice(preOrderItem))}</p>
                </div>
                <Link
                  href={`/shop/${preOrderItem.slug}`}
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-sm bg-gold-mid text-white font-semibold text-xs hover:bg-gold transition-colors"
                >
                  Pre-order Now <ArrowRight2 size={12} color="currentColor" />
                </Link>
              </div>
            </div>
            <div className="relative w-44 h-44 shrink-0">
              <Image src={preOrderItem.images[0]} alt={preOrderItem.name} fill className="object-cover rounded-sm" sizes="176px" />
            </div>
          </div>
        </section>
      )}

      {/* ─── 7. PRODUCTION PROCESS ─── light cream ──────────────── */}
      <section aria-labelledby="process-heading" className="bg-warm-surface border-y border-border-warm py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-gold-mid text-[10px] font-bold tracking-widest uppercase mb-2">Handcrafted with Care</p>
            <h2 id="process-heading" className="font-jakarta font-extrabold text-ink text-2xl sm:text-3xl mb-3">
              Our Box Making Process
            </h2>
            <p className="text-ink-muted text-sm max-w-lg mx-auto leading-relaxed">
              Every box passes through 7 handcrafted steps — from Illustrator sketch to your doorstep.
              No templates. No batch runs. One box, made for your car.
            </p>
          </div>

          {/* Timeline grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 lg:gap-2">
            {PROCESS.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="flex flex-col items-center text-center gap-3 px-1">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-[#FFF3E8] border-2 border-[#F5D4A8] flex items-center justify-center">
                      <Icon size={22} color="var(--gold-mid)" variant="Bold" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold-mid text-white text-[9px] font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <p className="font-jakarta font-bold text-ink text-xs leading-snug whitespace-pre-line">
                    {step.title}
                  </p>
                  <p className="hidden lg:block text-ink-muted text-[10px] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Mobile/tablet expanded list */}
          <div className="lg:hidden mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PROCESS.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="flex gap-3 items-start p-4 rounded-sm bg-[#FFF8F0] border border-[#EFE0CC]">
                  <div className="w-8 h-8 rounded-sm bg-white border border-[#F5D4A8] flex items-center justify-center shrink-0">
                    <Icon size={16} color="var(--gold-mid)" variant="Bold" />
                  </div>
                  <div>
                    <p className="font-bold text-ink text-xs mb-0.5">
                      <span className="text-gold-mid mr-1">{i + 1}.</span>
                      {step.title.replace('\n', ' ')}
                    </p>
                    <p className="text-ink-muted text-[10px] leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── 8. REVIEWS ─── dark ────────────────────────────────── */}
      <ReviewsStrip />

      {/* ─── 9. TRUST + CTA ─── orange ──────────────────────────── */}
      <section aria-labelledby="cta-heading" className="bg-gold-mid py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Trust signals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {([
              { icon: ShieldTick, title: 'Quality Guarantee',      desc: 'We reprint at no charge if anything arrives wrong.' },
              { icon: TruckFast,  title: 'Nationwide Shipping',    desc: 'GHTK · J&T · VN Post express.' },
              { icon: Box,        title: '350gsm Coated Stock',    desc: 'Thick, rigid, matte-laminate finish.' },
              { icon: Star1,      title: '4.9★ Collector Rating',  desc: '500+ successful orders and counting.' },
            ] as const).map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-2 p-4 rounded-sm bg-white/15 border border-white/20">
                <Icon size={18} color="white" variant="Bold" />
                <p className="font-semibold text-white text-xs">{title}</p>
                <p className="text-white/65 text-[10px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 id="cta-heading" className="font-jakarta font-extrabold text-white text-2xl sm:text-3xl mb-3">
              Want a box made just for you?
            </h2>
            <p className="text-white/70 text-sm mb-7 max-w-md mx-auto">
              Share your car photo with us — we&apos;ll handle everything from design to delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/shop" className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-sm bg-white text-gold-mid font-bold text-sm hover:bg-white/90 transition-colors">
                Browse Boxes <ArrowRight2 size={14} color="currentColor" />
              </Link>
              <a href="tel:+84901234567" className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-sm border-2 border-white/40 text-white font-semibold text-sm hover:bg-white/15 transition-colors">
                <Call size={14} color="currentColor" /> 0901 234 567
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
