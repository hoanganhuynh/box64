'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'
import { useEffect, useRef, useState } from 'react'
import { Bag2, ProfileCircle, HambergerMenu, CloseSquare, LogoutCurve, SearchNormal1, Gift } from 'iconsax-react'
import type { User } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase/client'
import SearchBox from '@/components/shop/SearchBox'

function CartBadge() {
  const count = useCartStore(s => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <Link
      href="/cart"
      data-cart-icon
      aria-label={`Cart${mounted && count > 0 ? ` — ${count} items` : ''}`}
      className="relative w-11 h-11 flex items-center justify-center rounded-sm hover:bg-white/10 transition-colors text-white/65 hover:text-white"
    >
      <Bag2 size={20} color="currentColor" />
      {mounted && count > 0 && (
        <span data-cart-badge className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-gold rounded-full text-[9px] font-bold text-[#07070C] flex items-center justify-center leading-none px-[3px]">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}

function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const avatar = user.user_metadata?.avatar_url as string | undefined
  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? ''
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleSignOut() {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    setOpen(false)
    window.location.href = '/'
  }

  const firstName = name.split(' ')[0]

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
      >
        <span className="text-sm text-white/60 font-medium">Xin chào, <span className="text-white font-semibold">{firstName}</span></span>
        <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/20 hover:ring-gold/60 transition-all shrink-0">
          {avatar
            ? <Image src={avatar} alt={name} width={32} height={32} className="object-cover w-full h-full" />
            : <span className="w-full h-full bg-surface-2 flex items-center justify-center text-[10px] font-bold text-gold">{initials}</span>
          }
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-52 bg-surface border border-border rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden z-50">
          <div className="px-4 pt-3.5 pb-3 border-b border-border">
            <p className="text-[11px] text-white/40 truncate">{user.email}</p>
            <p className="text-sm font-semibold text-white truncate mt-0.5">{name || 'Member'}</p>
          </div>
          <div className="py-1.5">
            <Link
              href="/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Bag2 size={15} color="currentColor" />
              My Orders
            </Link>
            <Link
              href="/referral"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Gift size={15} color="currentColor" />
              Mời bạn bè
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error/80 hover:text-error hover:bg-error/5 transition-colors"
            >
              <LogoutCurve size={15} color="currentColor" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function useAuthUser() {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return { user, ready }
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { user, ready } = useAuthUser()

  function openMenu() {
    setMenuOpen(true)
    setSearchOpen(false)
  }

  function openSearch() {
    setSearchOpen(true)
    setMenuOpen(false)
  }

  async function handleLogin() {
    const supabase = createSupabaseClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function handleMobileSignOut() {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    setMenuOpen(false)
    window.location.href = '/'
  }

  const avatar = user?.user_metadata?.avatar_url as string | undefined
  const name = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? ''

  return (
    <header className="sticky top-0 z-50 bg-header border-b border-border">
      {/* ── Main row ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-3 items-center" style={{ height: '56px' }}>

        {/* Left: desktop nav / mobile hamburger */}
        <div className="flex items-center">
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
            <Link href="/shop" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Shop
            </Link>
            <Link href="/track" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Track Order
            </Link>
          </nav>

          <button
            onClick={() => menuOpen ? setMenuOpen(false) : openMenu()}
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

        {/* Right: search + cart + auth */}
        <div className="flex items-center justify-end gap-1">

          {/* Desktop search box */}
          <div className="hidden md:block mr-1">
            <SearchBox inputClassName="w-[180px]" dropdownClassName="w-[300px]" />
          </div>

          {/* Mobile search icon */}
          <button
            onClick={() => searchOpen ? setSearchOpen(false) : openSearch()}
            aria-label={searchOpen ? 'Close search' : 'Open search'}
            className="md:hidden w-9 h-11 flex items-center justify-center hover:bg-white/10 transition-colors text-white/55 hover:text-gold"
          >
            {searchOpen
              ? <svg width="17" height="17" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M1 1l8 8M9 1L1 9"/></svg>
              : <SearchNormal1 size={18} color="currentColor" />
            }
          </button>

          <CartBadge />

          {ready && (
            user
              ? <UserMenu user={user} />
              : (
                <button
                  onClick={handleLogin}
                  aria-label="Login"
                  className="hidden md:flex items-center gap-1.5 text-sm text-white/70 hover:text-gold transition-colors font-semibold ml-1"
                >
                  <ProfileCircle size={17} color="currentColor" /> Login
                </button>
              )
          )}
        </div>
      </div>

      {/* ── Mobile search panel ── */}
      {searchOpen && (
        <div className="md:hidden border-t border-white/[0.05] bg-header px-4 py-3">
          <SearchBox
            onNavigate={() => setSearchOpen(false)}
            containerClassName="w-full"
            inputClassName="w-full"
            dropdownClassName="w-full left-0 right-0"
            autoFocus
          />
        </div>
      )}

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

            {user ? (
              <>
                <div className="py-3.5 px-3 flex items-center gap-3 border-b border-white/[0.05]">
                  {avatar
                    ? <Image src={avatar} alt={name} width={32} height={32} className="rounded-full object-cover shrink-0 ring-1 ring-white/20" />
                    : <span className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-[11px] font-bold text-gold shrink-0">{name[0]?.toUpperCase()}</span>
                  }
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{name || 'Member'}</p>
                    <p className="text-[11px] text-white/40 truncate">{user.email}</p>
                  </div>
                </div>
                <Link href="/orders" onClick={() => setMenuOpen(false)}
                  className="py-4 px-3 text-base font-semibold text-white/75 hover:text-white hover:bg-white/5 rounded-sm transition-colors border-b border-white/[0.05] flex items-center gap-2.5">
                  <Bag2 size={18} color="currentColor" /> My Orders
                </Link>
                <Link href="/referral" onClick={() => setMenuOpen(false)}
                  className="py-4 px-3 text-base font-semibold text-white/75 hover:text-white hover:bg-white/5 rounded-sm transition-colors border-b border-white/[0.05] flex items-center gap-2.5">
                  <Gift size={18} color="currentColor" /> Mời bạn bè
                </Link>
                <button onClick={handleMobileSignOut}
                  className="py-4 px-3 text-base font-semibold text-error/80 hover:text-error hover:bg-error/5 rounded-sm transition-colors flex items-center gap-2.5 w-full text-left">
                  <LogoutCurve size={18} color="currentColor" /> Sign out
                </button>
              </>
            ) : (
              <button onClick={() => { setMenuOpen(false); handleLogin() }}
                className="py-4 px-3 text-base font-semibold text-white/75 hover:text-white hover:bg-white/5 rounded-sm transition-colors border-b border-white/[0.05] flex items-center gap-2.5 w-full text-left">
                <ProfileCircle size={18} color="currentColor" /> Login
              </button>
            )}

            <a
              href="https://www.facebook.com/figbox.gr"
              target="_blank"
              rel="noopener noreferrer"
              className="py-4 px-3 text-base font-semibold text-gold/80 hover:text-gold hover:bg-white/5 rounded-sm transition-colors flex items-center gap-2.5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              Facebook
            </a>
          </div>
        </nav>
      )}
    </header>
  )
}
