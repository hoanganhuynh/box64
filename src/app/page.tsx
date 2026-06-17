import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="bg-header min-h-[80vh] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">

        <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-4">
          1:64 Scale · MiniGT · Poprace
        </p>

        <h1 className="font-jakarta font-extrabold text-white text-4xl sm:text-5xl md:text-6xl leading-tight mb-6">
          Custom Boxes for Your<br />
          <span className="text-gold">Diecast Collection</span>
        </h1>

        <p className="text-white/60 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Design your own packaging or choose from our catalog.
          Print-ready quality, shipped to your door.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center h-12 px-8 rounded-sm bg-gold text-white font-semibold text-sm hover:bg-gold-mid transition-colors"
          >
            Browse Catalog
          </Link>
          <Link
            href="/designer"
            className="inline-flex items-center justify-center h-12 px-8 rounded-sm border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
          >
            Design Your Box
          </Link>
        </div>

      </div>
    </div>
  )
}
