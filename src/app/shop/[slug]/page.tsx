import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Star1 } from 'iconsax-react'
import { getProductBySlug, DUMMY_PRODUCTS, getDiscountedPrice } from '@/lib/data/products'
import { formatVND, formatReleaseDate } from '@/lib/utils/format'
import { getProductReviews } from '@/lib/data/reviews'
import { JsonLd } from '@/components/ui/JsonLd'
import CountdownBadge from '@/components/shop/CountdownBadge'
import ProductCard from '@/components/shop/ProductCard'
import AddToCartButton from '@/components/shop/AddToCartButton'
import ImageGallery from '@/components/shop/ImageGallery'
import StickyCartBar from '@/components/shop/StickyCartBar'

interface PageProps {
  params: Promise<{ slug: string }>
}

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
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) notFound()

  const promo = product.promotion
  const isActive = promo && new Date(promo.ends_at) > new Date()
  const salePrice = getDiscountedPrice(product)
  const isPreOrder = product.status === 'pre_order'
  const isOutOfStock = product.stock === 0 && !isPreOrder

  const related = DUMMY_PRODUCTS.filter(p => p.id !== product.id).slice(0, 4)
  const reviews = getProductReviews(product.slug)
  const racingNumber = product.id.replace(/\D/g, '').padStart(2, '0')

  const availabilityMap: Record<string, string> = {
    active: 'https://schema.org/InStock',
    pre_order: 'https://schema.org/PreOrder',
    out_of_stock: 'https://schema.org/OutOfStock',
  }

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description ?? '',
    brand: { '@type': 'Brand', name: 'figbox.store' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: salePrice,
      availability: availabilityMap[product.status] ?? 'https://schema.org/InStock',
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://figbox.store' },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: 'https://figbox.store/shop' },
      { '@type': 'ListItem', position: 3, name: product.name },
    ],
  }

  const badge = isActive ? (
    <CountdownBadge
      label={isPreOrder ? 'SHIPS IN' : promo!.type === 'flash_sale' ? 'ENDS IN' : 'SALE ENDS'}
      endDate={promo!.ends_at}
      variant={promo!.type}
    />
  ) : undefined

  return (
    <div className="bg-[#07070C] min-h-screen">
      <JsonLd data={productSchema as Record<string, unknown>} />
      <JsonLd data={breadcrumbSchema as Record<string, unknown>} />

      {/* Hero name band */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundImage: [
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 6px)',
            'repeating-linear-gradient(-45deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 6px)',
          ].join(', '),
          backgroundSize: '6px 6px',
          backgroundColor: '#07070C',
        }}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-8">
          {/* Racing number watermark */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-4 font-display font-extrabold select-none pointer-events-none leading-none"
            style={{ fontSize: 'clamp(100px, 16vw, 200px)', color: 'rgba(255,255,255,0.028)' }}
          >
            {racingNumber}
          </div>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted mb-5">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="text-faint">/</span>
            <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
            <span className="text-faint">/</span>
            <span className="text-primary font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>

          {/* Overline */}
          <p className="text-gold text-[10px] font-bold tracking-[0.2em] uppercase mb-3">
            <span className="opacity-40 mr-1.5 tracking-[0.05em]">//</span>Custom Box · MiniGT
          </p>

          {/* h1 - only one per page */}
          <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl lg:text-5xl uppercase leading-none tracking-tight">
            {product.name}
          </h1>

          {/* Meta badges */}
          <div className="flex items-center gap-2 flex-wrap mt-3">
            <span
              className="inline-flex items-center h-[18px] px-1.5 rounded bg-[#0f0f0f] text-white font-extrabold leading-none border border-[#333]"
              style={{ fontSize: '9px', letterSpacing: '0.01em' }}
            >
              Mi<span style={{ color: '#e8002d' }}>N</span>i<span style={{ color: '#e8002d' }}>GT</span>
            </span>
            {product.material && (
              <span className="text-[10px] text-[#a08070] border border-[#3a2e28] rounded px-1.5 py-0.5 leading-none">
                {product.material === 'box_seal' ? 'Box + Seal' : 'Box Only'}
              </span>
            )}
            {product.release_date && (
              <span className="text-[10px] text-[#666] leading-none">
                {formatReleaseDate(product.release_date)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* 2-col grid: gallery left, info right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Left: ImageGallery */}
          <ImageGallery images={product.images} name={product.name} badge={badge} />

          {/* Right: info + actions */}
          <div className="flex flex-col gap-5">
            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className={`font-extrabold text-3xl ${isActive && promo!.discount_pct > 0 ? 'text-error' : 'text-primary'}`}>
                {formatVND(salePrice)}
              </span>
              {isActive && promo!.discount_pct > 0 && (
                <span className="text-faint line-through text-base">{formatVND(product.price)}</span>
              )}
            </div>

            {/* Status badges */}
            {isActive && promo!.discount_pct > 0 && (
              <span className="inline-flex items-center bg-gold/10 border border-gold/30 text-gold text-xs font-bold px-3 py-1.5 rounded-sm w-fit uppercase tracking-wide">
                {promo!.label}
              </span>
            )}
            {isPreOrder && (
              <span className="inline-flex items-center bg-blue-900/40 border border-blue-700/40 text-blue-300 text-xs font-bold px-3 py-1.5 rounded-sm w-fit uppercase tracking-wide">
                Pre-order — Reserve at launch price
              </span>
            )}
            {isOutOfStock && (
              <span className="inline-flex items-center bg-surface border border-border text-muted text-xs font-bold px-3 py-1.5 rounded-sm w-fit uppercase tracking-wide">
                Out of stock
              </span>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-muted leading-relaxed text-sm">{product.description}</p>
            )}

            {/* Telemetry spec rows */}
            <div className="border-t border-border pt-4">
              {([
                ['Size', '120 × 55 × 40 mm (MiniGT standard)'],
                ['Material', '350gsm coated cardboard'],
                ['Finish', 'Matte laminate + spot UV'],
                ['Lead time', isPreOrder ? 'Ships mid-July 2026' : '3–5 business days'],
              ] as const).map(([label, value]) => (
                <div key={label} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                  <div className="w-0.5 h-3.5 bg-gold rounded-sm shrink-0" aria-hidden="true" />
                  <span className="text-[11px] text-muted font-medium w-28 shrink-0">{label}</span>
                  <span className="text-[11px] text-primary">{value}</span>
                </div>
              ))}
            </div>

            {/* Custom-box how-it-works note */}
            {product.type === 'box_custom' && (
              <div className="bg-gold/5 border border-gold/20 rounded-sm px-4 py-3 text-xs text-muted leading-relaxed">
                <span className="font-semibold text-primary block mb-0.5">How custom orders work</span>
                After checkout, we&apos;ll email you instructions to upload your car photo. Our team designs and prints your personalised box.
              </div>
            )}

            {/* Add to cart */}
            <AddToCartButton product={product} />

            {/* Sticky bar - sentinel div is rendered here, bar is fixed */}
            <StickyCartBar product={product} salePrice={salePrice} />

            <Link href="/shop" className="inline-flex items-center gap-1.5 text-muted hover:text-primary text-xs transition-colors w-fit">
              ← Back to shop
            </Link>
          </div>
        </div>

        {/* Customer reviews */}
        <section aria-labelledby="reviews-heading" className="border-t border-border pt-12 mb-16">
          <div className="mb-8">
            <p className="text-gold text-[10px] font-bold tracking-widest uppercase mb-2">
              <span className="opacity-40 mr-1.5 tracking-[0.05em]">//</span>Customer Feedback
            </p>
            <h2 id="reviews-heading" className="font-display font-extrabold text-primary text-2xl sm:text-3xl">
              What Collectors Say
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {reviews.map((r, i) => (
              <article key={i} className="bg-surface border border-border rounded-sm p-4 flex flex-col gap-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: r.stars }).map((_, s) => (
                    <Star1 key={s} size={13} color="var(--gold)" variant="Bold" />
                  ))}
                </div>
                <blockquote className="text-muted text-sm leading-relaxed flex-1">
                  &ldquo;{r.quote}&rdquo;
                </blockquote>
                <footer className="flex items-center gap-3 pt-3 border-t border-border">
                  <div className="w-8 h-8 rounded-full bg-[#1A1A2E] border border-[#2A2A42] flex items-center justify-center text-gold font-bold text-xs shrink-0">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-primary text-xs font-semibold">{r.name}</p>
                    <p className="text-faint text-[10px]">{r.city}</p>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </section>

        {/* Related products */}
        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="border-t border-border pt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 id="related-heading" className="font-display font-extrabold text-primary text-2xl">
                You may also like
              </h2>
              <Link href="/shop" className="text-xs text-gold hover:text-gold-mid transition-colors">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
