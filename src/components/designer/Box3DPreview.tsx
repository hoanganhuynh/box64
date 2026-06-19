'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { BOX3D } from '@/lib/designer-constants'
import { useDesignerStore } from '@/lib/store/designer'

const { W: BW, H: BH, D: BD } = BOX3D

export default function Box3DPreview() {
  const { bg_color, accent_color, text_color, car_name, car_image_url } = useDesignerStore()
  const [rotY, setRotY] = useState(25)
  const [autoSpin, setAutoSpin] = useState(false)
  const drag = useRef<{ startX: number; startRotY: number } | null>(null)
  const rafRef = useRef<number>(0)

  // Auto-spin
  useEffect(() => {
    if (!autoSpin) { cancelAnimationFrame(rafRef.current); return }
    const spin = () => {
      setRotY(r => (r + 0.4) % 360)
      rafRef.current = requestAnimationFrame(spin)
    }
    rafRef.current = requestAnimationFrame(spin)
    return () => cancelAnimationFrame(rafRef.current)
  }, [autoSpin])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setAutoSpin(false)
    drag.current = { startX: e.clientX, startRotY: rotY }
  }, [rotY])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drag.current) return
    const delta = (e.clientX - drag.current.startX) * 0.6
    setRotY((drag.current.startRotY + delta + 360) % 360)
  }, [])

  const onMouseUp = useCallback(() => { drag.current = null }, [])

  // Face face definitions: (formula verified with hinge approach)
  // All faces in a W×H×D box where W=BW, H=BH, D=BD
  // Front/back: full BW×BH, translateZ = BD/2
  // Sides: BD×BH, positioned at edges, hinge approach
  // Top/Bottom: BW×BD, positioned at edges, hinge approach

  const gold = '#C9A84C'
  const darkBg = '#0d1b2a'
  const sideBg = '#1a0a28'
  const greenBg = '#0a1a0a'

  const labelStyle: React.CSSProperties = {
    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700,
    fontSize: 9, letterSpacing: '0.1em', opacity: 0.4, color: '#fff',
  }

  return (
    <div className="flex flex-col items-center gap-4 py-6 select-none">
      <p className="text-[10px] font-mono text-faint uppercase tracking-widest">360° Preview</p>

      {/* Scene */}
      <div
        style={{
          perspective: 550,
          perspectiveOrigin: '50% 40%',
          width: BW + BD * 2 + 40,
          height: BH + BD * 2 + 60,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: drag.current ? 'grabbing' : 'grab',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* Box container */}
        <div
          style={{
            width: BW, height: BH,
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: `rotateX(-15deg) rotateY(${rotY}deg)`,
          }}
        >
          {/* FRONT face (Orange) */}
          <div style={{
            position: 'absolute', width: BW, height: BH,
            background: bg_color,
            transform: `translateZ(${BD/2}px)`,
            overflow: 'hidden',
          }}>
            {car_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={car_image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: 0.85 }} />
            )}
            {car_name && (
              <div style={{ position: 'absolute', bottom: 3, left: 4, right: 10 }}>
                <p style={{ color: text_color, fontSize: 8, fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 700, lineHeight: 1 }}>
                  {car_name.toUpperCase()}
                </p>
              </div>
            )}
            <div style={{ position: 'absolute', right: 4, top: 4, bottom: 4, width: 2, background: accent_color, opacity: 0.7 }} />
          </div>

          {/* BACK face (Blue T) */}
          <div style={{
            position: 'absolute', width: BW, height: BH,
            background: darkBg,
            transform: `rotateY(180deg) translateZ(${BD/2}px)`,
          }}>
            <div style={labelStyle}>BLUE T</div>
          </div>

          {/* RIGHT face (Pink R) */}
          <div style={{
            position: 'absolute', width: BD, height: BH,
            background: sideBg,
            left: (BW - BD) / 2,
            transformOrigin: 'left 50%',
            transform: `rotateY(90deg) translateZ(${BW/2}px)`,
            overflow: 'hidden',
          }}>
            <div style={labelStyle}>R</div>
          </div>

          {/* LEFT face (Pink L) */}
          <div style={{
            position: 'absolute', width: BD, height: BH,
            background: sideBg,
            left: (BW - BD) / 2,
            transformOrigin: 'left 50%',
            transform: `rotateY(-90deg) translateZ(${BW/2}px)`,
          }}>
            <div style={labelStyle}>L</div>
          </div>

          {/* TOP face (Green) */}
          <div style={{
            position: 'absolute', width: BW, height: BD,
            background: greenBg,
            top: (BH - BD) / 2,
            transformOrigin: '50% top',
            transform: `rotateX(-90deg) translateZ(${BH/2}px)`,
          }}>
            <div style={labelStyle}>GREEN</div>
          </div>

          {/* BOTTOM face (Blue B) */}
          <div style={{
            position: 'absolute', width: BW, height: BD,
            background: '#0c0c0c',
            top: (BH - BD) / 2,
            transformOrigin: '50% top',
            transform: `rotateX(90deg) translateZ(${BH/2}px)`,
          }}>
            <div style={{ ...labelStyle, fontSize: 7, color: gold }}>WARNING</div>
          </div>
        </div>
      </div>

      {/* Auto-spin toggle */}
      <button
        onClick={() => setAutoSpin(s => !s)}
        className={`text-[10px] px-3 py-1 rounded border transition-colors ${
          autoSpin ? 'border-gold text-gold' : 'border-border text-faint hover:border-gold/40'
        }`}
      >
        {autoSpin ? '⏸ Stop' : '▶ Auto-spin'}
      </button>

      <p className="text-[9px] text-faint text-center">Drag to rotate</p>
    </div>
  )
}
