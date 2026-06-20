import Image from 'next/image'
import type { CarBrand } from '@/lib/types'

const BRAND_LABELS: Record<CarBrand, string> = {
  nissan:      'Nissan',
  porsche:     'Porsche',
  lamborghini: 'Lamborghini',
  ferrari:     'Ferrari',
  mclaren:     'McLaren',
  bmw:         'BMW',
  toyota:      'Toyota',
  honda:       'Honda',
  mercedes:    'Mercedes',
  audi:        'Audi',
  other:       '',
}

// brands that have a logo file in public/brands/
const HAS_LOGO = new Set<CarBrand>([
  'porsche', 'nissan', 'bmw', 'ferrari', 'lamborghini', 'toyota', 'honda', 'audi', 'mclaren',
])

interface Props {
  brand: CarBrand
  /** height of the logo image in px */
  size?: number
  className?: string
}

export default function BrandLogo({ brand, size = 20, className = '' }: Props) {
  if (brand === 'other') return null

  if (HAS_LOGO.has(brand)) {
    return (
      <Image
        src={`/brands/${brand}.svg`}
        alt={BRAND_LABELS[brand]}
        width={size * 2}
        height={size}
        className={`object-contain ${className}`}
        style={{ height: size, width: 'auto', maxWidth: size * 2.5 }}
      />
    )
  }

  // Text fallback for Mercedes (no logo file yet)
  return (
    <span className={`text-[10px] font-semibold tracking-wide opacity-60 ${className}`}>
      {BRAND_LABELS[brand]}
    </span>
  )
}
