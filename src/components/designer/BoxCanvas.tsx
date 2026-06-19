'use client'

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { useDesignerStore } from '@/lib/store/designer'
import {
  buildFrontFaceLayout, buildTopFaceLayout, buildSideFaceLayout,
  drawFrontFace, drawTopFace, drawSideFace,
} from '@/lib/canvas/boxRenderer'

export type BoxCanvasRef = {
  front: HTMLCanvasElement | null
  top:   HTMLCanvasElement | null
  side:  HTMLCanvasElement | null
  redraw: () => Promise<void>
}

const BoxCanvas = forwardRef<BoxCanvasRef>((_props, ref) => {
  const state = useDesignerStore()
  const frontRef = useRef<HTMLCanvasElement>(null)
  const topRef   = useRef<HTMLCanvasElement>(null)
  const sideRef  = useRef<HTMLCanvasElement>(null)
  const imgRef   = useRef<HTMLImageElement | null>(null)

  async function redraw() {
    const frontEl = frontRef.current
    const topEl   = topRef.current
    const sideEl  = sideRef.current
    if (!frontEl || !topEl || !sideEl) return

    if (state.car_image_url && imgRef.current?.src !== state.car_image_url) {
      const img = new Image()
      img.src = state.car_image_url
      await new Promise<void>((res, rej) => {
        img.onload = () => res()
        img.onerror = rej
      })
      imgRef.current = img
    } else if (!state.car_image_url) {
      imgRef.current = null
    }

    const fCtx = frontEl.getContext('2d')
    const tCtx = topEl.getContext('2d')
    const sCtx = sideEl.getContext('2d')
    if (fCtx) await drawFrontFace(fCtx, state, imgRef.current)
    if (tCtx) drawTopFace(tCtx, state)
    if (sCtx) drawSideFace(sCtx, state)
  }

  useEffect(() => { redraw() }, [
    state.car_image_url, state.car_name, state.specs_line,
    state.bg_color, state.accent_color, state.text_color,
    state.logo_tint, state.logo_variant, state.box_size,
  ])

  useImperativeHandle(ref, () => ({
    front: frontRef.current,
    top:   topRef.current,
    side:  sideRef.current,
    redraw,
  }))

  const front = buildFrontFaceLayout(state.box_size)
  const top   = buildTopFaceLayout(state.box_size)
  const side  = buildSideFaceLayout(state.box_size)

  return (
    <div className="sr-only" aria-hidden>
      <canvas ref={frontRef} width={front.width} height={front.height} />
      <canvas ref={topRef}   width={top.width}   height={top.height} />
      <canvas ref={sideRef}  width={side.width}  height={side.height} />
    </div>
  )
})
BoxCanvas.displayName = 'BoxCanvas'
export default BoxCanvas
