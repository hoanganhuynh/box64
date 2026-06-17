'use client'

import { useRef } from 'react'
import { Download, RotateCcw } from 'lucide-react'
import { useDesignerStore } from '@/lib/store/designer'
import BoxPreview from './BoxPreview'
import type { BoxCanvasRef } from './BoxCanvas'
import { exportBoxPdf } from '@/lib/pdf/exportPdf'

interface Props {
  canvasRef: React.RefObject<BoxCanvasRef | null>
}

export default function Step4Preview({ canvasRef }: Props) {
  const { car_name, prevStep, reset } = useDesignerStore()
  const state = useDesignerStore()
  const exporting = useRef(false)

  async function handleExport() {
    if (exporting.current) return
    exporting.current = true
    const cr = canvasRef.current
    if (!cr) { exporting.current = false; return }
    await cr.redraw()
    await exportBoxPdf(state, { front: cr.front, top: cr.top, side: cr.side })
    exporting.current = false
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="font-jakarta font-extrabold text-primary text-xl">Box Preview</h2>
        <p className="text-muted text-sm">
          {car_name ? `Your ${car_name} box` : 'Custom box'} · Download the print-ready PDF
        </p>
      </div>

      <div className="bg-header rounded-xl overflow-hidden">
        <BoxPreview canvasRef={canvasRef} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 h-12 rounded bg-gold text-white font-semibold hover:bg-gold-mid transition-colors"
        >
          <Download size={16} /> Download PDF
        </button>
        <button
          onClick={prevStep}
          className="flex items-center justify-center gap-2 h-12 rounded border border-border text-muted text-sm hover:border-gold/40 transition-colors"
        >
          ← Edit Colors
        </button>
      </div>

      <button
        onClick={reset}
        className="w-full flex items-center justify-center gap-1.5 text-xs text-faint hover:text-muted transition-colors py-2"
      >
        <RotateCcw size={12} /> Start over
      </button>
    </div>
  )
}
