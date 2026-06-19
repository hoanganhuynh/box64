'use client'

import { useRef, useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { useDesignerStore } from '@/lib/store/designer'
import { exportBoxPdf } from '@/lib/pdf/exportPdf'
import SidePanelLeft  from './SidePanelLeft'
import FlatDesignCanvas from './FlatDesignCanvas'
import Box3DPreview    from './Box3DPreview'
import BoxCanvas       from './BoxCanvas'
import type { BoxCanvasRef } from './BoxCanvas'

const GAP = 32 // px between columns

export default function DesignerShell() {
  const state = useDesignerStore()
  const canvasRef = useRef<BoxCanvasRef>(null)
  const [colWidths, setColWidths] = useState({ left: 0, mid: 0, right: 0 })
  const shellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function measure() {
      const total = shellRef.current?.offsetWidth ?? 1280
      const left  = Math.round((total - GAP * 2) * 0.25)
      const right = left
      const mid   = total - GAP * 2 - left - right
      setColWidths({ left, mid, right })
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (shellRef.current) ro.observe(shellRef.current)
    return () => ro.disconnect()
  }, [])

  async function handleExport() {
    const cr = canvasRef.current
    if (!cr) return
    await cr.redraw()
    await exportBoxPdf(state, { front: cr.front, top: cr.top, side: cr.side })
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <div className="bg-header border-b border-white/10 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div>
          <h1 className="font-jakarta font-extrabold text-white text-xl">Design Your Box</h1>
          <p className="text-white/40 text-xs mt-0.5">1:64 Scale · MiniGT &amp; Poprace sizes</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 h-9 px-5 rounded bg-gold text-white font-semibold text-sm hover:bg-gold-mid transition-colors"
        >
          <Download size={14} /> Export PDF
        </button>
      </div>

      {/* 3-column layout */}
      <div ref={shellRef} className="flex" style={{ gap: GAP, padding: `${GAP}px` }}>
        {/* Col 1 — Controls (25%) */}
        <aside
          className="shrink-0 overflow-y-auto"
          style={{
            width: colWidths.left || '25%',
            maxHeight: 'calc(100vh - 80px)',
            position: 'sticky',
            top: 80,
            alignSelf: 'flex-start',
          }}
        >
          <SidePanelLeft />
        </aside>

        {/* Col 2 — Flat design canvas (50%) */}
        <main className="flex-1 min-w-0">
          <div className="bg-[#161616] rounded-xl border border-white/5 overflow-auto p-4">
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-4">
              Flat template · Click faces to edit · Drag icons onto Green face
            </p>
            <FlatDesignCanvas containerWidth={colWidths.mid || undefined} />
          </div>
        </main>

        {/* Col 3 — 3D preview (25%) */}
        <aside
          className="shrink-0"
          style={{
            width: colWidths.right || '25%',
            position: 'sticky',
            top: 80,
            alignSelf: 'flex-start',
          }}
        >
          <div className="bg-[#161616] rounded-xl border border-white/5">
            <Box3DPreview />
          </div>
        </aside>
      </div>

      {/* Hidden canvas for PDF export */}
      <BoxCanvas ref={canvasRef} />
    </div>
  )
}
