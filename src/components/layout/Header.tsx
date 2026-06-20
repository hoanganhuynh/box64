'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'
import { useEffect, useState } from 'react'
import { Bag2, ProfileCircle, HambergerMenu, CloseSquare } from 'iconsax-react'

const FB_HREF = 'https://www.facebook.com/figbox.gr'

function FbIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  )
}

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
            {menuOpen ? <CloseSquare size={22} color="currentColor" /> : <HambergerMenu size={22} color="currentColor" />}
          </button>
        </div>

        {/* Center: logo */}
        <div className="flex justify-center">
          <Link href="/" aria-label="figbox.store — home">
            <Image src="/logo.svg" alt="figbox.store" width={37} height={40} priority />
          </Link>
        </div>

        {/* Right: contact + login + cart */}
        <div className="flex items-center justify-end gap-1">
          {/* Desktop: Contact → Facebook */}
          <a
            href={FB_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact us on Facebook"
            className="hidden md:flex items-center gap-1.5 text-sm text-white/70 hover:text-gold transition-colors font-semibold mr-2"
          >
            <FbIcon size={15} /> Contact
          </a>
          <Link
            href="/login"
            aria-label="Login"
            className="hidden md:flex items-center gap-1.5 text-sm text-white/70 hover:text-gold transition-colors font-semibold mr-1"
          >
            <ProfileCircle size={17} color="currentColor" /> Login
          </Link>

          {/* Mobile: Contact icon → Facebook */}
          <a
            href={FB_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact us on Facebook"
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-sm hover:bg-white/10 transition-colors text-white/55 hover:text-gold"
          >
            <FbIcon size={18} />
          </a>

          <CartBadge />
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <nav aria-label="Mobile navigation" className="md:hidden border-t border-white/[0.05] bg-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-col">
            <Link href="/shop" onClick={() => setMenuOpen(false)}
              className="py-4 px-3 text-base font-semibold text-white/75 hover:text-white hover:bg-white/5 rounded-sm transition-colors border-b border-white/[0.05]">
              Shop
            </Link>
            <Link href="/track" onClick={() => setMenuOpen(false)}
              className="py-4 px-3 text-base font-semibold text-white/75 hover:text-white hover:bg-white/5 rounded-sm transition-colors border-b border-white/[0.05]">
              Track Order
            </Link>
            <Link href="/login" onClick={() => setMenuOpen(false)}
              className="py-4 px-3 text-base font-semibold text-white/75 hover:text-white hover:bg-white/5 rounded-sm transition-colors border-b border-white/[0.05] flex items-center gap-2.5">
              <ProfileCircle size={18} color="currentColor" /> Login
            </Link>
            <a
              href="https://www.facebook.com/figbox.gr"
              target="_blank"
              rel="noopener noreferrer"
              className="py-4 px-3 text-base font-semibold text-gold/80 hover:text-gold hover:bg-white/5 rounded-sm transition-colors flex items-center gap-2.5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              Contact
            </a>
          </div>
        </nav>
      )}
    </header>
  )
}
