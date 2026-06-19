# Product Detail Page Revamp — Design Spec

**Goal:** Revamp `src/app/shop/[slug]/page.tsx` to match the home page's dark racing aesthetic — strong automotive/sport vibe, Barlow Condensed headings, gold accents, telemetry-style specs, customer reviews, SEO structured data, and a sticky Add-to-Cart bar.

**Approved approach:** A — Racing Spec Sheet

---

## 1. Architecture

`page.tsx` remains a **server component**. Interactive sub-parts are extracted as `'use client'` components:

| File | Type | Responsibility |
|------|------|----------------|
| `src/app/shop/[slug]/page.tsx` | Server | Data fetch, layout, SEO metadata, JSON-LD |
| `src/components/shop/ImageGallery.tsx` | Client | Main image + thumbnail row, click-to-swap |
| `src/components/shop/StickyCartBar.tsx` | Client | IntersectionObserver → slide-in bar from bottom |
| `src/components/shop/AddToCartButton.tsx` | Client | Already exists — reused in sticky bar too |

---

## 2. Visual Design System

Match home page exactly:
- **Background:** `bg-[#07070C]` (`--color-bg`)
- **Headings:** `font-display font-extrabold` (Barlow Condensed)
- **Overlines:** `// SECTION NAME` pattern, `text-gold text-[10px] tracking-widest uppercase`
- **Buttons:** `rounded-sm` (not `rounded-xl`)
- **Icons:** `iconsax-react` (replace current `lucide-react` imports in this file)
- **Gold accent:** `#F5A623` / Tailwind `text-gold`, `border-gold`
- **Border:** `border-border` (`#1E1E2C`) for subtle dark dividers

---

## 3. Page Sections

### 3a. Hero Name Band (full-width, above 2-col)

A full-width dark header band above the image/info columns.

```
bg-[#07070C] with 6px carbon-fiber weave pattern (same as home New Arrivals):
  repeating-linear-gradient(45deg, rgba(255,255,255,0.018) ...) + repeating-linear-gradient(-45deg, ...)
```

Contents:
- **Racing number watermark:** derived from `product.id` — e.g. `'fb-03'` → `'03'`. Extract with `product.id.replace(/\D/g, '').padStart(2, '0')`. Size `clamp(100px,16vw,200px)`, color `rgba(255,255,255,0.028)`, `absolute top-0 right-0`, `font-display font-extrabold`, `pointer-events-none select-none`
- **Overline:** `// CUSTOM BOX · MINIGT` — `text-gold text-[10px] font-bold tracking-[0.2em] uppercase`
- **`<h1>`:** `font-display font-extrabold text-white text-3xl sm:text-4xl lg:text-5xl uppercase leading-none tracking-tight`
- **Meta badges row** (below h1, `mt-3`):
  - MiniGT logo badge: `bg-[#0f0f0f] text-white` with `Mi<red>N</red>i<red>GT</red>` (same as Flash Sale cards)
  - Material: `border border-[#3a2e28] text-[#a08070] text-[10px] rounded px-1.5 py-0.5`
  - Release date: `text-[10px] text-[#666]` via `formatReleaseDate()`

### 3b. Main 2-Col Layout

`grid grid-cols-1 lg:grid-cols-2` below the hero band.

**Left column — ImageGallery:**
- Main image: `aspect-square rounded-sm overflow-hidden bg-[#0C0C18]`; existing `CountdownBadge` stays on bottom-left
- Thumbnail row: 3 thumbnails (`aspect-square`, `border border-border`, active state = `border-gold`). Click swaps main image via `useState`
- Trust badges row (3 items): `iconsax-react` icons (`TickCircle`, `Box`, `Truck`), `bg-[#0F0F18] border border-border rounded-sm`

**Right column — info panel:**
- Price block: sale price `text-3xl font-extrabold text-error`, original `line-through text-faint`; promo badge (`bg-gold/10 border-gold/30 text-gold`) when active
- Pre-order badge: `bg-blue-900/40 border border-blue-700/40 text-blue-300` — replaces current `bg-blue-50` (wrong for dark theme)
- **Telemetry spec rows:** `border-t border-border` container; each row is `flex items-center gap-2 py-2.5 border-b border-border last:border-0` with a `2px × 14px bg-gold rounded-sm` left accent bar, label `text-[11px] text-muted w-28`, value `text-[11px] text-primary`
- Spec rows: Size, Material, Finish, Lead time
- Custom-box note (`isCustom`): keep existing logic but restyle to `bg-gold/5 border-gold/20 rounded-sm`
- **Add to Cart button:** reuse `AddToCartButton`; the button already has `rounded-sm`
- "Back to shop" link below CTA

### 3c. Customer Reviews

Full-width section below the 2-col, `border-t border-border pt-12`.

```
// CUSTOMER FEEDBACK     ← overline
What collectors say      ← h2 font-display font-extrabold text-white text-2xl
```

- Pull reviews from a shared `REVIEWS` constant (same data pool as `ReviewsStrip.tsx`)
- Display 4 reviews offset by product slug hash (so different products show different reviews)
- Layout: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`
- Each card: `bg-surface border border-border rounded-sm p-4`
  - Stars: gold `★★★★★` text
  - Quote text: `text-sm text-muted leading-relaxed`
  - Reviewer: `text-xs text-faint font-medium`

### 3d. Related Products

Keep existing section, no visual change needed beyond existing `ProductCard` component. Already dark-themed.

---

## 4. SEO

### `generateMetadata` export

```ts
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) return {}
  return {
    title: `${product.name} | figbox.store`,
    description: product.description ?? `Custom MiniGT box for ${product.name}. 350gsm matte print, shipped nationwide.`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.images[0] }],
    },
  }
}
```

### Schema.org JSON-LD

Injected as a `<script type="application/ld+json">` element in the server component. The JSON string is built via `JSON.stringify()` with no raw HTML — no XSS risk:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "<product.name>",
  "image": ["<product.images[0]>"],
  "description": "<product.description>",
  "brand": { "@type": "Brand", "name": "figbox.store" },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "VND",
    "price": "<salePrice>",
    "availability": "https://schema.org/InStock"
  }
}
```

Availability maps: `active` → `InStock`, `pre_order` → `PreOrder`, `out_of_stock` → `OutOfStock`.

### BreadcrumbList markup

Wrap existing breadcrumb nav with `BreadcrumbList` schema (Home → Shop → Product).

### Heading hierarchy

- One `<h1>` — product name (in hero band)
- `<h2>` — "What collectors say" (reviews), "You may also like" (related)
- No heading level skipped

---

## 5. ImageGallery Component

**File:** `src/components/shop/ImageGallery.tsx`

```ts
'use client'
interface Props { images: string[]; name: string; badge?: React.ReactNode }
```

- `useState<number>(0)` for active thumbnail index
- Main image: `<Image src={images[activeIdx]} ...>`
- Thumbnail row: map over `images`, clicking sets `activeIdx`
- If `images.length === 1`: still render 3 thumbnails all pointing to the same image (visual consistency)
- `badge` prop: optional ReactNode rendered bottom-left of main image (hosts `CountdownBadge`)

---

## 6. StickyCartBar Component

**File:** `src/components/shop/StickyCartBar.tsx`

```ts
'use client'
interface Props { product: Product; salePrice: number }
```

- Mounts a `ref` on a sentinel `<div>` placed immediately after the main `AddToCartButton`
- `useEffect` → `IntersectionObserver` watches sentinel; when it leaves viewport, sets `visible = true`
- Renders: `fixed bottom-0 left-0 right-0 z-50 bg-[#07070C]/95 backdrop-blur-sm border-t border-border`
- Content: product name (truncated, `text-sm text-muted`), sale price (`text-white font-bold`), and a plain gold button `bg-gold text-[#07070C] text-xs font-bold px-5 py-2.5 rounded-sm uppercase tracking-wide` — does NOT reuse `AddToCartButton` (which has its own layout logic); this button just calls the same cart add action via a shared util when that's wired up
- Transition: `translate-y-full → translate-y-0` with `transition-transform duration-300 ease-out`
- Safe area: `padding-bottom: env(safe-area-inset-bottom)` for mobile home bar

---

## 7. Data — Reviews

Extract the reviews array from `ReviewsStrip.tsx` into a shared constant:

**File:** `src/lib/data/reviews.ts` (new)

Move the `REVIEWS` array from `ReviewsStrip.tsx` to this file. Both `ReviewsStrip` and the product detail page import from `reviews.ts`.

Product page selects 4 reviews: `REVIEWS.slice(offset, offset + 4)` where `offset = slugHash % (REVIEWS.length - 4)` and `slugHash` is a simple sum of char codes from `product.slug`.

---

## 8. Constraints & Non-goals

- **JSON-LD safety:** JSON-LD script tag content is built with `JSON.stringify()` — all values are data-typed, no raw HTML injection possible
- **No new fonts** — `font-display` is already `Barlow Condensed`, loaded globally
- **WCAG:** minimum `text-xs` (12px) throughout; badges can use `text-[10px]` but no body copy below 12px
- **No new external packages** — use `iconsax-react` (already installed) and built-in Next.js features
- **Out of scope:** real cart API, image upload for custom orders, review submission form
