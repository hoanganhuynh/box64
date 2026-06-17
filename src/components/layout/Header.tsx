'use client'
import Link from 'next/link'
import { ShoppingCart, Box } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-header border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm bg-gold flex items-center justify-center">
            <Box size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-jakarta font-extrabold text-white text-lg tracking-tight">
            Box<span className="text-gold">64</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/shop" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Shop
          </Link>
          <Link href="/designer" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Design Your Box
          </Link>
          <Link href="/track" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Track Order
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            aria-label="cart"
            className="relative w-10 h-10 flex items-center justify-center rounded-sm hover:bg-white/10 transition-colors text-white"
          >
            <ShoppingCart size={20} />
            {/* Badge wired to Zustand in Plan 4 */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full text-[10px] font-bold text-white flex items-center justify-center leading-none">
              0
            </span>
          </button>
        </div>

      </div>
    </header>
  )
}
