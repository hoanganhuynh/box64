import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight2 } from 'iconsax-react'
import { DUMMY_PRODUCTS, getDiscountedPrice } from '@/lib/data/products'
import ProductCard from '@/components/shop/ProductCard'
import type { Product } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q = '' } = await searchParams
  return {
    title: q ? `"${q}" — figbox.store` : 'Search — figbox.store',
    robots: { index: false },
  }
}

function searchProducts(q: string): Product[] {
  if (!q.trim()) return []
  const lower = q.toLowerCase()
  return DUMMY_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    (p.brand ?? '').toLowerCase().includes(lower) ||
    (p.tags ?? []).some(t => t.toLowerCase().includes(lower)) ||
    (p.description ?? '').toLowerCase().includes(lower)
  )
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams
  const results = searchProducts(q)

  const resultIds = new Set(results.map(p => p.id))
  const suggestions = DUMMY_PRODUCTS
    .filter(p => !resultIds.has(p.id) && p.status === 'active')
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* ── Header ── */}
        <div className="mb-8 sm:mb-10">
          {q ? (
            <>
              <p className="text-gold text-xs font-bold tracking-[0.2em] uppercase mb-2.5">
                <span className="opacity-40 mr-1.5 tracking-[0.05em]">//</span>Search Results
              </p>
              <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl leading-tight">
                &ldquo;{q}&rdquo;
              </h1>
              <p className="text-white/35 text-sm mt-2">
                {results.length > 0
                  ? `${results.length} product${results.length !== 1 ? 's' : ''} found`
                  : 'No products found'}
              </p>
            </>
          ) : (
            <>
              <p className="text-gold text-xs font-bold tracking-[0.2em] uppercase mb-2.5">
                <span className="opacity-40 mr-1.5 tracking-[0.05em]">//</span>Search
              </p>
              <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl">
                Find your box
              </h1>
            </>
          )}
        </div>

        {/* ── Results grid ── */}
        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {results.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : q ? (
          <div className="py-20 text-center border border-border rounded-xl">
            <p className="font-display font-extrabold text-white/10 text-6xl mb-4">∅</p>
            <p className="text-white/50 text-base font-semibold">No results for &ldquo;{q}&rdquo;</p>
            <p className="text-white/25 text-sm mt-2 mb-7">Try another keyword or browse our shop</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 h-10 px-6 rounded-sm bg-gold text-[#07070C] font-bold text-sm hover:bg-gold-mid transition-colors"
            >
              Browse all boxes <ArrowRight2 size={14} color="currentColor" />
            </Link>
          </div>
        ) : (
          <div className="py-16 text-center border border-border rounded-xl">
            <p className="text-white/25 text-sm">Use the search bar above to find products</p>
          </div>
        )}

        {/* ── You may also like ── */}
        {suggestions.length > 0 && (
          <section className="mt-16 pt-4">
            <div className="flex items-end justify-between mb-7">
              <div>
                <p className="text-gold text-xs font-bold tracking-widest uppercase mb-1">
                  <span className="opacity-40 mr-1.5">◆</span>Explore
                </p>
                <h2 className="font-display font-extrabold text-white text-2xl sm:text-3xl">
                  You May Also Like
                </h2>
              </div>
              <Link
                href="/shop"
                className="flex items-center gap-1 text-sm font-medium text-gold hover:text-gold-mid transition-colors"
              >
                View all <ArrowRight2 size={14} color="currentColor" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {suggestions.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
