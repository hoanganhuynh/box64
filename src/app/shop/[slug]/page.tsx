import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, PackageCheck, Truck } from 'lucide-react'
import { getProductBySlug, DUMMY_PRODUCTS, getDiscountedPrice } from '@/lib/data/products'
import CountdownBadge from '@/components/shop/CountdownBadge'
import ProductCard from '@/components/shop/ProductCard'
import AddToCartButton from '@/components/shop/AddToCartButton'
import { formatVND } from '@/lib/utils/format'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) notFound()

  const promo = product.promotion
  const isActive = promo && new Date(promo.ends_at) > new Date()
  const salePrice = getDiscountedPrice(product)
  const isCustom = product.type === 'box_custom'
  const isPreOrder = product.status === 'pre_order'

  const related = DUMMY_PRODUCTS
    .filter(p => p.id !== product.id && p.type === product.type)
    .slice(0, 4)

  return (
    <div className="bg-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-faint">/</span>
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <span className="text-faint">/</span>
          <span className="text-primary font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* ── Main layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">

          {/* Left: image + trust signals */}
          <div>
            <div className="relative aspect-square rounded-sm overflow-hidden bg-[#09090F] mb-3">
              <Image src={product.images[0]} alt={product.name} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 50vw" />
              {isActive && (
                <div className="absolute bottom-3 left-3">
                  <CountdownBadge
                    label={isPreOrder ? 'SHIPS IN' : promo!.type === 'flash_sale' ? 'ENDS IN' : 'SALE ENDS'}
                    endDate={promo!.ends_at}
                    variant={promo!.type}
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {([
                { icon: CheckCircle2, text: 'Print-ready quality' },
                { icon: PackageCheck, text: 'Secure packaging' },
                { icon: Truck, text: 'Nationwide delivery' },
              ] as const).map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1.5 bg-surface border border-border rounded-sm py-3 px-2 text-center">
                  <Icon size={15} className="text-gold" />
                  <p className="text-[10px] text-muted leading-tight">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: info + actions */}
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-faint mb-2">
                {isCustom ? 'Custom Box' : 'MiniGT Template'}
              </p>
              <h1 className="font-jakarta font-extrabold text-primary text-2xl sm:text-3xl leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Promo badges */}
            {isActive && promo!.discount_pct > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-gold/10 border border-gold/30 text-gold text-xs font-bold px-3 py-1.5 rounded-sm w-fit uppercase tracking-wide">
                {promo!.label}
              </span>
            )}
            {isPreOrder && (
              <span className="inline-flex items-center bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-sm w-fit uppercase tracking-wide">
                Pre-order — Reserve at launch price
              </span>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className={`font-extrabold text-3xl ${isActive && promo!.discount_pct > 0 ? 'text-error' : 'text-primary'}`}>
                {formatVND(salePrice)}
              </span>
              {isActive && promo!.discount_pct > 0 && (
                <span className="text-faint line-through text-base">{formatVND(product.price)}</span>
              )}
            </div>

            {product.description && (
              <p className="text-muted leading-relaxed text-sm">{product.description}</p>
            )}

            {/* Specs table */}
            <div className="border border-border rounded-sm overflow-hidden">
              <table className="w-full text-xs">
                <tbody>
                  {[
                    ['Size', '120 × 55 × 40 mm (MiniGT standard)'],
                    ['Material', '350gsm coated cardboard'],
                    ['Finish', 'Matte laminate + spot UV'],
                    ['Lead time', isPreOrder ? 'Ships mid-July 2026' : '3–5 business days'],
                  ].map(([label, value]) => (
                    <tr key={label} className="border-b border-border last:border-0">
                      <td className="bg-bg px-4 py-2.5 text-muted font-medium w-32">{label}</td>
                      <td className="px-4 py-2.5 text-primary">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Custom box note */}
            {isCustom && (
              <div className="bg-gold/5 border border-gold/20 rounded-sm px-4 py-3 text-xs text-muted leading-relaxed">
                <span className="font-semibold text-primary block mb-0.5">How custom orders work</span>
                After checkout, we&apos;ll email you instructions to upload your car photo and details. Our team designs and prints your personalised box.
              </div>
            )}

            {/* Add to cart CTA */}
            <AddToCartButton product={product} />

            <Link href="/shop" className="inline-flex items-center gap-1.5 text-muted hover:text-primary text-xs transition-colors w-fit">
              ← Back to shop
            </Link>
          </div>
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <div className="border-t border-border pt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-jakarta font-extrabold text-primary text-xl">You may also like</h2>
              <Link href="/shop" className="text-xs text-gold hover:text-gold-mid transition-colors">View all →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
