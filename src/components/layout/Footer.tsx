import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight2, Call, ArrowUp2 } from 'iconsax-react'

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

const CRAFT_BADGES = ['350gsm Stock', 'Laser Cut', 'Hand Folded', 'Nationwide Ship']

export default function Footer() {
  return (
    <footer className="bg-header mt-auto border-t border-white/[0.06]">

      {/* ── footer body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">

          {/* ── brand column ── */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center mb-4">
              <Image src="/logo.svg" alt="figbox.store" width={44} height={48} />
            </Link>

            <p className="text-white/40 text-sm leading-relaxed mb-5 max-w-[220px]">
              Premium custom packaging for 1:64 diecast collectors. Designed with care, printed professionally.
            </p>

            <a
              href="tel:+84901234567"
              className="inline-flex items-center gap-1.5 text-gold text-sm font-semibold hover:text-gold-mid transition-colors mb-5"
            >
              <Call size={14} color="currentColor" />
              0901 234 567
            </a>

            {/* craft signals */}
            <div className="flex flex-wrap gap-1.5">
              {CRAFT_BADGES.map(b => (
                <span
                  key={b}
                  className="text-[10px] font-bold uppercase tracking-wider text-white/25 border border-white/[0.08] px-2 py-0.5 rounded-full"
                >
                  {b}
                </span>
              ))}
            </div>
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

          {/* ── Contact ── */}
          <div>
            <p className="font-display font-extrabold uppercase text-white/80 text-xs tracking-widest mb-4">
              Contact
            </p>
            <ul className="space-y-2.5">
              <li>
                <a href="tel:+84901234567" className="text-white/40 hover:text-gold text-sm transition-colors">
                  0901 234 567
                </a>
              </li>
              <li>
                <a href="mailto:hello@figbox.store" className="text-white/40 hover:text-white text-sm transition-colors">
                  hello@figbox.store
                </a>
              </li>
              <li className="pt-1">
                <span className="text-white/50 text-xs leading-relaxed block">Mon–Sat · 9:00–21:00</span>
              </li>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-2">
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
