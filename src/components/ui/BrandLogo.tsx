import type { FC, SVGProps } from 'react'
import type { CarBrand } from '@/lib/types'

// Static imports — SVGR converts each file to a React component
// Monochrome logos (nissan, audi, ferrari, mclaren) use fill="currentColor"
// Coloured logos keep their own brand colours
import NissanLogo     from '../../../public/brands/nissan.svg'
import AudiLogo       from '../../../public/brands/audi.svg'
import FerrariLogo    from '../../../public/brands/ferrari.svg'
import McLarenLogo    from '../../../public/brands/mclaren.svg'
import PorscheLogo    from '../../../public/brands/porsche.svg'
import BmwLogo        from '../../../public/brands/bmw.svg'
import LamborghiniLogo from '../../../public/brands/lamborghini.svg'
import ToyotaLogo     from '../../../public/brands/toyota.svg'
import HondaLogo      from '../../../public/brands/honda.svg'

type SvgComp = FC<SVGProps<SVGSVGElement>>

const LOGOS: Partial<Record<CarBrand, SvgComp>> = {
  nissan:      NissanLogo      as SvgComp,
  audi:        AudiLogo        as SvgComp,
  ferrari:     FerrariLogo     as SvgComp,
  mclaren:     McLarenLogo     as SvgComp,
  porsche:     PorscheLogo     as SvgComp,
  bmw:         BmwLogo         as SvgComp,
  lamborghini: LamborghiniLogo as SvgComp,
  toyota:      ToyotaLogo      as SvgComp,
  honda:       HondaLogo       as SvgComp,
}

// Brands whose SVGs use fill="currentColor" — CSS color controls them
const MONOCHROME: Set<CarBrand> = new Set(['nissan', 'audi', 'ferrari', 'mclaren'])

interface Props {
  brand: CarBrand
  size?: number
  /** Card background — controls text-color for monochrome logos */
  variant?: 'dark' | 'light'
  className?: string
}

export default function BrandLogo({ brand, size = 30, variant = 'dark', className = '' }: Props) {
  if (brand === 'other') return null

  if (brand === 'mercedes') {
    return <span className={`text-[10px] font-semibold tracking-wide opacity-60 ${className}`}>Mercedes</span>
  }

  const Logo = LOGOS[brand]
  if (!Logo) return null

  const colorClass = MONOCHROME.has(brand)
    ? variant === 'dark' ? 'text-white' : 'text-black'
    : ''

  return (
    <Logo
      style={{ height: size, width: 'auto', maxWidth: size * 2.5 }}
      className={`shrink-0 ${colorClass} ${className}`.trim()}
      aria-label={brand}
    />
  )
}
