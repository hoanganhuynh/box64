# Big Product Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship 13 product/UX improvements: data model (brand, categories, material rename), ProductCard swipe + remove ATC button, fly-to-cart animation, freeship promo, smart related products, footer request form + Facebook, mobile hamburger polish, full English, release-date removal.

**Architecture:** All changes stay in the existing Next.js 16 App Router monorepo on branch `feat/plan-01-foundation`. Data lives in `src/lib/data/products.ts` (static for now). Cart animation uses a lightweight Zustand slice + CSS keyframe clone. Footer form is a client component with local state (no backend yet — logs to console, ready for API wiring).

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Tailwind CSS v3, iconsax-react, zustand, lucide-react (cart page).

---

## File Map

| File | Change |
|------|--------|
| `src/lib/types.ts` | Add `brand`, rename `'box_seal'→'box_protect'`, add `ProductType` values |
| `src/lib/data/products.ts` | Add brand to all products, new water_decal + 3d products, keyword-chunking related fn |
| `src/lib/store/cart.ts` | Add `flyAnimation` slice: source rect + trigger |
| `src/components/shop/ProductCard.tsx` | Remove ATC button, add swipeable image strip |
| `src/components/shop/CartFlyAnimation.tsx` | New — renders flying clone + animates to cart |
| `src/components/shop/AddToCartButton.tsx` | Emit fly event on add |
| `src/components/layout/Header.tsx` | Consume fly target ref, mobile menu larger spacing/text |
| `src/app/shop/page.tsx` | Brand filter + category tabs (Box Custom / Water Decal / 3D) |
| `src/app/shop/[slug]/page.tsx` | Smart related products, remove release_date display |
| `src/app/cart/page.tsx` | Freeship promo banner |
| `src/components/layout/Footer.tsx` | Facebook link + request form |
| `src/app/globals.css` | Fly-animation keyframe |

---

## Task 1: Update types — brand, material rename, new product categories

**Files:**
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Update `types.ts`**

Replace the file's top section:

```typescript
// Before:
export type ProductType = 'box_catalog' | 'box_custom' | 'accessory'
// ...
export interface Product {
  // ...
  material?: 'box_only' | 'box_seal'
  release_date?: string
}

// After:
export type ProductType = 'box_catalog' | 'box_custom' | 'water_decal' | 'accessory_3d'
export type CarBrand = 'nissan' | 'porsche' | 'lamborghini' | 'ferrari' | 'mclaren' | 'bmw' | 'toyota' | 'honda' | 'mercedes' | 'audi' | 'other'

// In Product interface, replace material line:
material?: 'box_only' | 'box_protect'
brand?: CarBrand
// keep release_date in type (just stop rendering it)
```

Exact diff to apply in `src/lib/types.ts`:

```typescript
export type ProductType = 'box_catalog' | 'box_custom' | 'water_decal' | 'accessory_3d'
export type ProductStatus = 'active' | 'pre_order' | 'out_of_stock'
export type CarBrand = 'nissan' | 'porsche' | 'lamborghini' | 'ferrari' | 'mclaren' | 'bmw' | 'toyota' | 'honda' | 'mercedes' | 'audi' | 'other'
// ... keep rest unchanged ...

export interface Product {
  id: string
  type: ProductType
  name: string
  slug: string
  price: number
  images: string[]
  stock: number
  status: ProductStatus
  promotion?: Promotion
  description?: string
  tags?: Array<'bestseller' | 'new' | 'hot' | 'limited'>
  material?: 'box_only' | 'box_protect'
  brand?: CarBrand
  release_date?: string   // kept for data, NOT rendered in UI
  created_at?: string
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: errors about `'box_seal'` usages in products.ts + display components — fix in next task.

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat(types): brand field, box_protect, water_decal, accessory_3d"
```

---

## Task 2: Update product data — brand, material rename, new products, box_protect

**Files:**
- Modify: `src/lib/data/products.ts`

- [ ] **Step 1: Replace `box_seal` with `box_protect` and add `brand` field**

In `src/lib/data/products.ts`, apply these changes to ALL existing products:

```typescript
// fb-01 — LB-Works GT-R R35 Nismo
material: 'box_protect', brand: 'nissan',

// fb-02 — Pandem GT-R R32 Sunoco
material: 'box_only', brand: 'nissan',

// fb-03 — Porsche 911 GT3-R AO Racing Pink
material: 'box_protect', brand: 'porsche',

// fb-04 — Porsche 911 GT3 RS Weissach Guards Red
material: 'box_protect', brand: 'porsche',

// fb-05 — Porsche 911 GT3 R Pfaff Sebring
material: 'box_protect', brand: 'porsche',

// fb-06 — Porsche 911 GT3-R AO Racing Green
material: 'box_protect', brand: 'porsche',

// fb-07 — Porsche 911 Dakar Roughroads
material: 'box_only', brand: 'porsche',

// fb-08 — Porsche 911 GT3 Cooler Master Macau
material: 'box_protect', brand: 'porsche',

// fb-09 — LB-Works GT-R R35 Blue Racer
material: 'box_only', brand: 'nissan',

// fb-10 — Porsche 911 GT3 RS Carbon Black
material: 'box_protect', brand: 'porsche',

// fb-11 — Nissan Z GT500 NISMO Super GT
material: 'box_only', brand: 'nissan',
```

- [ ] **Step 2: Add 3 new product entries (water_decal + accessory_3d)**

Append to DUMMY_PRODUCTS array:

```typescript
  {
    id: 'fb-12',
    type: 'water_decal',
    name: 'Water Decal Set — Porsche 911 RSR IMSA Pack',
    slug: 'water-decal-porsche-911-rsr-imsa-pack',
    price: 35000,
    images: ['/products/p3.jpg'],
    stock: 999,
    status: 'active',
    tags: ['new'],
    brand: 'porsche',
    description: 'High-res water slide decals for 1:64 Porsche 911 RSR. IMSA WeatherTech 2022–2023 livery pack. 12 sheets.',
    created_at: new Date(now - h(24)).toISOString(),
  },
  {
    id: 'fb-13',
    type: 'water_decal',
    name: 'Water Decal Set — Nissan GT-R R35 LB-Works Pack',
    slug: 'water-decal-nissan-gtr-r35-lb-works-pack',
    price: 35000,
    images: ['/products/p6.jpg'],
    stock: 999,
    status: 'active',
    tags: ['new'],
    brand: 'nissan',
    description: '1:64 water slide decals for LB-WORKS GT-R R35. Includes Nismo Final Edition + Supercar Advocates livery. 10 sheets.',
    created_at: new Date(now - h(12)).toISOString(),
  },
  {
    id: 'fb-14',
    type: 'accessory_3d',
    name: '3D Printed Display Stand — MiniGT Series (4-car)',
    slug: '3d-display-stand-minigt-4car',
    price: 55000,
    images: ['/products/p7.jpg'],
    stock: 999,
    status: 'active',
    tags: ['new'],
    description: 'Matte black 3D printed tiered display stand for 4 × MiniGT / 1:64 diecast cars. Precision fit, no glue required.',
    created_at: new Date(now - h(6)).toISOString(),
  },
```

- [ ] **Step 3: Update `getRelatedProducts` with smart keyword chunking**

Add this function (replaces the inline `related` calculation in product detail page):

```typescript
// Keyword chunks extracted from product name
// Splits on space/dash/×, lowercases, filters stopwords + color words
const STOPWORDS = new Set([
  'the','a','an','and','or','for','in','of','to','by','×','x',
  // colors — do NOT match on color
  'red','blue','green','black','white','yellow','pink','orange','silver',
  'grey','gray','carbon','matte','glossy',
])

export function extractKeywords(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[\s\-–×\/()#]+/)
    .map(t => t.replace(/[^a-z0-9]/g, ''))
    .filter(t => t.length >= 2 && !STOPWORDS.has(t))
}

export function scoreRelevance(a: Product, b: Product): number {
  const ka = extractKeywords(a.name)
  const kb = new Set(extractKeywords(b.name))
  // Each shared token scores 1; brand match scores +3
  let score = ka.filter(k => kb.has(k)).length
  if (a.brand && a.brand === b.brand) score += 3
  return score
}

export function getRelatedProducts(product: Product, count = 4): Product[] {
  return DUMMY_PRODUCTS
    .filter(p => p.id !== product.id)
    .map(p => ({ p, score: scoreRelevance(product, p) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ p }) => p)
}
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/data/products.ts
git commit -m "feat(data): brand field, box_protect, water_decal/3d products, smart related"
```

---

## Task 3: Fix all `box_seal` display references + remove release_date from UI

**Files:**
- Modify: `src/app/shop/[slug]/page.tsx`
- Modify: `src/components/shop/ProductCard.tsx`

- [ ] **Step 1: In `src/app/shop/[slug]/page.tsx` — rename display + remove release_date**

Find and change:
```tsx
// Before:
{product.material === 'box_seal' ? 'Box + Seal' : 'Box Only'}
// After:
{product.material === 'box_protect' ? 'Box + Protect' : 'Box Only'}
```

Remove this block entirely (the release_date badge):
```tsx
// DELETE these lines:
{product.release_date && (
  <span className="text-[10px] text-[#666] leading-none">
    {formatReleaseDate(product.release_date)}
  </span>
)}
```

Also update `getRelatedProducts` usage — replace:
```tsx
// Before (line ~52):
const related = DUMMY_PRODUCTS.filter(p => p.id !== product.id).slice(0, 4)
// After:
import { getRelatedProducts } from '@/lib/data/products'
// ...
const related = getRelatedProducts(product, 4)
```

- [ ] **Step 2: In `src/components/shop/ProductCard.tsx` — rename box_seal display**

```tsx
// Before:
{product.material === 'box_seal' ? 'Box + Seal' : 'Box Only'}
// After:
{product.material === 'box_protect' ? 'Box + Protect' : 'Box Only'}
```

- [ ] **Step 3: Check for any remaining `box_seal` or `formatReleaseDate` render usages**

```bash
grep -rn "box_seal\|formatReleaseDate\|release_date" src/app src/components --include="*.tsx" --include="*.ts"
```

Expected: Only `types.ts` keeps `release_date` field definition; no more UI renders.

- [ ] **Step 4: TypeScript check + commit**

```bash
npx tsc --noEmit
git add src/app/shop/[slug]/page.tsx src/components/shop/ProductCard.tsx
git commit -m "feat: box_protect rename, remove release_date display, smart related products"
```

---

## Task 4: Remove Add to Cart button from ProductCard + add swipeable images

**Files:**
- Modify: `src/components/shop/ProductCard.tsx`

The card should be a pure navigation element: click → goes to product detail. Images cycle on swipe/drag.

- [ ] **Step 1: Remove ATC button and sold-count from ProductCard**

Delete the entire `<button onClick={handleAdd}...>` block at the bottom of the info section.
Also delete the `useCartStore` import and `addItem`/`added`/`handleAdd` code — no longer needed here.
Also remove the `flashSold`/`flashPct` flash sale progress bar (it depended on "add to cart" concept — can revisit later if needed).

The `<div className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-2.5 flex-1">` info section keeps:
- MiniGT logo + material badge + sold count
- Product name + price row

- [ ] **Step 2: Add swipeable image support**

Replace the simple `<Image>` in the card link with a swipeable strip. The entire card image area becomes:

```tsx
'use client'
import { useState, useRef } from 'react'
// ...

// Inside component, add:
const [imgIdx, setImgIdx] = useState(0)
const dragStartX = useRef<number | null>(null)

const onPointerDown = (e: React.PointerEvent) => {
  dragStartX.current = e.clientX
}
const onPointerUp = (e: React.PointerEvent) => {
  if (dragStartX.current === null) return
  const dx = e.clientX - dragStartX.current
  if (Math.abs(dx) < 30) return  // too small — treat as click
  const dir = dx < 0 ? 1 : -1
  setImgIdx(i => (i + dir + product.images.length) % product.images.length)
  dragStartX.current = null
}

// JSX — replace the Link wrapping the image:
<div
  className={`relative block aspect-square overflow-hidden ${dark ? 'bg-[#0C0C18]' : 'bg-[#F5F0EA]'}`}
  onPointerDown={onPointerDown}
  onPointerUp={onPointerUp}
  style={{ touchAction: 'pan-y' }}
>
  <Link href={`/shop/${product.slug}`} tabIndex={-1} className="absolute inset-0">
    <Image
      src={product.images[imgIdx] ?? product.images[0]}
      alt={product.name}
      fill
      className="object-cover transition-opacity duration-200"
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
    />
  </Link>
  {/* dot indicators — only if >1 image */}
  {product.images.length > 1 && (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
      {product.images.map((_, i) => (
        <span
          key={i}
          className={`w-1 h-1 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/30'}`}
        />
      ))}
    </div>
  )}
  {/* keep existing badge overlays (sale/preorder/hot/new/limited/countdown) */}
</div>
```

- [ ] **Step 3: Make the card name+price the main click target**

Wrap the name+price in `<Link href={/shop/${product.slug}}>` (already done in current code). The outer card div should NOT be a link — pointer events on image area handle swipe vs tap via pointer delta.

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/shop/ProductCard.tsx
git commit -m "feat(product-card): remove ATC button, add swipeable image with dot indicators"
```

---

## Task 5: Fly-to-cart animation

**Files:**
- Create: `src/components/shop/CartFlyAnimation.tsx`
- Modify: `src/lib/store/cart.ts`
- Modify: `src/components/shop/AddToCartButton.tsx`
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/app/globals.css`

The flow: user clicks Add to Cart on the **product detail page** → image element rect captured → a clone div animates from image to cart icon via cubic-bezier curve → cart badge counter bumps with a scale pulse.

- [ ] **Step 1: Add CSS keyframe to `src/app/globals.css`**

```css
@keyframes fly-to-cart {
  0%   { transform: scale(1) translate(0, 0); opacity: 1; }
  60%  { opacity: 1; }
  100% { transform: scale(0.15) translate(var(--fly-dx), var(--fly-dy)); opacity: 0; }
}
.fly-item {
  animation: fly-to-cart 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  pointer-events: none;
  z-index: 9999;
}

@keyframes cart-bump {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.5); }
  100% { transform: scale(1); }
}
.cart-bump {
  animation: cart-bump 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards;
}
```

- [ ] **Step 2: Add fly state to `src/lib/store/cart.ts`**

```typescript
// Add to CartStore interface:
flyEvent: { imageUrl: string; sourceRect: DOMRect } | null
triggerFly: (imageUrl: string, sourceRect: DOMRect) => void
clearFly: () => void

// Add to store implementation:
flyEvent: null,
triggerFly: (imageUrl, sourceRect) => set({ flyEvent: { imageUrl, sourceRect } }),
clearFly: () => set({ flyEvent: null }),
```

- [ ] **Step 3: Create `src/components/shop/CartFlyAnimation.tsx`**

```tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'

export default function CartFlyAnimation() {
  const flyEvent = useCartStore(s => s.flyEvent)
  const clearFly = useCartStore(s => s.clearFly)
  const [cartRect, setCartRect] = useState<DOMRect | null>(null)
  const flyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!flyEvent) return
    // Find cart icon in DOM
    const cartEl = document.querySelector('[data-cart-icon]')
    if (cartEl) setCartRect(cartEl.getBoundingClientRect())
  }, [flyEvent])

  useEffect(() => {
    if (!flyEvent || !cartRect || !flyRef.current) return
    const { sourceRect } = flyEvent
    const el = flyRef.current
    // Compute delta from image center to cart icon center
    const dx = cartRect.left + cartRect.width / 2 - (sourceRect.left + sourceRect.width / 2)
    const dy = cartRect.top + cartRect.height / 2 - (sourceRect.top + sourceRect.height / 2)
    el.style.setProperty('--fly-dx', `${dx}px`)
    el.style.setProperty('--fly-dy', `${dy}px`)
    el.classList.add('fly-item')
    // Bump cart badge
    const badge = document.querySelector('[data-cart-badge]')
    badge?.classList.remove('cart-bump')
    void badge?.getBoundingClientRect() // reflow
    badge?.classList.add('cart-bump')
    const timer = setTimeout(() => {
      clearFly()
      badge?.classList.remove('cart-bump')
    }, 750)
    return () => clearTimeout(timer)
  }, [flyEvent, cartRect, clearFly])

  if (!flyEvent || !cartRect) return null

  return (
    <div
      ref={flyRef}
      className="fixed rounded-sm overflow-hidden shadow-xl"
      style={{
        left: flyEvent.sourceRect.left,
        top: flyEvent.sourceRect.top,
        width: flyEvent.sourceRect.width,
        height: flyEvent.sourceRect.height,
      }}
    >
      <Image
        src={flyEvent.imageUrl}
        alt=""
        fill
        className="object-cover"
        sizes="200px"
      />
    </div>
  )
}
```

- [ ] **Step 4: Add `data-cart-icon` + `data-cart-badge` to `src/components/layout/Header.tsx`**

On the `<Bag2>` wrapper span:
```tsx
<span data-cart-icon className="...">
  <Bag2 ... />
</span>

// On the count badge span:
<span data-cart-badge className="absolute -top-1 -right-1 ...">
  {count}
</span>
```

Also add `<CartFlyAnimation />` to the root layout or header (renders globally):
```tsx
// In Header.tsx return, after the header element:
import CartFlyAnimation from '@/components/shop/CartFlyAnimation'
// ...
<>
  <header>...</header>
  <CartFlyAnimation />
</>
```

- [ ] **Step 5: Update `src/components/shop/AddToCartButton.tsx`**

On the "add" click, capture the image element rect and trigger the fly:

```tsx
// Find the main product image
const imgEl = document.querySelector('[data-product-main-image]') as HTMLElement | null
if (imgEl) {
  const rect = imgEl.getBoundingClientRect()
  triggerFly(product.images[0], rect)
}
```

Add `data-product-main-image` attribute to the main `<Image>` wrapper in `src/app/shop/[slug]/page.tsx`:
```tsx
<div data-product-main-image className="relative aspect-square ...">
```

Get `triggerFly` from store:
```tsx
const triggerFly = useCartStore(s => s.triggerFly)
```

- [ ] **Step 6: TypeScript check + commit**

```bash
npx tsc --noEmit
git add src/app/globals.css src/lib/store/cart.ts src/components/shop/CartFlyAnimation.tsx \
  src/components/layout/Header.tsx src/components/shop/AddToCartButton.tsx \
  src/app/shop/[slug]/page.tsx
git commit -m "feat(cart): fly-to-cart animation with cubic-bezier curve + badge bump"
```

---

## Task 6: Cart freeship promo banner

**Files:**
- Modify: `src/app/cart/page.tsx`

Free shipping threshold: **500,000 VND**.

- [ ] **Step 1: Add promo banner below cart header**

```tsx
const FREESHIP_THRESHOLD = 500_000
const toFreeship = Math.max(0, FREESHIP_THRESHOLD - total)

// Render above the grid, below the header:
{toFreeship > 0 ? (
  <div className="mb-6 flex items-center gap-2 bg-surface border border-border rounded-sm px-4 py-3 text-sm">
    <TruckFast size={15} color="var(--gold)" />
    <span className="text-muted">
      Add <span className="font-semibold text-primary">{formatVND(toFreeship)}</span> more for{' '}
      <span className="font-semibold text-gold">free nationwide shipping</span>
    </span>
  </div>
) : (
  <div className="mb-6 flex items-center gap-2 bg-gold/10 border border-gold/25 rounded-sm px-4 py-3 text-sm">
    <TruckFast size={15} color="var(--gold)" />
    <span className="text-gold font-semibold">You've unlocked free nationwide shipping!</span>
  </div>
)}
```

Import `TruckFast` from `lucide-react` or `iconsax-react` — cart page already uses lucide. Use:
```tsx
import { Truck } from 'lucide-react'
// then: <Truck size={15} className="text-gold shrink-0" />
```

- [ ] **Step 2: TypeScript check + commit**

```bash
npx tsc --noEmit
git add src/app/cart/page.tsx
git commit -m "feat(cart): freeship promo banner at 500k VND threshold"
```

---

## Task 7: Shop page — brand filter + new category tabs

**Files:**
- Modify: `src/app/shop/page.tsx`
- Modify: `src/components/shop/FilterTabs.tsx`

New filter dimensions:
1. **Category**: All | Box Custom | Water Decal | 3D Accessories
2. **Brand**: All | Nissan | Porsche | Lamborghini | BMW | Others

Both filters use URL search params (`?cat=box_custom&brand=porsche`) so they're shareable and SSR-friendly.

- [ ] **Step 1: Update `src/components/shop/FilterTabs.tsx`**

Add a `BrandFilter` component below the category tabs:

```tsx
// Current FilterTabs handles ?type= param
// Extend to also handle ?cat= and ?brand=

const CATEGORIES = [
  { label: 'All',            value: ''            },
  { label: 'Box Custom',     value: 'box_custom'  },
  { label: 'Water Decal',    value: 'water_decal' },
  { label: '3D Accessories', value: 'accessory_3d'},
] as const

const BRANDS = [
  { label: 'All Brands', value: '' },
  { label: 'Nissan',     value: 'nissan'  },
  { label: 'Porsche',    value: 'porsche' },
  { label: 'BMW',        value: 'bmw'     },
  { label: 'Toyota',     value: 'toyota'  },
  { label: 'Others',     value: 'other'   },
] as const
```

Both are `<Link>` based (no JS needed) — compose new URL params from current ones:

```tsx
function buildHref(current: URLSearchParams, key: string, value: string) {
  const p = new URLSearchParams(current)
  if (value) p.set(key, value); else p.delete(key)
  return `/shop?${p.toString()}`
}
```

- [ ] **Step 2: Update `src/app/shop/page.tsx` filtering logic**

```typescript
// Add to searchParams destructure:
const { type = '', sort = '', cat = '', brand = '' } = await searchParams

// Filter pipeline:
let filtered = filterProducts(DUMMY_PRODUCTS, type)
if (cat) filtered = filtered.filter(p => p.type === cat)
if (brand) filtered = filtered.filter(p => p.brand === brand)
const products = sortProducts(filtered, sort)

// Pass new params to FilterTabs:
<FilterTabs current={type} cat={cat} brand={brand} />
```

Update `FilterTabs` props interface:
```typescript
interface Props { current: string; cat: string; brand: string }
```

- [ ] **Step 3: TypeScript check + commit**

```bash
npx tsc --noEmit
git add src/app/shop/page.tsx src/components/shop/FilterTabs.tsx
git commit -m "feat(shop): category tabs (Box Custom/Water Decal/3D) + brand filter"
```

---

## Task 8: Full English + mobile hamburger polish

**Files:**
- Modify: `src/components/layout/Header.tsx` (hamburger size + mobile menu text)
- Search all `src/` for remaining Vietnamese text

- [ ] **Step 1: Grep for Vietnamese text**

```bash
grep -rn "Đã bán\|suất\|Bình Thạnh\|TP\.\|hàng\|Còn\|Mua thêm" src/ --include="*.tsx" --include="*.ts"
```

Found locations to fix:
- `src/components/shop/ProductCard.tsx`: `"Đã bán {flashSold}/{FLASH_TOTAL} suất"` → `"{flashSold}/{FLASH_TOTAL} slots sold"`
- `src/app/cart/page.tsx`: freeship message (write in English from Task 6 — already done)

- [ ] **Step 2: Fix Vietnamese in ProductCard**

```tsx
// Before:
`Đã bán ${flashSold}/${FLASH_TOTAL} suất`
// After:
`${flashSold}/${FLASH_TOTAL} slots sold`
```

- [ ] **Step 3: Mobile hamburger — larger spacing + text**

In `src/components/layout/Header.tsx`, find the mobile menu drawer (the panel that opens):

```tsx
// Current mobile menu items likely have text-sm — increase to text-base
// Current padding py-3 — increase to py-4
// Current gap between items — increase from gap-1 to gap-2

// Mobile nav links inside the open menu:
<Link href="/shop" className="block px-6 py-4 text-base font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors border-b border-border">
  Shop
</Link>
// etc.
```

Also increase hamburger icon size from `size={19}` → `size={22}`.

- [ ] **Step 4: TypeScript check + commit**

```bash
npx tsc --noEmit
git add src/components/shop/ProductCard.tsx src/components/layout/Header.tsx
git commit -m "feat: full English, hamburger size 22px, mobile menu text-base"
```

---

## Task 9: Footer — Facebook link + request form

**Files:**
- Modify: `src/components/layout/Footer.tsx`
- Create: `src/components/layout/SampleRequestForm.tsx`

- [ ] **Step 1: Create `src/components/layout/SampleRequestForm.tsx`**

Multi-sample request: user adds multiple car names + optional image per car + their name + phone.

```tsx
'use client'
import { useState, useRef } from 'react'
import { Add, CloseSquare, Image as ImageIcon, Send2 } from 'iconsax-react'

interface SampleItem {
  carName: string
  imageFile: File | null
  imagePreview: string | null
}

const EMPTY_ITEM: SampleItem = { carName: '', imageFile: null, imagePreview: null }

export default function SampleRequestForm() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [items, setItems] = useState<SampleItem[]>([{ ...EMPTY_ITEM }])
  const [submitted, setSubmitted] = useState(false)
  const fileRefs = useRef<(HTMLInputElement | null)[]>([])

  const addItem = () => setItems(prev => [...prev, { ...EMPTY_ITEM }])
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))
  const updateItem = (i: number, patch: Partial<SampleItem>) =>
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, ...patch } : it))

  const onFileChange = (i: number, file: File | null) => {
    if (!file) return
    const preview = URL.createObjectURL(file)
    updateItem(i, { imageFile: file, imagePreview: preview })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Log for now — wire to API later
    console.log('Sample request:', { name, phone, items: items.map(it => ({ carName: it.carName, hasImage: !!it.imageFile })) })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="bg-gold/5 border border-gold/20 rounded-sm px-5 py-6 text-center">
        <p className="text-gold font-bold text-sm mb-1">Request received!</p>
        <p className="text-muted text-xs">We'll contact you on {phone} within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Contact */}
      <div className="grid grid-cols-2 gap-3">
        <input
          required
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="bg-surface border border-border rounded-sm px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:border-gold/40 w-full"
        />
        <input
          required
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="bg-surface border border-border rounded-sm px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:border-gold/40 w-full"
        />
      </div>

      {/* Sample items */}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              required
              placeholder={`Car name — e.g. Porsche 911 GT3 R #77`}
              value={item.carName}
              onChange={e => updateItem(i, { carName: e.target.value })}
              className="flex-1 bg-surface border border-border rounded-sm px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:border-gold/40"
            />
            {/* Image upload */}
            <input
              ref={el => { fileRefs.current[i] = el }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => onFileChange(i, e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRefs.current[i]?.click()}
              title="Attach car photo"
              className={`w-9 h-9 flex items-center justify-center rounded-sm border transition-colors shrink-0 ${
                item.imagePreview
                  ? 'border-gold/40 bg-gold/10'
                  : 'border-border bg-surface text-muted hover:border-gold/40 hover:text-gold'
              }`}
            >
              {item.imagePreview
                ? <img src={item.imagePreview} alt="" className="w-full h-full object-cover rounded-sm" />
                : <ImageIcon size={14} color="currentColor" />
              }
            </button>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="w-9 h-9 flex items-center justify-center text-faint hover:text-error transition-colors shrink-0"
              >
                <CloseSquare size={15} color="currentColor" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-gold transition-colors"
        >
          <Add size={14} color="currentColor" /> Add another car
        </button>
        <button
          type="submit"
          className="ml-auto flex items-center gap-1.5 h-9 px-4 bg-gold text-[#07070C] text-xs font-bold rounded-sm hover:opacity-90 transition-opacity"
        >
          <Send2 size={13} color="currentColor" /> Send Request
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Add Facebook link + request form section to `src/components/layout/Footer.tsx`**

Add Facebook icon import:
```tsx
import { Facebook } from 'iconsax-react'
// check: node -e "const ic = require('...iconsax-react'); console.log(Object.keys(ic).filter(k=>k.includes('Facebook')))"
// if not available, use a simple SVG inline or lucide
```

In the Contact column, add Facebook link:
```tsx
<li>
  <a
    href="https://www.facebook.com/figbox.gr"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-white/40 hover:text-[#1877F2] transition-colors group"
  >
    {/* Facebook SVG inline (iconsax may not have it) */}
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-white/25 group-hover:text-[#1877F2]">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
    <span className="text-sm">figbox.gr</span>
  </a>
</li>
```

Add request section above the footer body grid (full-width panel):
```tsx
{/* Sample Request section */}
<div className="relative border-b border-border/50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
    <div className="max-w-2xl">
      <p className="text-gold text-[10px] font-bold tracking-[0.22em] uppercase mb-2">
        <span className="opacity-40 mr-1.5">//</span>Custom Request
      </p>
      <h3 className="font-display font-extrabold text-white text-xl sm:text-2xl uppercase mb-1">
        Request Your Design
      </h3>
      <p className="text-muted text-xs mb-5 leading-relaxed">
        Tell us your car and we'll design a custom box. Add multiple cars in one request.
      </p>
      <SampleRequestForm />
    </div>
  </div>
</div>
```

- [ ] **Step 3: TypeScript check + commit**

```bash
npx tsc --noEmit
git add src/components/layout/Footer.tsx src/components/layout/SampleRequestForm.tsx
git commit -m "feat(footer): request form (multi-car + image), Facebook link"
```

---

## Self-Review

### Spec coverage check

| Requirement | Task |
|-------------|------|
| Remove ATC from all product cards | Task 4 |
| Swipeable thumbnails on card | Task 4 |
| Box + protect (not box+seal) | Task 1, 2, 3 |
| Cart animation fly to cart | Task 5 |
| Cart freeship promo | Task 6 |
| Mobile hamburger bigger | Task 8 |
| Full English | Task 8 |
| Remove release date | Task 3 |
| Brand per product | Task 1, 2 |
| Smart related products | Task 2, 3 |
| Footer request form | Task 9 |
| Category split + brand filter | Task 7 |
| Facebook contact | Task 9 |

All 13 requirements covered. ✅

### Placeholder scan

- Task 9 Step 2: Facebook SVG is inline — no dependency on iconsax. ✅
- Task 5: `data-cart-icon` and `data-product-main-image` attributes wired across Header + page.tsx. ✅
- All code blocks are complete implementations, not stubs. ✅

### Type consistency

- `CarBrand` defined in Task 1, used in Task 2 products data. ✅
- `'box_protect'` defined in Task 1, renamed everywhere in Task 3. ✅
- `triggerFly(imageUrl: string, sourceRect: DOMRect)` defined in Task 5 store, called in AddToCartButton. ✅
- `flyEvent.imageUrl` + `flyEvent.sourceRect` used consistently in CartFlyAnimation. ✅
