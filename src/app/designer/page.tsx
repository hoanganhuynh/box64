import type { Metadata } from 'next'
import DesignerWizard from '@/components/designer/DesignerWizard'

export const metadata: Metadata = {
  title: 'Design Your Box | Box64',
  description: 'Create a custom 1:64 scale diecast box with your car photo and colors.',
}

export default function DesignerPage() {
  return (
    <main className="min-h-screen bg-bg">
      <div className="bg-header py-10 text-center">
        <h1 className="font-jakarta font-extrabold text-white text-3xl sm:text-4xl">
          Design Your Box
        </h1>
        <p className="text-white/50 mt-2 text-sm">
          4 steps · Download print-ready PDF · MiniGT &amp; Poprace sizes
        </p>
      </div>
      <DesignerWizard />
    </main>
  )
}
