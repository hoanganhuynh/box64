import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Barlow_Condensed } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { TruckFast, Flash, Star1 } from 'iconsax-react'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'figbox.store — Premium Custom 1:64 Diecast Box',
  description: 'Premium custom packaging for 1:64 MiniGT diecast model cars. Designed in Illustrator, printed on 350gsm, laser-cut, hand folded. Nationwide delivery.',
  openGraph: {
    title: 'figbox.store — Premium Custom 1:64 Diecast Box',
    description: 'Premium custom packaging for 1:64 MiniGT diecast model cars. Handmade in Vietnam.',
    images: [{ url: '/banner.jpg', width: 1200, height: 630 }],
    siteName: 'figbox.store',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/banner.jpg'],
  },
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${barlowCondensed.variable}`}>
      <body className="min-h-dvh flex flex-col bg-bg">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-gold focus:text-[#07070C] focus:font-semibold focus:rounded-sm focus:text-sm"
        >
          Skip to main content
        </a>
        {/* ── Announcement bar ── */}
        <div className="bg-gold text-[#07070C] text-xs font-semibold py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
            <span className="flex items-center gap-1.5">
              <TruckFast size={13} color="currentColor" /> Free shipping on orders 500k+
            </span>
            <span className="w-px h-3 bg-black/20 hidden sm:block" />
            <span className="flex items-center gap-1.5">
              <Flash size={13} color="currentColor" variant="Bold" /> Flash Sale live — up to 15% off
            </span>
            <span className="w-px h-3 bg-black/20 hidden sm:block" />
            <span className="hidden sm:flex items-center gap-1.5">
              <Star1 size={12} color="currentColor" variant="Bold" /> 4.9★ · 500+ boxes shipped
            </span>
          </div>
        </div>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
