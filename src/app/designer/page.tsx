import type { Metadata } from 'next'
import DesignerShell from '@/components/designer/DesignerShell'

export const metadata: Metadata = {
  title: 'Design Your Box | Box64',
  description: 'Create a custom 1:64 scale diecast box with your car photo and colors.',
}

export default function DesignerPage() {
  return <DesignerShell />
}
