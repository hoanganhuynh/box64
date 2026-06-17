import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'
import { getProductBySlug } from '@/lib/data/products'
import PriceDisplay from '@/components/shop/PriceDisplay'
import CountdownBadge from '@/components/shop/CountdownBadge'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) notFound()

  const promo = product.promotion
  const isActive = promo && new Date(promo.ends_at) > new Date()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/shop" className="inline-flex items-center gap-1.5 text-muted hover:text-primary text-sm mb-8 transition-colors">
        <ArrowLeft size={14} /> Back to shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="relative aspect-[3/2] rounded bg-[#111212] overflow-hidden">
          <Image
            src={product.images[0]} alt={product.name}
            fill className="object-cover" priority unoptimized
          />
          {isActive && (
            <div className="absolute bottom-3 right-3">
              <CountdownBadge
                label={promo!.type === 'pre_order' ? 'SHIPS IN' : 'SALE ENDS'}
                endDate={promo!.ends_at}
                variant={promo!.type}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-1">
              {product.type === 'box_custom' ? 'Box Custom' : 'Box Catalog'}
            </p>
            <h1 className="font-jakarta font-extrabold text-primary text-2xl sm:text-3xl leading-tight">
              {product.name}
            </h1>
          </div>

          {isActive && (
            <div className="inline-flex items-center gap-2 bg-gold-light border border-gold/30 text-gold rounded-sm px-3 py-2 text-sm font-semibold w-fit">
              {promo!.label}
            </div>
          )}

          <div className="text-2xl">
            <PriceDisplay price={product.price} discountPct={isActive ? promo!.discount_pct : undefined} />
          </div>

          {product.description && (
            <p className="text-muted leading-relaxed">{product.description}</p>
          )}

          <div className="flex flex-col gap-3 pt-2">
            {product.type === 'box_custom' ? (
              <Link
                href="/designer"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-sm bg-gold text-white font-semibold hover:bg-gold-mid transition-colors"
              >
                <Package size={16} /> Design Your Box
              </Link>
            ) : (
              <button className="h-12 px-8 rounded-sm bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
                {product.status === 'pre_order' ? 'Pre-order Now' : 'Add to Cart'}
              </button>
            )}
          </div>

          <div className="border-t border-border pt-4 text-xs text-faint space-y-1">
            <p>MiniGT size: 120 × 55 × 40mm</p>
            <p>Poprace size: 115 × 60 × 45mm</p>
            <p>Print-ready PDF generated after order</p>
          </div>
        </div>
      </div>
    </div>
  )
}
