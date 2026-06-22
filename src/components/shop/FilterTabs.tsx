'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { CarBrand } from '@/lib/types'

const CATEGORY_TABS = [
  { label: 'All',            value: '' },
  { label: 'Box Custom',     value: 'box_custom' },
  { label: 'Water Decal',    value: 'water_decal' },
  { label: '3D Accessories', value: 'accessory_3d' },
  { label: 'On Sale',        value: 'sale' },
  { label: 'Pre-order',      value: 'pre_order' },
]

const BRAND_OPTIONS: { label: string; value: CarBrand }[] = [
  { label: 'Porsche',     value: 'porsche' },
  { label: 'Nissan',      value: 'nissan' },
  { label: 'Lamborghini', value: 'lamborghini' },
  { label: 'Ferrari',     value: 'ferrari' },
  { label: 'BMW',         value: 'bmw' },
  { label: 'Toyota',      value: 'toyota' },
]

function buildHref(params: URLSearchParams, key: string, value: string) {
  const next = new URLSearchParams(params.toString())
  if (value) next.set(key, value)
  else next.delete(key)
  next.delete('sort')
  const qs = next.toString()
  return `/shop${qs ? `?${qs}` : ''}`
}

// ── Brand logos (inline SVG, monochrome, ~14px) ───────────────────────────────

function BrandLogo({ brand, size = 14 }: { brand: string; size?: number }) {
  if (brand === 'bmw') return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9.2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="6.3" stroke="currentColor" strokeWidth="0.6" opacity="0.4"/>
      <line x1="10" y1="0.8" x2="10" y2="19.2" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="0.8" y1="10" x2="19.2" y2="10" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 0.8 A9.2 9.2 0 0 1 19.2 10 L10 10 Z" fill="currentColor" opacity="0.35"/>
      <path d="M10 19.2 A9.2 9.2 0 0 1 0.8 10 L10 10 Z" fill="currentColor" opacity="0.35"/>
    </svg>
  )

  if (brand === 'toyota') return (
    <svg width={size} height={Math.round(size * 0.72)} viewBox="0 0 25 18" fill="none" aria-hidden="true">
      <ellipse cx="12.5" cy="9" rx="12" ry="8.5" stroke="currentColor" strokeWidth="1.5"/>
      <ellipse cx="12.5" cy="9" rx="4.8" ry="8.5" stroke="currentColor" strokeWidth="1.5"/>
      <ellipse cx="12.5" cy="9" rx="9.5" ry="3.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )

  if (brand === 'nissan') return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9.2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="1.5" y="8.2" width="17" height="3.6" fill="currentColor" opacity="0.2"/>
      <line x1="1.5" y1="8.2" x2="18.5" y2="8.2" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="1.5" y1="11.8" x2="18.5" y2="11.8" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  )

  if (brand === 'porsche') return (
    // Porsche crest — shield + antlers + cross divider
    <svg width={Math.round(size * 0.75)} height={size} viewBox="0 0 15 20" fill="none" aria-hidden="true">
      <path d="M7.5 1.5 L14 5 L14 12.5 Q14 18 7.5 20 Q1 18 1 12.5 L1 5 Z" stroke="currentColor" strokeWidth="1.3"/>
      <line x1="7.5" y1="1.5" x2="7.5" y2="20" stroke="currentColor" strokeWidth="0.8" opacity="0.45"/>
      <line x1="1" y1="10.5" x2="14" y2="10.5" stroke="currentColor" strokeWidth="0.8" opacity="0.45"/>
      {/* Antlers top */}
      <path d="M4 3.5 L4 7 M7.5 1.5 L7.5 7 M11 3.5 L11 7" stroke="currentColor" strokeWidth="1.1" opacity="0.75"/>
    </svg>
  )

  if (brand === 'ferrari') return (
    // Ferrari prancing horse (simplified silhouette facing right)
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="
        M9 3.5
        C10 2.5 12.5 2.5 13 4.5
        C13.5 6 12 7.5 10.5 7.5
        L11.5 9.5
        C12.5 10.5 13.5 12 13 14
        L12.5 14 L12.5 12
        C12 13.5 11.5 15 11.5 17
        L10 17 L10 15
        C9.5 14 9 13 8.5 12.5
        L8 14 L6.5 14
        C6 12 7 10 8.5 9.5
        L8.5 7.5
        C7 7.5 5.5 6.5 6 4.5
        C6.5 2.5 8 2.5 9 3.5 Z
      " opacity="0.9"/>
    </svg>
  )

  if (brand === 'lamborghini') return (
    // Lamborghini charging bull (simplified head/horns silhouette)
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="
        M3 5.5 L2 3 L5 4
        C6 2.5 8 1.5 10 1.5
        C12 1.5 14 2.5 15 4
        L18 3 L17 5.5
        C18.5 7 19 9.5 18 11.5
        L16 14.5 L16 18 L13 18 L13 15.5
        L10 17 L7 15.5 L7 18 L4 18 L4 14.5
        L2 11.5
        C1 9.5 1.5 7 3 5.5 Z
      " opacity="0.9"/>
    </svg>
  )

  return null
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FilterTabs() {
  const params = useSearchParams()
  const activeType = params.get('type') ?? ''
  const activeBrand = params.get('brand') ?? ''

  return (
    <div className="flex flex-col gap-3">
      {/* Category row — single scrollable line */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none [-webkit-overflow-scrolling:touch] pb-0.5">
        {CATEGORY_TABS.map(tab => {
          const isActive = activeType === tab.value
          const href = buildHref(params, 'type', tab.value)
          return (
            <Link
              key={tab.value}
              href={href}
              className={`h-9 px-3.5 rounded-sm text-xs font-semibold transition-colors inline-flex items-center whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-gold text-[#09090F]'
                  : 'bg-surface border border-border text-muted hover:border-gold/40 hover:text-primary'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Brand row — single scrollable line with logos */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none [-webkit-overflow-scrolling:touch] pb-0.5">
        {/* All Brands pill */}
        <Link
          href={buildHref(params, 'brand', '')}
          className={`h-7 px-3 rounded-full text-[11px] font-medium transition-colors inline-flex items-center whitespace-nowrap shrink-0 ${
            !activeBrand
              ? 'bg-white/10 text-primary'
              : 'text-muted hover:text-primary'
          }`}
        >
          All Brands
        </Link>

        {BRAND_OPTIONS.map(b => {
          const isActive = activeBrand === b.value
          return (
            <Link
              key={b.value}
              href={buildHref(params, 'brand', b.value)}
              className={`h-7 px-3 rounded-full text-[11px] font-medium transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-white/10 text-primary border border-gold/30'
                  : 'text-faint hover:text-muted'
              }`}
            >
              <span className={isActive ? 'text-gold' : 'text-white/30'}>
                <BrandLogo brand={b.value} size={14} />
              </span>
              {b.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
