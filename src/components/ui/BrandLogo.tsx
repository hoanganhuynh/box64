import Image from 'next/image'
import type { CarBrand } from '@/lib/types'

// Monochrome brands: SVG paths use fill="currentColor" (black by default).
// On dark cards we apply brightness-0 + invert to flip them white.
// On light cards: no filter → stays black.
const MONOCHROME: Set<CarBrand> = new Set(['nissan', 'audi', 'ferrari', 'mclaren'])

// Brands with embedded brand colours — no filter needed on any background
const HAS_LOGO: Set<CarBrand> = new Set([
  'porsche', 'bmw', 'lamborghini', 'toyota', 'honda',
  'nissan', 'audi', 'ferrari', 'mclaren',
])

interface Props {
  brand: CarBrand
  size?: number
  /** Card background variant — flips monochrome logos white on dark */
  variant?: 'dark' | 'light'
  className?: string
}

export default function BrandLogo({ brand, size = 30, variant = 'dark', className = '' }: Props) {
  if (brand === 'other') return null

  if (brand === 'mercedes') {
    return <span className={`text-[10px] font-semibold tracking-wide opacity-60 ${className}`}>Mercedes</span>
  }

  if (!HAS_LOGO.has(brand)) return null

  const filterClass = MONOCHROME.has(brand) && variant === 'dark'
    ? 'brightness-0 invert'
    : ''

  return (
    <Image
      src={`/brands/${brand}.svg`}
      alt={brand}
      width={size * 2}
      height={size}
      className={`object-contain shrink-0 ${filterClass} ${className}`.trim()}
      style={{ height: size, width: 'auto', maxWidth: size * 2.5 }}
    />
  )
}
