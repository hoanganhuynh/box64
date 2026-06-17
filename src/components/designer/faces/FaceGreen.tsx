'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { X } from 'lucide-react'
import { useDesignerStore } from '@/lib/store/designer'

interface Props { width: number; height: number }

export default function FaceGreen({ width, height }: Props) {
  const { green_symbols, moveGreenSymbol, removeGreenSymbol, rotateGreenSymbol } = useDesignerStore()
  const faceRef = useRef<HTMLDivElement>(null)

  // Drag state per symbol
  const dragging = useRef<{ id: string; ox: number; oy: number; mx: number; my: number } | null>(null)

  function onSymbolMouseDown(e: React.MouseEvent, id: string, x: number, y: number) {
    e.preventDefault()
    e.stopPropagation()
    dragging.current = { id, ox: x, oy: y, mx: e.clientX, my: e.clientY }
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current) return
    const { id, ox, oy, mx, my } = dragging.current
    const dx = (e.clientX - mx) / width * 100
    const dy = (e.clientY - my) / height * 100
    moveGreenSymbol(id,
      Math.max(0, Math.min(100, ox + dx)),
      Math.max(0, Math.min(100, oy + dy)),
    )
  }

  function onMouseUp() { dragging.current = null }

  // Drop target for icons dragged from the palette
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const src = e.dataTransfer.getData('text/icon-src')
    if (!src) return
    const rect = faceRef.current!.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top)  / rect.height) * 100
    useDesignerStore.getState().addGreenSymbol({
      id: Date.now().toString(),
      src,
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
      rotation: 0,
      scale: 1,
    })
  }

  const iconSize = Math.round(Math.min(width, height) * 0.2)

  return (
    <div
      ref={faceRef}
      className="absolute overflow-hidden"
      style={{ left: 0, top: 0, width, height, background: '#0a1a0a' }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
    >
      {/* Placeholder label when empty */}
      {green_symbols.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-green-900/60 text-[10px] text-center px-4">Drag icons here to place freely</p>
        </div>
      )}

      {/* Placed symbols */}
      {green_symbols.map(sym => (
        <div
          key={sym.id}
          className="absolute group cursor-grab"
          style={{
            left: `${sym.x}%`,
            top: `${sym.y}%`,
            transform: `translate(-50%, -50%) rotate(${sym.rotation}deg)`,
          }}
          onMouseDown={e => onSymbolMouseDown(e, sym.id, sym.x, sym.y)}
        >
          <Image
            src={sym.src}
            alt="symbol"
            width={Math.round(iconSize * sym.scale)}
            height={Math.round(iconSize * sym.scale)}
            unoptimized
            draggable={false}
            style={{ filter: 'invert(0.75) sepia(0.3) saturate(1.5)' }}
          />
          {/* Controls on hover */}
          <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
            <button
              onMouseDown={e => { e.stopPropagation(); rotateGreenSymbol(sym.id, 45) }}
              className="w-3.5 h-3.5 rounded-full bg-green-600 text-white flex items-center justify-center text-[8px] leading-none"
              title="Rotate"
            >↻</button>
            <button
              onMouseDown={e => { e.stopPropagation(); removeGreenSymbol(sym.id) }}
              className="w-3.5 h-3.5 rounded-full bg-red-600 text-white flex items-center justify-center"
              title="Remove"
            >
              <X size={7} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
