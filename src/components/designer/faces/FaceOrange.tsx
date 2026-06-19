'use client'

import { useRef, useCallback } from 'react'
import { useDesignerStore } from '@/lib/store/designer'

interface Props { width: number; height: number }

export default function FaceOrange({ width, height }: Props) {
  const {
    car_image_url, car_name, specs_line,
    bg_color, accent_color, text_color,
    car_image_offset_x, car_image_offset_y, car_image_scale,
    setField, setCarImageUrl,
  } = useDesignerStore()

  const dragging = useRef(false)
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!car_image_url) return
    e.preventDefault()
    dragging.current = true
    dragStart.current = {
      mx: e.clientX, my: e.clientY,
      ox: car_image_offset_x, oy: car_image_offset_y,
    }
  }, [car_image_url, car_image_offset_x, car_image_offset_y])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return
    const dx = (e.clientX - dragStart.current.mx) / width * 100
    const dy = (e.clientY - dragStart.current.my) / height * 100
    const nx = Math.max(0, Math.min(100, dragStart.current.ox + dx))
    const ny = Math.max(0, Math.min(100, dragStart.current.oy + dy))
    setField('car_image_offset_x', nx)
    setField('car_image_offset_y', ny)
  }, [width, height, setField])

  const onMouseUp = useCallback(() => { dragging.current = false }, [])

  const inputRef = useRef<HTMLInputElement>(null)
  function handleUpload(file: File | null) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => { if (e.target?.result) setCarImageUrl(e.target.result as string) }
    reader.readAsDataURL(file)
  }

  return (
    <div
      className="absolute overflow-hidden select-none"
      style={{ left: 0, top: 0, width, height, background: bg_color }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Accent stripe (right side) */}
      <div className="absolute right-0 top-0 bottom-0 flex flex-col gap-px items-end pr-2" style={{ paddingTop: 6, paddingBottom: 6 }}>
        <div className="w-[2px] flex-1 rounded" style={{ background: accent_color, opacity: 0.85 }} />
        <div className="w-[0.7px] flex-1 rounded" style={{ background: accent_color, opacity: 0.5 }} />
      </div>

      {/* Car image — draggable */}
      {car_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={car_image_url}
          alt="car"
          draggable={false}
          onMouseDown={onMouseDown}
          style={{
            position: 'absolute',
            maxWidth: `${60 * car_image_scale}%`,
            maxHeight: `${75 * car_image_scale}%`,
            objectFit: 'contain',
            left: `${car_image_offset_x}%`,
            top: `${car_image_offset_y}%`,
            transform: 'translate(-50%, -50%)',
            cursor: 'grab',
            userSelect: 'none',
          }}
        />
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-white/30 hover:text-white/50 transition-colors"
        >
          <span className="text-2xl">+</span>
          <span className="text-[10px]">Upload car photo</span>
        </button>
      )}

      {/* Car name overlay */}
      {car_name && (
        <div
          className="absolute bottom-0 left-0 right-8 px-2 pb-1.5 space-y-0"
          style={{ pointerEvents: 'none' }}
        >
          <p
            className="font-extrabold uppercase leading-none truncate"
            style={{
              color: text_color,
              fontSize: Math.round(height * 0.12),
              fontFamily: '"Barlow Condensed", sans-serif',
              letterSpacing: '0.02em',
            }}
          >
            {car_name}
          </p>
          {specs_line && (
            <p
              style={{
                color: text_color,
                fontSize: Math.round(height * 0.07),
                opacity: 0.45,
                fontFamily: 'var(--font-plus-jakarta), sans-serif',
                fontWeight: 600,
              }}
            >
              {specs_line}
            </p>
          )}
        </div>
      )}

      {/* Logo text (top-right corner) */}
      <div
        className="absolute top-1 right-3 text-right leading-none"
        style={{ pointerEvents: 'none', color: text_color, opacity: 0.85 }}
      >
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: Math.round(height * 0.13) }}>
          MINI
        </div>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900, fontSize: Math.round(height * 0.13) }}>
          GT™
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={e => handleUpload(e.target.files?.[0] ?? null)}
      />
    </div>
  )
}
