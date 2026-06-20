'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'
import { useEffect, useState } from 'react'
import { Bag2, Call, ProfileCircle, HambergerMenu, CloseSquare } from 'iconsax-react'

const PHONE = '0901 234 567'
const PHONE_HREF = 'tel:+84901234567'

function CartBadge() {
  const totalItems = useCartStore(s => s.totalItems)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const count = mounted ? totalItems() : 0

  return (
    <Link
      href="/cart"
      data-cart-icon
      aria-label={`Cart${count > 0 ? ` — ${count} items` : ''}`}
      className="relative w-11 h-11 flex items-center justify-center rounded-sm hover:bg-white/10 transition-colors text-white/65 hover:text-white"
    >
      <Bag2 size={20} color="currentColor" />
      {count > 0 && (
        <span data-cart-badge className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-gold rounded-full text-[9px] font-bold text-[#07070C] flex items-center justify-center leading-none px-[3px]">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-header border-b border-border">
      {/* ── Main row: 3-col grid [nav | logo | actions] ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-3 items-center" style={{ height: '56px' }}>

        {/* Left: desktop nav / mobile hamburger */}
        <div className="flex items-center">
          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
            <Link href="/shop" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Shop
            </Link>
            <Link href="/track" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Track Order
            </Link>
          </nav>

          {/* Mobile: hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-sm hover:bg-white/10 transition-colors text-white/60"
          >
            {menuOpen ? <CloseSquare size={19} color="currentColor" /> : <HambergerMenu size={19} color="currentColor" />}
          </button>
        </div>

        {/* Center: logo */}
        <div className="flex justify-center">
          <Link href="/" aria-label="figbox.store — home">
            <Image src="/logo.svg" alt="figbox.store" width={37} height={40} priority />
          </Link>
        </div>

        {/* Right: phone + login + cart */}
        <div className="flex items-center justify-end gap-1">
          <a
            href={PHONE_HREF}
            aria-label="Call us"
            className="hidden md:flex items-center gap-1.5 text-sm text-white/70 hover:text-gold transition-colors font-semibold mr-2"
          >
            <Call size={15} color="currentColor" /> {PHONE}
          </a>
          <Link
            href="/login"
            aria-label="Login"
            className="hidden md:flex items-center gap-1.5 text-sm text-white/70 hover:text-gold transition-colors font-semibold mr-1"
          >
            <ProfileCircle size={17} color="currentColor" /> Login
          </Link>

          {/* Mobile: phone icon */}
          <a href={PHONE_HREF} className="md:hidden w-11 h-11 flex items-center justify-center rounded-sm hover:bg-white/10 transition-colors text-white/55 hover:text-gold">
            <Call size={18} color="currentColor" />
          </a>

          <CartBadge />
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <nav aria-label="Mobile navigation" className="md:hidden border-t border-border bg-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-1">
            <Link href="/shop" onClick={() => setMenuOpen(false)}
              className="py-2.5 px-3 text-sm font-medium text-white/65 hover:text-white hover:bg-white/5 rounded-sm transition-colors">Shop</Link>
            <Link href="/track" onClick={() => setMenuOpen(false)}
              className="py-2.5 px-3 text-sm font-medium text-white/65 hover:text-white hover:bg-white/5 rounded-sm transition-colors">Track Order</Link>
            <Link href="/login" onClick={() => setMenuOpen(false)}
              className="py-2.5 px-3 text-sm font-medium text-white/65 hover:text-white hover:bg-white/5 rounded-sm transition-colors flex items-center gap-2">
              <ProfileCircle size={15} color="currentColor" /> Login
            </Link>
            <a href={PHONE_HREF}
              className="py-2.5 px-3 text-sm font-medium text-gold/80 hover:text-gold hover:bg-white/5 rounded-sm transition-colors flex items-center gap-2">
              <Call size={14} color="currentColor" /> {PHONE}
            </a>
          </div>
        </nav>
      )}
    </header>
  )
}
