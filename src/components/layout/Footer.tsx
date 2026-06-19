import Link from 'next/link'
import { Call } from 'iconsax-react'

export default function Footer() {
  return (
    <footer className="bg-header border-t border-white/8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-0 mb-3">
              <span className="font-jakarta font-black text-white text-lg">fig</span>
              <span className="font-jakarta font-black text-gold text-lg">box</span>
              <span className="font-jakarta font-light text-white/35 text-sm ml-0.5">.store</span>
            </Link>
            <p className="text-white/45 text-sm leading-relaxed mb-4">
              Premium custom packaging for 1:64 diecast model cars. Designed with care, printed professionally.
            </p>
            <a
              href="tel:+84901234567"
              className="inline-flex items-center gap-1.5 text-gold text-sm font-semibold hover:text-gold-mid transition-colors"
            >
              <Call size={14} color="currentColor" /> 0901 234 567
            </a>
          </div>

          <div>
            <p className="text-white/70 font-semibold text-sm mb-3">Shop</p>
            <ul className="space-y-2">
              <li><Link href="/shop" className="text-white/40 hover:text-white text-sm transition-colors">All Products</Link></li>
              <li><Link href="/shop?type=sale" className="text-white/40 hover:text-white text-sm transition-colors">On Sale</Link></li>
              <li><Link href="/cart" className="text-white/40 hover:text-white text-sm transition-colors">Cart</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-white/70 font-semibold text-sm mb-3">Support</p>
            <ul className="space-y-2">
              <li><Link href="/track" className="text-white/40 hover:text-white text-sm transition-colors">Track Order</Link></li>
              <li><Link href="/login" className="text-white/40 hover:text-white text-sm transition-colors">Account</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-white/70 font-semibold text-sm mb-3">Contact</p>
            <ul className="space-y-2 text-sm">
              <li><a href="tel:+84901234567" className="text-white/40 hover:text-gold transition-colors">0901 234 567</a></li>
              <li><a href="mailto:hello@figbox.store" className="text-white/40 hover:text-white transition-colors">hello@figbox.store</a></li>
              <li className="text-white/25 text-xs leading-relaxed pt-1">Mon–Sat · 9:00–21:00</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/6 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-white/25 text-xs">© {new Date().getFullYear()} figbox.store. All rights reserved.</p>
          <p className="text-white/25 text-xs">Handmade for 1:64 collectors</p>
        </div>
      </div>
    </footer>
  )
}
