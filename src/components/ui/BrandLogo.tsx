'use client'

import type { CarBrand } from '@/lib/types'
import type { FC, SVGProps } from 'react'
import { useEffect, useState } from 'react'

// Monochrome brands — paths use fill="currentColor" so CSS color controls them
const MONOCHROME: Set<CarBrand> = new Set(['nissan', 'audi', 'ferrari', 'mclaren'])

// Default CSS color per brand on dark backgrounds (card variant="dark")
const DARK_COLOR: Partial<Record<CarBrand, string>> = {
  nissan:  'text-white',
  audi:    'text-white',
  ferrari: 'text-white',
  mclaren: 'text-white',
  // colored logos inherit their own fills, no override needed
}

// Default CSS color per brand on light backgrounds (card variant="light")
const LIGHT_COLOR: Partial<Record<CarBrand, string>> = {
  nissan:  'text-black',
  audi:    'text-black',
  ferrari: 'text-black',
  mclaren: 'text-black',
}

interface Props {
  brand: CarBrand
  size?: number
  variant?: 'dark' | 'light'
  className?: string
}

// Lazy-load SVG React components per brand
async function loadSvg(brand: CarBrand) {
  switch (brand) {
    case 'nissan':      return (await import('../../../public/brands/nissan.svg')).default
    case 'audi':        return (await import('../../../public/brands/audi.svg')).default
    case 'ferrari':     return (await import('../../../public/brands/ferrari.svg')).default
    case 'mclaren':     return (await import('../../../public/brands/mclaren.svg')).default
    case 'porsche':     return (await import('../../../public/brands/porsche.svg')).default
    case 'bmw':         return (await import('../../../public/brands/bmw.svg')).default
    case 'lamborghini': return (await import('../../../public/brands/lamborghini.svg')).default
    case 'toyota':      return (await import('../../../public/brands/toyota.svg')).default
    case 'honda':       return (await import('../../../public/brands/honda.svg')).default
    default:            return null
  }
}

type SvgComponent = FC<SVGProps<SVGSVGElement>>

export default function BrandLogo({ brand, size = 30, variant = 'dark', className = '' }: Props) {
  const [SvgComp, setSvgComp] = useState<SvgComponent | null>(null)

  useEffect(() => {
    if (brand === 'other' || brand === 'mercedes') return
    loadSvg(brand).then(comp => {
      if (comp) setSvgComp(() => comp as SvgComponent)
    })
  }, [brand])

  if (brand === 'other' || brand === 'mercedes') {
    return brand === 'mercedes'
      ? <span className={`text-[10px] font-semibold tracking-wide opacity-60 ${className}`}>Mercedes</span>
      : null
  }

  if (!SvgComp) return <span style={{ width: size * 2, height: size, display: 'inline-block' }} />

  const colorClass = MONOCHROME.has(brand)
    ? (variant === 'dark' ? (DARK_COLOR[brand] ?? 'text-white') : (LIGHT_COLOR[brand] ?? 'text-black'))
    : ''

  return (
    <SvgComp
      style={{ height: size, width: 'auto', maxWidth: size * 2.5 }}
      className={`shrink-0 object-contain ${colorClass} ${className}`}
      aria-label={brand}
    />
  )
}
