import Link from 'next/link'
import Image from 'next/image'
import { ArrowUp2, Location } from 'iconsax-react'
import SampleRequestForm from './SampleRequestForm'

const SHOP_LINKS = [
  { label: 'All Products', href: '/shop' },
  { label: 'On Sale', href: '/shop?type=sale' },
  { label: 'Pre-order', href: '/shop?type=pre_order' },
  { label: 'Cart', href: '/cart' },
]

const SUPPORT_LINKS = [
  { label: 'Track Order', href: '/track' },
  { label: 'Account', href: '/login' },
]

export default function Footer() {
  return (
    <footer
      className="mt-auto relative overflow-hidden"
      style={{
        backgroundColor: '#09090F',
        /* Checkered flag — classic motorsport grid texture */
        backgroundImage: [
          'repeating-conic-gradient(rgba(255,255,255,0.022) 0% 25%, transparent 0% 50%)',
          /* Speed-line overlay at 60° — racing livery pinstripes */
          'repeating-linear-gradient(60deg, transparent 0px, transparent 22px, rgba(245,158,11,0.018) 22px, rgba(245,158,11,0.018) 23px)',
        ].join(', '),
        backgroundSize: '14px 14px, auto',
      }}
    >
      {/* Ambient gold glow — top edge */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.4) 40%, rgba(245,158,11,0.4) 60%, transparent 100%)' }}
      />
      {/* Subtle gold bloom from top center */}
      <div
        aria-hidden="true"
        className="absolute -top-12 left-1/2 -translate-x-1/2 w-[600px] h-32 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.06) 0%, transparent 70%)' }}
      />

      {/* ── Sample request form ── */}
      <div className="relative border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Left: headline */}
            <div className="lg:col-span-2">
              <p className="text-gold text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
                <span className="opacity-40 mr-1.5">//</span>Free Sample
              </p>
              <h2 className="font-display font-extrabold text-white text-2xl sm:text-3xl uppercase leading-tight mb-3">
                Request a<br />Sample Box
              </h2>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs">
                Tell us which cars you collect. We&apos;ll send you a sample box so you can feel the quality before ordering.
              </p>
            </div>
            {/* Right: form */}
            <div className="lg:col-span-3">
              <SampleRequestForm />
            </div>
          </div>
        </div>
      </div>

      {/* ── footer body ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">

          {/* ── brand column ── */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center mb-4">
              <Image src="/logo.svg" alt="figbox.store" width={44} height={48} />
            </Link>

            <p className="text-white/40 text-sm leading-relaxed max-w-[220px]">
              Premium custom packaging for 1:64 diecast collectors. Designed with care, printed professionally.
            </p>
          </div>

          {/* ── Contact ── (moved before Shop) */}
          <div>
            <p className="font-display font-extrabold uppercase text-white/80 text-xs tracking-widest mb-4">
              Contact
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/35">
                <Location size={13} color="currentColor" variant="Bold" className="shrink-0 text-white/20 mt-0.5" />
                <span className="text-xs leading-relaxed">P.26, Bình Thạnh<br />TP. Hồ Chí Minh</span>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/figbox.gr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/40 hover:text-[#1877F2] transition-colors group"
                >
                  {/* Facebook icon — inline SVG, no extra dependency */}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-[#1877F2]/50 group-hover:text-[#1877F2]" aria-hidden="true">
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                  </svg>
                  <span className="text-sm">figbox.gr</span>
                </a>
              </li>
            </ul>
          </div>

          {/* ── Shop ── */}
          <div>
            <p className="font-display font-extrabold uppercase text-white/80 text-xs tracking-widest mb-4">
              Shop
            </p>
            <ul className="space-y-2.5">
              {SHOP_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-white/40 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Support ── */}
          <div>
            <p className="font-display font-extrabold uppercase text-white/80 text-xs tracking-widest mb-4">
              Support
            </p>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-white/40 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── bottom bar ── */}
      <div
        aria-hidden="true"
        className="h-px mx-4 sm:mx-6"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0.05) 70%, transparent)' }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="text-white/50 text-xs">
          © {new Date().getFullYear()} figbox.store · All rights reserved.
        </p>
        <div className="flex items-center gap-3">
          <p className="text-white/50 text-xs">
            Handmade for 1:64 collectors · Vietnam
          </p>
          <a
            href="#"
            aria-label="Back to top"
            className="w-7 h-7 rounded-full border border-white/[0.08] flex items-center justify-center text-white/20 hover:border-gold/30 hover:text-gold/50 transition-colors"
          >
            <ArrowUp2 size={12} color="currentColor" />
          </a>
        </div>
      </div>

    </footer>
  )
}
