import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-header border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          <div className="col-span-2 md:col-span-1">
            <p className="font-jakarta font-extrabold text-white text-base mb-2">
              Box<span className="text-gold">64</span>
            </p>
            <p className="text-white/50 text-sm leading-relaxed">
              Custom packaging boxes for 1:64 scale diecast model cars.
            </p>
          </div>

          <div>
            <p className="text-white/80 font-semibold text-sm mb-3">Shop</p>
            <ul className="space-y-2">
              <li>
                <Link href="/shop" className="text-white/50 hover:text-white text-sm transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?type=box_catalog" className="text-white/50 hover:text-white text-sm transition-colors">
                  Box Catalog
                </Link>
              </li>
              <li>
                <Link href="/designer" className="text-white/50 hover:text-white text-sm transition-colors">
                  Design Your Box
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-white/80 font-semibold text-sm mb-3">Support</p>
            <ul className="space-y-2">
              <li>
                <Link href="/track" className="text-white/50 hover:text-white text-sm transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Box64. All rights reserved.
          </p>
          <p className="text-white/40 text-xs">Made for 1:64 collectors</p>
        </div>
      </div>
    </footer>
  )
}
