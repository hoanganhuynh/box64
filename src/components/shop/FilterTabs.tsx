'use client'
import Link from 'next/link'
import Image from 'next/image'
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

const BRAND_LOGO_FILE: Record<string, string> = {
  porsche:     '/car-brand/Porsche.png',
  nissan:      '/car-brand/Nissan.png',
  lamborghini: '/car-brand/Lamborghini.png',
  ferrari:     '/car-brand/Ferrari.png',
  bmw:         '/car-brand/bmw.png',
  toyota:      '/car-brand/toyota.png',
}

function BrandLogo({ brand, size = 28, active = false }: { brand: string; size?: number; active?: boolean }) {
  const src = BRAND_LOGO_FILE[brand]
  if (!src) return null
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className={`object-contain transition-opacity ${active ? 'opacity-100' : 'opacity-70'}`}
    />
  )
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
      <div className="flex gap-2 overflow-x-auto scrollbar-none [-webkit-overflow-scrolling:touch] pb-0.5">
        {/* All Brands pill */}
        <Link
          href={buildHref(params, 'brand', '')}
          className={`h-10 px-4 rounded-full text-xs font-medium transition-colors inline-flex items-center whitespace-nowrap shrink-0 ${
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
              className={`h-10 px-4 rounded-full text-xs font-medium transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-white/10 text-primary border border-gold/30'
                  : 'text-primary/85 hover:text-primary'
              }`}
            >
              <BrandLogo brand={b.value} size={28} active={isActive} />
              {b.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
