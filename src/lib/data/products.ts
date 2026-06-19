import type { Product } from '@/lib/types'

const now = Date.now()
const h = (hours: number) => hours * 60 * 60 * 1000

/**
 * figbox.store — custom MiniGT box showcase
 * All products are type box_custom; images are examples of boxes we've made
 */
export const DUMMY_PRODUCTS: Product[] = [
  {
    id: 'fb-01',
    type: 'box_custom',
    name: 'LB-Works Nissan GT-R R35 Nismo — Supercar Advocates',
    slug: 'lb-works-gtr-r35-supercar-advocates',
    price: 89000,
    images: ['/products/p1.jpg'],
    stock: 999,
    status: 'active',
    tags: ['bestseller'],
    description: 'Hộp custom theo phong cách LB-WORKS GT-R R35 Nismo Supercar Advocates. Thiết kế trên AI, in 350gsm matte.',
    promotion: {
      id: 'p1', type: 'sale', label: 'SALE 20%', discount_pct: 20,
      starts_at: new Date(now - h(2)).toISOString(),
      ends_at:   new Date(now + h(22)).toISOString(),
      product_ids: ['fb-01'], priority: 1,
    },
  },
  {
    id: 'fb-02',
    type: 'box_custom',
    name: 'Pandem GT-R R32 × Sunoco — Tokyo Auto Salon',
    slug: 'pandem-gtr-r32-sunoco-tokyo',
    price: 79000,
    images: ['/products/p2.jpg'],
    stock: 999,
    status: 'active',
    tags: ['bestseller'],
    description: 'Custom box Pandem Pocket Bunny GT-R R32 + Suzuki Twin R. Livery Sunoco retro, Tokyo Auto Salon 2026.',
  },
  {
    id: 'fb-03',
    type: 'box_custom',
    name: 'Porsche 911 GT3-R AO Racing Roxy — Pink',
    slug: 'porsche-911-gt3r-ao-racing-roxy-pink',
    price: 99000,
    images: ['/products/p3.jpg'],
    stock: 999,
    status: 'active',
    tags: ['hot'],
    description: 'Custom box phong cách Porsche 911 GT3-R #77/#80 AO Racing "Roxy" Pink — IMSA 2023/2024.',
    promotion: {
      id: 'p3', type: 'flash_sale', label: 'FLASH -12%', discount_pct: 12,
      starts_at: new Date(now - h(1)).toISOString(),
      ends_at:   new Date(now + h(5)).toISOString(),
      product_ids: ['fb-03'], priority: 2,
    },
  },
  {
    id: 'fb-04',
    type: 'box_custom',
    name: 'Porsche 911 GT3 RS Weissach — Guards Red',
    slug: 'porsche-911-gt3rs-weissach-guards-red',
    price: 109000,
    images: ['/products/p9.jpg'],
    stock: 0,
    status: 'pre_order',
    tags: ['limited'],
    description: 'Custom box Porsche 911 GT3 RS (992) Weissach Package Guards Red. Pre-order — giao tháng 7/2026.',
    promotion: {
      id: 'p2', type: 'pre_order', label: 'PRE-ORDER', discount_pct: 0,
      starts_at: new Date(now - h(48)).toISOString(),
      ends_at:   new Date(now + h(480)).toISOString(),
      product_ids: ['fb-04'], priority: 1,
    },
  },
  {
    id: 'fb-05',
    type: 'box_custom',
    name: 'Porsche 911 GT3 R Pfaff Motorsports — Sebring Winner',
    slug: 'porsche-911-gt3r-pfaff-sebring',
    price: 119000,
    images: ['/products/p8.jpg'],
    stock: 999,
    status: 'active',
    tags: ['hot', 'limited'],
    description: 'Custom box Porsche 911 GT3 R #9 Pfaff Motorsports. IMSA 2023 Sebring 12Hrs Winner, GTD PRO.',
    promotion: {
      id: 'p3', type: 'flash_sale', label: 'FLASH SALE', discount_pct: 15,
      starts_at: new Date(now - h(1)).toISOString(),
      ends_at:   new Date(now + h(6)).toISOString(),
      product_ids: ['fb-05'], priority: 2,
    },
  },
  {
    id: 'fb-06',
    type: 'box_custom',
    name: 'Porsche 911 GT3-R AO Racing Roxy — Green',
    slug: 'porsche-911-gt3r-ao-racing-roxy-green',
    price: 95000,
    images: ['/products/p4.jpg'],
    stock: 999,
    status: 'active',
    tags: ['new', 'hot'],
    description: 'Custom box Porsche 911 GT3-R AO Racing "Roxy" Green. IMSA Sebring 2023 + Daytona 2024.',
    promotion: {
      id: 'p4', type: 'flash_sale', label: 'FLASH SALE', discount_pct: 15,
      starts_at: new Date(now - h(1)).toISOString(),
      ends_at:   new Date(now + h(6)).toISOString(),
      product_ids: ['fb-06'], priority: 2,
    },
  },
  {
    id: 'fb-07',
    type: 'box_custom',
    name: 'Porsche 911 Dakar — Roughroads Rallye Design',
    slug: 'porsche-911-dakar-roughroads-rallye',
    price: 75000,
    images: ['/products/p5.jpg'],
    stock: 999,
    status: 'active',
    tags: ['new'],
    description: 'Custom box Porsche 911 Dakar #185, Roughroads. Rallye Design Package White/Gentian Blue.',
    created_at: new Date(now - h(72)).toISOString(),
  },
  {
    id: 'fb-08',
    type: 'box_custom',
    name: 'Porsche 911 GT3 Cooler Master — HubAuto Macau GP',
    slug: 'porsche-911-gt3-cooler-master-macau',
    price: 85000,
    images: ['/products/p7.jpg'],
    stock: 999,
    status: 'active',
    tags: ['new'],
    description: 'Custom box Porsche 911 GT3 R #28 Cooler Master × HubAuto Racing. FIA GT World Cup Macau GP.',
    created_at: new Date(now - h(48)).toISOString(),
  },
  {
    id: 'fb-09',
    type: 'box_custom',
    name: 'LB-Works Nissan GT-R R35 — Blue Racer',
    slug: 'lb-works-gtr-r35-blue-racer',
    price: 70000,
    images: ['/products/p6.jpg'],
    stock: 999,
    status: 'active',
    tags: ['bestseller'],
    description: 'Custom box LB-WORKS Nissan GT-R R35 Nismo Final Edition. Blue-white racing livery.',
    promotion: {
      id: 'p5', type: 'sale', label: 'SALE 10%', discount_pct: 10,
      starts_at: new Date(now - h(12)).toISOString(),
      ends_at:   new Date(now + h(48)).toISOString(),
      product_ids: ['fb-09'], priority: 1,
    },
  },
  {
    id: 'fb-10',
    type: 'box_custom',
    name: 'Porsche 911 GT3 RS Weissach — Carbon Black',
    slug: 'porsche-911-gt3rs-weissach-carbon-black',
    price: 115000,
    images: ['/products/p9.jpg'],
    stock: 3,
    status: 'active',
    tags: ['bestseller', 'limited'],
    description: 'Custom box Porsche 911 GT3 RS (992) Weissach Package. Matte black finish với gold foil detail.',
  },
]

// ── Curated lists ───────────────────────────────────────────────────────────

export const BESTSELLERS = DUMMY_PRODUCTS.filter(p => p.tags?.includes('bestseller'))
export const NEW_ARRIVALS = DUMMY_PRODUCTS.filter(p => p.tags?.includes('new'))
export const HOT_PRODUCTS = DUMMY_PRODUCTS.filter(p => p.tags?.includes('hot'))

export function getFlashSaleProducts() {
  const n = new Date()
  return DUMMY_PRODUCTS.filter(p => {
    const promo = p.promotion
    return promo && promo.type === 'flash_sale' && new Date(promo.ends_at) > n
  })
}

export function getPreOrderProducts() {
  return DUMMY_PRODUCTS.filter(p => p.status === 'pre_order')
}

export function getProductBySlug(slug: string): Product | undefined {
  return DUMMY_PRODUCTS.find(p => p.slug === slug)
}

export function getDiscountedPrice(product: Product): number {
  if (!product.promotion || product.promotion.discount_pct === 0) return product.price
  return Math.round(product.price * (1 - product.promotion.discount_pct / 100))
}
