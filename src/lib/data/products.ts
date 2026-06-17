import type { Product } from '@/lib/types'

const now = Date.now()
const hoursMs = (h: number) => h * 60 * 60 * 1000

export const DUMMY_PRODUCTS: Product[] = [
  {
    id: '1',
    type: 'box_catalog',
    name: 'LB Works Lamborghini Huracán — Pearl White',
    slug: 'lb-works-lamborghini-huracan-pearl-white',
    price: 149000,
    images: ['https://placehold.co/480x320/111212/C9A84C?text=LB+WORKS'],
    stock: 24,
    status: 'active',
    description: 'Pre-printed MiniGT-size box. Pearl white finish with gold accent stripe.',
    promotion: {
      id: 'p1', type: 'sale', label: 'SALE 20% OFF', discount_pct: 20,
      starts_at: new Date(now - hoursMs(2)).toISOString(),
      ends_at:   new Date(now + hoursMs(22)).toISOString(),
      product_ids: ['1'], priority: 1,
    },
  },
  {
    id: '2',
    type: 'box_catalog',
    name: 'Porsche 911 GT3 RS — Guards Red',
    slug: 'porsche-911-gt3-rs-guards-red',
    price: 149000,
    images: ['https://placehold.co/480x320/0d1117/e53935?text=PORSCHE+911'],
    stock: 18, status: 'active',
    description: 'Poprace-size box. Classic Guards Red with white livery stripe.',
  },
  {
    id: '3',
    type: 'box_custom',
    name: 'Custom Box — Design Your Own',
    slug: 'custom-box-design',
    price: 199000,
    images: ['https://placehold.co/480x320/0F1729/CA8A04?text=CUSTOM+BOX'],
    stock: 999, status: 'active',
    description: 'Upload your car photo, pick colors, add your car name. We print and ship.',
  },
  {
    id: '4',
    type: 'box_catalog',
    name: 'Toyota GR86 — Trueno Blue',
    slug: 'toyota-gr86-trueno-blue',
    price: 149000,
    images: ['https://placehold.co/480x320/0a1628/478ecc?text=TOYOTA+GR86'],
    stock: 0, status: 'pre_order',
    description: 'MiniGT-size. Ships mid-July 2026.',
    promotion: {
      id: 'p2', type: 'pre_order', label: 'PRE-ORDER', discount_pct: 0,
      starts_at: new Date(now - hoursMs(48)).toISOString(),
      ends_at:   new Date(now + hoursMs(480)).toISOString(),
      product_ids: ['4'], priority: 1,
    },
  },
  {
    id: '5',
    type: 'box_catalog',
    name: 'Nissan GT-R R35 — Midnight Purple',
    slug: 'nissan-gtr-r35-midnight-purple',
    price: 149000,
    images: ['https://placehold.co/480x320/1a0a2e/b4519e?text=NISSAN+GT-R'],
    stock: 12, status: 'active',
    description: 'MiniGT-size. Deep purple with black chrome accents.',
    promotion: {
      id: 'p3', type: 'flash_sale', label: 'FLASH SALE 30% OFF', discount_pct: 30,
      starts_at: new Date(now - hoursMs(1)).toISOString(),
      ends_at:   new Date(now + hoursMs(5)).toISOString(),
      product_ids: ['5'], priority: 2,
    },
  },
  {
    id: '6',
    type: 'box_catalog',
    name: 'Honda NSX Type-R — Championship White',
    slug: 'honda-nsx-type-r-championship-white',
    price: 149000,
    images: ['https://placehold.co/480x320/111212/EFEFEF?text=HONDA+NSX'],
    stock: 9, status: 'active',
    description: 'Poprace-size. Clean white with red JDM accents.',
  },
  {
    id: '7',
    type: 'box_catalog',
    name: 'Ferrari 488 GT3 — Scuderia Red',
    slug: 'ferrari-488-gt3-scuderia-red',
    price: 149000,
    images: ['https://placehold.co/480x320/1a0000/e53935?text=FERRARI+488'],
    stock: 6, status: 'active',
    description: 'MiniGT-size. Race livery with prancing horse emblem.',
  },
  {
    id: '8',
    type: 'box_custom',
    name: 'Custom Box — Poprace Size',
    slug: 'custom-box-poprace',
    price: 219000,
    images: ['https://placehold.co/480x320/0F1729/71bf4e?text=CUSTOM+POPRACE'],
    stock: 999, status: 'active',
    description: 'Same designer tool, Poprace dimensions (115×60×45mm).',
  },
]

export function getProductBySlug(slug: string): Product | undefined {
  return DUMMY_PRODUCTS.find(p => p.slug === slug)
}

export function getDiscountedPrice(product: Product): number {
  if (!product.promotion || product.promotion.discount_pct === 0) return product.price
  return Math.round(product.price * (1 - product.promotion.discount_pct / 100))
}
