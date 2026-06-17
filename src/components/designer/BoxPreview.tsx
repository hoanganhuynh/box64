'use client'

import { useEffect, useState, useRef } from 'react'
import type { BoxCanvasRef } from './BoxCanvas'
import { useDesignerStore } from '@/lib/store/designer'

interface Props {
  canvasRef: React.RefObject<BoxCanvasRef | null>
}

export default function BoxPreview({ canvasRef }: Props) {
  const state = useDesignerStore()
  const [urls, setUrls] = useState({ front: '', top: '', side: '' })
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const syncUrls = async () => {
      const cr = canvasRef.current
      if (!cr) return
      await cr.redraw()
      setUrls({
        front: cr.front?.toDataURL('image/png') ?? '',
        top:   cr.top?.toDataURL('image/png') ?? '',
        side:  cr.side?.toDataURL('image/png') ?? '',
      })
    }

    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => { syncUrls() })
    return () => cancelAnimationFrame(frameRef.current)
  }, [
    state.car_image_url, state.car_name, state.specs_line,
    state.bg_color, state.accent_color, state.text_color,
    state.logo_tint, state.logo_variant, state.box_size,
  ])

  return (
    <div className="flex items-center justify-center py-8 select-none">
      {/* isometric container — 3 face CSS illusion */}
      <div className="relative" style={{ width: 320, height: 260 }}>
        {/* FRONT face */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: 80, top: 80,
            width: 200, height: 120,
            backgroundImage: urls.front ? `url(${urls.front})` : undefined,
            backgroundSize: 'cover',
            backgroundColor: state.bg_color,
            transform: 'skewY(-5deg)',
            transformOrigin: 'top left',
            boxShadow: '4px 8px 24px #0004',
          }}
        />
        {/* TOP face */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: 80, top: 38,
            width: 200, height: 48,
            backgroundImage: urls.top ? `url(${urls.top})` : undefined,
            backgroundSize: 'cover',
            backgroundColor: lightenHex(state.bg_color, 0.12),
            transform: 'skewX(-30deg) skewY(-5deg)',
            transformOrigin: 'bottom left',
          }}
        />
        {/* SIDE face */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: 26, top: 80,
            width: 56, height: 120,
            backgroundImage: urls.side ? `url(${urls.side})` : undefined,
            backgroundSize: 'cover',
            backgroundColor: darkenHex(state.bg_color, 0.22),
            transform: 'skewY(30deg)',
            transformOrigin: 'top right',
            filter: 'brightness(0.78)',
          }}
        />
      </div>
    </div>
  )
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function clamp(v: number) { return Math.max(0, Math.min(255, v)) }
function lightenHex(hex: string, amt: number) {
  try {
    const [r,g,b] = hexToRgb(hex)
    return `rgb(${clamp(r+amt*255)},${clamp(g+amt*255)},${clamp(b+amt*255)})`
  } catch { return hex }
}
function darkenHex(hex: string, amt: number) {
  try {
    const [r,g,b] = hexToRgb(hex)
    return `rgb(${clamp(r-amt*255)},${clamp(g-amt*255)},${clamp(b-amt*255)})`
  } catch { return hex }
}
