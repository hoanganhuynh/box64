import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Barlow_Condensed } from 'next/font/google'
import './globals.css'

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
  metadataBase: new URL('https://figbox.store'),
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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${barlowCondensed.variable}`}>
      <body className="min-h-dvh bg-bg">
        {children}
      </body>
    </html>
  )
}
