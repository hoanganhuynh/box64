'use client'
import Link from 'next/link'
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
      aria-label={`Giỏ hàng${count > 0 ? ` — ${count} sản phẩm` : ''}`}
      className="relative w-9 h-9 flex items-center justify-center rounded-sm hover:bg-white/10 transition-colors text-white/70 hover:text-white"
    >
      <Bag2 size={20} color="currentColor" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-gold rounded-full text-[9px] font-bold text-[#07070C] flex items-center justify-center leading-none px-[3px]">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-header border-b border-white/8 backdrop-blur-sm">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="hidden md:block border-b border-white/6 bg-[#040408]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-8 flex items-center justify-end gap-5">
          <a
            href={PHONE_HREF}
            aria-label={`Hotline: ${PHONE}`}
            className="flex items-center gap-1.5 text-[11px] text-white/45 hover:text-gold transition-colors font-medium"
          >
            <Call size={11} color="currentColor" /> {PHONE}
          </a>
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-[11px] text-white/45 hover:text-gold transition-colors font-medium"
          >
            <ProfileCircle size={12} color="currentColor" /> Đăng nhập
          </Link>
        </div>
      </div>

      {/* ── Main nav ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4" style={{ height: '58px' }}>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-0 shrink-0" aria-label="figbox.store — trang chủ">
          <span className="font-jakarta font-black text-white text-xl tracking-tight">fig</span>
          <span className="font-jakarta font-black text-gold text-xl tracking-tight">box</span>
          <span className="font-jakarta font-light text-white/40 text-sm tracking-tight ml-0.5">.store</span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Điều hướng chính" className="hidden md:flex items-center gap-6">
          <Link href="/shop" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
            Shop
          </Link>
          <Link href="/track" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
            Theo dõi đơn
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <a
            href={PHONE_HREF}
            aria-label="Hotline"
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-sm hover:bg-white/10 transition-colors text-white/55 hover:text-gold"
          >
            <Call size={18} color="currentColor" />
          </a>
          <Link
            href="/login"
            aria-label="Đăng nhập"
            className="hidden sm:flex md:hidden w-9 h-9 items-center justify-center rounded-sm hover:bg-white/10 transition-colors text-white/55 hover:text-gold"
          >
            <ProfileCircle size={19} color="currentColor" />
          </Link>

          <CartBadge />

          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={menuOpen}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-sm hover:bg-white/10 transition-colors text-white/60"
          >
            {menuOpen
              ? <CloseSquare size={19} color="currentColor" />
              : <HambergerMenu size={19} color="currentColor" />
            }
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ───────────────────────────────────────── */}
      {menuOpen && (
        <nav aria-label="Mobile navigation" className="md:hidden border-t border-white/8 bg-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-1">
            <Link href="/shop" onClick={() => setMenuOpen(false)}
              className="py-2.5 px-3 text-sm font-medium text-white/65 hover:text-white hover:bg-white/5 rounded-sm transition-colors">
              Shop
            </Link>
            <Link href="/track" onClick={() => setMenuOpen(false)}
              className="py-2.5 px-3 text-sm font-medium text-white/65 hover:text-white hover:bg-white/5 rounded-sm transition-colors">
              Theo dõi đơn hàng
            </Link>
            <Link href="/login" onClick={() => setMenuOpen(false)}
              className="py-2.5 px-3 text-sm font-medium text-white/65 hover:text-white hover:bg-white/5 rounded-sm transition-colors flex items-center gap-2">
              <ProfileCircle size={15} color="currentColor" /> Đăng nhập
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
