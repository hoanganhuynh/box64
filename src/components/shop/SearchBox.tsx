'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { SearchNormal1 } from 'iconsax-react'
import { DUMMY_PRODUCTS, getDiscountedPrice } from '@/lib/data/products'
import type { Product } from '@/lib/types'

function searchProducts(q: string): Product[] {
  if (!q.trim()) return []
  const lower = q.toLowerCase()
  return DUMMY_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    (p.brand ?? '').toLowerCase().includes(lower) ||
    (p.tags ?? []).some(t => t.toLowerCase().includes(lower)) ||
    (p.description ?? '').toLowerCase().includes(lower)
  ).slice(0, 6)
}

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + ' ₫'
}

interface SearchBoxProps {
  onNavigate?: () => void
  inputClassName?: string
  dropdownClassName?: string
  autoFocus?: boolean
}

export default function SearchBox({
  onNavigate,
  inputClassName,
  dropdownClassName,
  autoFocus,
}: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) setTimeout(() => inputRef.current?.focus(), 60)
  }, [autoFocus])

  useEffect(() => {
    const timer = setTimeout(() => {
      const found = searchProducts(query)
      setResults(found)
      setOpen(query.trim().length > 0)
    }, 150)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function go(href: string) {
    setOpen(false)
    setQuery('')
    onNavigate?.()
    router.push(href)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && query.trim()) {
      go(`/search?q=${encodeURIComponent(query.trim())}`)
    }
    if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Input pill */}
      <div
        className={`flex items-center gap-1.5 bg-white/[0.07] border border-white/[0.08] rounded-sm px-2.5 h-8 focus-within:border-gold/50 focus-within:bg-white/[0.10] transition-all ${inputClassName ?? 'w-[180px]'}`}
      >
        <SearchNormal1 size={13} color="rgba(255,255,255,0.38)" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="bg-transparent flex-1 text-[13px] text-white/90 placeholder:text-white/30 outline-none min-w-0"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus() }}
            className="text-white/30 hover:text-white/70 transition-colors shrink-0"
            aria-label="Clear search"
          >
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M1 1l8 8M9 1L1 9" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute right-0 top-[calc(100%+8px)] bg-[#0D0D17] border border-[#1C1C26] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.75)] overflow-hidden z-[60] ${dropdownClassName ?? 'w-[300px]'}`}
        >
          {results.length > 0 ? (
            <>
              <div className="px-3 pt-2.5 pb-1">
                <p className="text-[10px] font-bold tracking-[0.15em] text-white/25 uppercase">
                  Products
                </p>
              </div>

              {results.map(p => {
                const discounted = getDiscountedPrice(p)
                const hasDiscount = discounted < p.price
                return (
                  <Link
                    key={p.id}
                    href={`/shop/${p.slug}`}
                    onClick={() => { setOpen(false); setQuery(''); onNavigate?.() }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-[#1C1C26]">
                      {p.images[0] && (
                        <Image
                          src={p.images[0]}
                          alt=""
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-white/85 leading-snug line-clamp-2">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-bold text-gold">{formatVND(discounted)}</span>
                        {hasDiscount && (
                          <span className="text-[10px] text-white/30 line-through">{formatVND(p.price)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}

              <div className="border-t border-[#1C1C26] px-3 py-2.5">
                <button
                  onClick={() => go(`/search?q=${encodeURIComponent(query.trim())}`)}
                  className="text-[11px] text-gold/70 hover:text-gold transition-colors font-medium"
                >
                  See all results for &ldquo;{query}&rdquo; →
                </button>
              </div>
            </>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-[12px] text-white/35">No products found for &ldquo;{query}&rdquo;</p>
              <p className="text-[11px] text-white/20 mt-1">Try a different keyword</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
