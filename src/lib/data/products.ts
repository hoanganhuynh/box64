import type { Product } from '@/lib/types'

const now = Date.now()
const h = (hours: number) => hours * 60 * 60 * 1000

/**
 * figbox.store — custom MiniGT box showcase
 * All box products are type box_custom; images are examples of boxes we've made
 */
export const DUMMY_PRODUCTS: Product[] = [
  {
    id: 'fb-01',
    type: 'box_custom',
    name: 'LB-Works Nissan GT-R R35 Nismo — Supercar Advocates',
    slug: 'mini-gt-nissan-gtr-r35-lb-works-supercar-advocates',
    sku: 'MGT-NS-GTRR35-SA',
    manufacturer: 'mini-gt',
    car_make: 'nissan',
    car_model: 'gt-r-r35-lb-works',
    color: 'supercar-advocates',
    color_group: 'mini-gt-nissan-gtr-r35-lb-works',
    price: 89000,
    images: ['/products/p1.jpg'],
    stock: 999,
    status: 'active',
    tags: ['bestseller'],
    material: 'box_protect',
    brand: 'nissan',
    release_date: '2025-01-20',
    description: 'Custom box in LB-WORKS GT-R R35 Nismo Supercar Advocates livery. AI-designed artwork, 350gsm matte print.',
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
    slug: 'mini-gt-nissan-gtr-r32-pandem-sunoco-tokyo',
    sku: 'MGT-NS-GTRR32-SUN',
    manufacturer: 'mini-gt',
    car_make: 'nissan',
    car_model: 'gt-r-r32-pandem',
    color: 'sunoco-tokyo',
    color_group: 'mini-gt-nissan-gtr-r32-pandem',
    price: 79000,
    images: ['/products/p2.jpg'],
    stock: 999,
    status: 'active',
    tags: ['bestseller'],
    material: 'box_only',
    brand: 'nissan',
    release_date: '2025-02-15',
    description: 'Custom box for the Pandem Pocket Bunny GT-R R32 + Suzuki Twin R. Retro Sunoco livery, Tokyo Auto Salon 2026.',
  },
  {
    id: 'fb-03',
    type: 'box_custom',
    name: 'Porsche 911 GT3-R AO Racing Roxy — Pink',
    slug: 'mini-gt-porsche-911-gt3r-ao-racing-roxy-pink',
    sku: 'MGT-POR-911GTR-PK',
    manufacturer: 'mini-gt',
    car_make: 'porsche',
    car_model: '911-gt3-r',
    color: 'pink',
    color_group: 'mini-gt-porsche-911-gt3r-ao-racing-roxy',
    price: 99000,
    images: ['/products/p3.jpg'],
    stock: 999,
    status: 'active',
    tags: ['hot'],
    material: 'box_protect',
    brand: 'porsche',
    release_date: '2025-03-10',
    description: 'Custom box in Porsche 911 GT3-R #77/#80 AO Racing "Roxy" Pink livery — IMSA 2023/2024.',
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
    slug: 'mini-gt-porsche-911-gt3rs-weissach-guards-red',
    sku: 'MGT-POR-911GRSW-GR',
    manufacturer: 'mini-gt',
    car_make: 'porsche',
    car_model: '911-gt3-rs-weissach',
    color: 'guards-red',
    color_group: 'mini-gt-porsche-911-gt3rs-weissach',
    price: 109000,
    images: ['/products/p9.jpg'],
    stock: 0,
    status: 'pre_order',
    tags: ['limited'],
    material: 'box_protect',
    brand: 'porsche',
    release_date: '2026-07-01',
    description: 'Custom box for the Porsche 911 GT3 RS (992) Weissach Package in Guards Red. Pre-order — ships July 2026.',
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
    slug: 'mini-gt-porsche-911-gt3r-pfaff-sebring',
    sku: 'MGT-POR-911GTR-PFS',
    manufacturer: 'mini-gt',
    car_make: 'porsche',
    car_model: '911-gt3-r',
    color: 'pfaff-sebring',
    color_group: 'mini-gt-porsche-911-gt3r-pfaff',
    price: 119000,
    images: ['/products/p8.jpg'],
    stock: 999,
    status: 'active',
    tags: ['hot', 'limited'],
    material: 'box_protect',
    brand: 'porsche',
    release_date: '2025-03-25',
    description: 'Custom box for the Porsche 911 GT3 R #9 Pfaff Motorsports. IMSA 2023 Sebring 12 Hours Winner, GTD PRO class.',
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
    slug: 'mini-gt-porsche-911-gt3r-ao-racing-roxy-green',
    sku: 'MGT-POR-911GTR-GN',
    manufacturer: 'mini-gt',
    car_make: 'porsche',
    car_model: '911-gt3-r',
    color: 'green',
    color_group: 'mini-gt-porsche-911-gt3r-ao-racing-roxy',
    price: 95000,
    images: ['/products/p4.jpg'],
    stock: 999,
    status: 'active',
    tags: ['new', 'hot'],
    material: 'box_protect',
    brand: 'porsche',
    release_date: '2025-04-10',
    description: 'Custom box for the Porsche 911 GT3-R AO Racing "Roxy" Green livery. IMSA Sebring 2023 + Daytona 2024.',
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
    slug: 'mini-gt-porsche-911-dakar-roughroads-rallye',
    sku: 'MGT-POR-911DK-RR',
    manufacturer: 'mini-gt',
    car_make: 'porsche',
    car_model: '911-dakar',
    color: 'roughroads-rallye',
    color_group: 'mini-gt-porsche-911-dakar',
    price: 75000,
    images: ['/products/p5.jpg'],
    stock: 999,
    status: 'active',
    tags: ['new'],
    material: 'box_only',
    brand: 'porsche',
    release_date: '2025-05-05',
    description: 'Custom box for the Porsche 911 Dakar #185, Roughroads. Rallye Design Package in White/Gentian Blue.',
    created_at: new Date(now - h(72)).toISOString(),
  },
  {
    id: 'fb-08',
    type: 'box_custom',
    name: 'Porsche 911 GT3 Cooler Master — HubAuto Macau GP',
    slug: 'mini-gt-porsche-911-gt3-cooler-master-macau',
    sku: 'MGT-POR-911GT3-CM',
    manufacturer: 'mini-gt',
    car_make: 'porsche',
    car_model: '911-gt3',
    color: 'cooler-master-macau',
    color_group: 'mini-gt-porsche-911-gt3-cooler-master',
    price: 85000,
    images: ['/products/p7.jpg'],
    stock: 999,
    status: 'active',
    tags: ['new'],
    material: 'box_protect',
    brand: 'porsche',
    release_date: '2025-05-15',
    description: 'Custom box for the Porsche 911 GT3 R #28 Cooler Master × HubAuto Racing. FIA GT World Cup Macau GP.',
    created_at: new Date(now - h(48)).toISOString(),
  },
  {
    id: 'fb-09',
    type: 'box_custom',
    name: 'LB-Works Nissan GT-R R35 — Blue Racer',
    slug: 'mini-gt-nissan-gtr-r35-lb-works-blue-racer',
    sku: 'MGT-NS-GTRR35-BL',
    manufacturer: 'mini-gt',
    car_make: 'nissan',
    car_model: 'gt-r-r35-lb-works',
    color: 'blue-racer',
    color_group: 'mini-gt-nissan-gtr-r35-lb-works',
    price: 70000,
    images: ['/products/p6.jpg'],
    stock: 999,
    status: 'active',
    tags: ['bestseller'],
    material: 'box_only',
    brand: 'nissan',
    release_date: '2024-12-10',
    description: 'Custom box for the LB-WORKS Nissan GT-R R35 Nismo Final Edition. Blue-white racing livery.',
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
    slug: 'mini-gt-porsche-911-gt3rs-weissach-carbon-black',
    sku: 'MGT-POR-911GRSW-CB',
    manufacturer: 'mini-gt',
    car_make: 'porsche',
    car_model: '911-gt3-rs-weissach',
    color: 'carbon-black',
    color_group: 'mini-gt-porsche-911-gt3rs-weissach',
    price: 115000,
    images: ['/products/p9.jpg'],
    stock: 3,
    status: 'active',
    tags: ['bestseller', 'limited'],
    material: 'box_protect',
    brand: 'porsche',
    release_date: '2025-05-20',
    description: 'Custom box for the Porsche 911 GT3 RS (992) Weissach Package. Matte black finish with gold foil detail.',
  },
  {
    id: 'fb-11',
    type: 'box_custom',
    name: 'Nissan Z GT500 NISMO — SUPER GT 2024',
    slug: 'mini-gt-nissan-z-gt500-nismo-super-gt-2024',
    sku: 'MGT-NS-ZGT500-SG24',
    manufacturer: 'mini-gt',
    car_make: 'nissan',
    car_model: 'z-gt500-nismo',
    color: 'super-gt-2024',
    color_group: 'mini-gt-nissan-z-gt500-nismo',
    price: 78000,
    images: ['/products/p6.jpg'],
    stock: 999,
    status: 'active',
    tags: ['new'],
    material: 'box_only',
    brand: 'nissan',
    release_date: '2025-06-01',
    description: 'Custom box for the Nissan Z NISMO GT500 #3 XANAVI NISMO. Super GT 2024 livery, matte carbon black with neon red.',
    created_at: new Date(now - h(18)).toISOString(),
  },
  {
    id: 'fb-12',
    type: 'water_decal',
    name: 'Porsche 911 GT3-R IMSA — Water Slide Decal Set',
    slug: 'porsche-911-gt3r-imsa-water-decal',
    sku: 'WD-POR-911GTR-IMSA',
    car_make: 'porsche',
    car_model: '911-gt3-r',
    price: 45000,
    images: ['/products/p3.jpg'],
    stock: 999,
    status: 'active',
    tags: ['new'],
    brand: 'porsche',
    description: 'High-resolution water slide decal set for 1:64 Porsche 911 GT3-R IMSA liveries. Print on decal paper, apply with water. Includes 3 livery variants.',
    created_at: new Date(now - h(24)).toISOString(),
  },
  {
    id: 'fb-13',
    type: 'water_decal',
    name: 'Nissan GT-R R35 LB-Works — Water Slide Decal Set',
    slug: 'nissan-gtr-r35-lb-works-water-decal',
    sku: 'WD-NS-GTRR35-LBW',
    car_make: 'nissan',
    car_model: 'gt-r-r35-lb-works',
    price: 45000,
    images: ['/products/p1.jpg'],
    stock: 999,
    status: 'active',
    tags: ['new'],
    brand: 'nissan',
    description: 'High-resolution water slide decal set for 1:64 Nissan GT-R R35 LB-Works builds. Includes 4 livery variants. Apply with water, no cutting required.',
    created_at: new Date(now - h(24)).toISOString(),
  },
  {
    id: 'fb-14',
    type: 'accessory_3d',
    name: '1:64 Diecast Display Stand — Acrylic with Name Plate',
    slug: '1-64-display-stand-acrylic-name-plate',
    sku: 'ACC-STAND-ACRYL-NP',
    price: 35000,
    images: ['/products/p7.jpg'],
    stock: 999,
    status: 'active',
    tags: ['new'],
    description: 'Acrylic display stand for 1:64 diecast models. Includes custom name plate engraving slot. Fits MiniGT and most 1:64 brands. Sold per unit.',
    created_at: new Date(now - h(12)).toISOString(),
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

export function getColorVariants(product: Product): Product[] {
  if (!product.color_group) return []
  return DUMMY_PRODUCTS.filter(
    p => p.color_group === product.color_group && p.id !== product.id
  )
}

export function getDiscountedPrice(product: Product): number {
  if (!product.promotion || product.promotion.discount_pct === 0) return product.price
  return Math.round(product.price * (1 - product.promotion.discount_pct / 100))
}

// ── Smart related products ───────────────────────────────────────────────────

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'for', 'of', 'to', 'by', 'with',
  'x', 'gt', 'rs', 'r', 'cup',
  // Color words — excluded because "pink" and "green" variants of same car should score by event, not color
  'red', 'blue', 'green', 'black', 'white', 'pink', 'silver', 'gold', 'orange', 'yellow',
  'grey', 'gray', 'carbon', 'matte', 'gloss',
])

export function extractKeywords(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOPWORDS.has(w))
}

function scoreRelevance(target: Product, candidate: Product): number {
  if (target.id === candidate.id) return -1
  const tkw = extractKeywords(target.name)
  const ckw = extractKeywords(candidate.name)
  const targetSet = new Set(tkw)
  let score = 0
  for (const kw of ckw) {
    if (targetSet.has(kw)) score += 1
  }
  if (target.brand && candidate.brand && target.brand === candidate.brand) score += 3
  return score
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return DUMMY_PRODUCTS
    .filter(p => p.id !== product.id)
    .map(p => ({ product: p, score: scoreRelevance(product, p) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.product)
}
