'use client'

import { CANVAS_W, CANVAS_H, FACE_POS } from '@/lib/designer-constants'
import FaceOrange from './faces/FaceOrange'
import FaceBlueT  from './faces/FaceBlueT'
import FaceBlueB  from './faces/FaceBlueB'
import FacePink   from './faces/FacePink'
import FaceGreen  from './faces/FaceGreen'

// Thin gap lines between faces (shows cut guides)
const GAP = 1

interface Props {
  /** Outer container width in px — canvas scales to fit */
  containerWidth?: number
}

export default function FlatDesignCanvas({ containerWidth }: Props) {
  const scale = containerWidth ? Math.min(1, (containerWidth - 16) / CANVAS_W) : 1

  const W = Math.round(CANVAS_W * scale)
  const H = Math.round(CANVAS_H * scale)

  function pos(p: typeof FACE_POS.orange) {
    return {
      left: Math.round(p.left * scale),
      top:  Math.round(p.top  * scale),
      w:    Math.round(p.w    * scale),
      h:    Math.round(p.h    * scale),
    }
  }

  return (
    <div
      className="relative mx-auto shrink-0"
      style={{ width: W, height: H }}
    >
      {/* Cut-guide border for the whole canvas */}
      <div className="absolute inset-0 rounded-sm ring-1 ring-white/5 pointer-events-none" />

      {/* Face: Blue T */}
      {(() => { const p = pos(FACE_POS.blueT); return (
        <div className="absolute" style={{ left: p.left, top: p.top, width: p.w, height: p.h, outline: `${GAP}px solid #222` }}>
          <FaceBlueT width={p.w} height={p.h} />
        </div>
      )})()}

      {/* Face: Green */}
      {(() => { const p = pos(FACE_POS.green); return (
        <div className="absolute" style={{ left: p.left, top: p.top, width: p.w, height: p.h, outline: `${GAP}px solid #222` }}>
          <FaceGreen width={p.w} height={p.h} />
        </div>
      )})()}

      {/* Face: Pink L */}
      {(() => { const p = pos(FACE_POS.pinkL); return (
        <div className="absolute" style={{ left: p.left, top: p.top, width: p.w, height: p.h, outline: `${GAP}px solid #222` }}>
          <FacePink side="L" width={p.w} height={p.h} />
        </div>
      )})()}

      {/* Face: Orange (main front) */}
      {(() => { const p = pos(FACE_POS.orange); return (
        <div className="absolute" style={{ left: p.left, top: p.top, width: p.w, height: p.h, outline: `${GAP}px solid #222` }}>
          <FaceOrange width={p.w} height={p.h} />
        </div>
      )})()}

      {/* Face: Pink R */}
      {(() => { const p = pos(FACE_POS.pinkR); return (
        <div className="absolute" style={{ left: p.left, top: p.top, width: p.w, height: p.h, outline: `${GAP}px solid #222` }}>
          <FacePink side="R" width={p.w} height={p.h} />
        </div>
      )})()}

      {/* Face: Blue B (warning) */}
      {(() => { const p = pos(FACE_POS.blueB); return (
        <div className="absolute" style={{ left: p.left, top: p.top, width: p.w, height: p.h, outline: `${GAP}px solid #222` }}>
          <FaceBlueB width={p.w} height={p.h} />
        </div>
      )})()}

      {/* Face labels (faint, for orientation) */}
      <FaceLabel pos={pos(FACE_POS.blueT)}  label="Blue T" />
      <FaceLabel pos={pos(FACE_POS.green)}   label="Green" />
      <FaceLabel pos={pos(FACE_POS.pinkL)}   label="Pink L" />
      <FaceLabel pos={pos(FACE_POS.orange)}  label="Orange" />
      <FaceLabel pos={pos(FACE_POS.pinkR)}   label="Pink R" />
      <FaceLabel pos={pos(FACE_POS.blueB)}   label="Blue B" />
    </div>
  )
}

function FaceLabel({ pos, label }: { pos: { left: number; top: number; w: number; h: number }; label: string }) {
  return (
    <div
      className="absolute flex items-end pb-[3px] pl-[4px] pointer-events-none"
      style={{ left: pos.left, top: pos.top, width: pos.w, height: pos.h }}
    >
      <span className="text-[8px] font-mono text-white/15 uppercase tracking-widest">{label}</span>
    </div>
  )
}
