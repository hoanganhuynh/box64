import { jsPDF } from 'jspdf'
import type { BoxSize, DesignState } from '@/lib/types'


type FaceDef = {
  name: 'front' | 'back' | 'top' | 'bottom' | 'side' | 'side2'
  x: number; y: number; w: number; h: number
}

export type PdfLayout = {
  pageW: number; pageH: number
  faces: FaceDef[]
}

// Real-world box dimensions in mm (approx MiniGT / Poprace)
const BOX_REAL_MM: Record<BoxSize, { fw: number; fh: number; tw: number; th: number; sw: number; sh: number }> = {
  minigt:  { fw: 120, fh: 55, tw: 120, th: 40, sw: 55, sh: 40 },
  poprace: { fw: 115, fh: 60, tw: 115, th: 45, sw: 60, sh: 45 },
}

export function getPdfLayout(size: BoxSize): PdfLayout {
  const d = BOX_REAL_MM[size]
  const pad = 6  // mm gap between faces
  const margin = 15 // left margin

  // Cross-style flat layout:
  //           [top]
  // [side] [front] [back] [side2]
  //           [bottom]

  const topX    = margin + d.sw + pad
  const topY    = margin
  const frontX  = margin + d.sw + pad
  const frontY  = margin + d.th + pad
  const sideX   = margin
  const sideY   = frontY
  const backX   = margin + d.sw + pad + d.fw + pad
  const backY   = frontY
  const side2X  = backX + d.fw + pad
  const side2Y  = frontY
  const botX    = frontX
  const botY    = frontY + d.fh + pad

  const pageW = side2X + d.sw + margin
  const pageH = botY + d.th + margin

  return {
    pageW, pageH,
    faces: [
      { name: 'top',    x: topX,   y: topY,   w: d.tw, h: d.th },
      { name: 'front',  x: frontX, y: frontY, w: d.fw, h: d.fh },
      { name: 'side',   x: sideX,  y: sideY,  w: d.sw, h: d.sh },
      { name: 'back',   x: backX,  y: backY,  w: d.fw, h: d.fh },
      { name: 'side2',  x: side2X, y: side2Y, w: d.sw, h: d.sh },
      // bottom is added below total count but included in faces for convenience
      { name: 'bottom', x: botX,   y: botY,   w: d.tw, h: d.th },
    ],
  }
}

type CanvasRefs = {
  front: HTMLCanvasElement | null
  top:   HTMLCanvasElement | null
  side:  HTMLCanvasElement | null
}

export async function exportBoxPdf(state: DesignState, refs: CanvasRefs): Promise<void> {
  const layout = getPdfLayout(state.box_size)

  const doc = new jsPDF({
    orientation: layout.pageW > layout.pageH ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [layout.pageW, layout.pageH],
  })

  // Draw cut guides (dashed lines)
  doc.setLineWidth(0.15)
  doc.setDrawColor(180, 180, 180)

  for (const face of layout.faces) {
    doc.rect(face.x, face.y, face.w, face.h, 'S')

    const canvas =
      face.name === 'front' || face.name === 'back'    ? refs.front :
      face.name === 'top'   || face.name === 'bottom'  ? refs.top   :
      refs.side

    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png')
      doc.addImage(dataUrl, 'PNG', face.x, face.y, face.w, face.h)
    } else {
      // Fill placeholder color when canvas not rendered
      doc.setFillColor(state.bg_color)
      doc.rect(face.x, face.y, face.w, face.h, 'F')
    }
  }

  doc.save(`box64-${state.car_name.replace(/\s+/g, '-') || 'custom'}.pdf`)
}
