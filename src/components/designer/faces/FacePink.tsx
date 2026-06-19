'use client'

import Image from 'next/image'
import { RotateCcw, RotateCw, FlipHorizontal } from 'lucide-react'
import { useDesignerStore } from '@/lib/store/designer'
import { FRONT_LID_SYMBOLS, BACK_LID_SYMBOLS } from '@/lib/designer-constants'

interface Props {
  side: 'L' | 'R'
  width: number
  height: number
}

export default function FacePink({ side, width, height }: Props) {
  const store = useDesignerStore()
  const isL = side === 'L'

  const symbol     = isL ? store.front_lid_symbol    : store.back_lid_symbol
  const rotation   = isL ? store.front_lid_rotation  : store.back_lid_rotation
  const flipped    = isL ? store.front_lid_flipped   : store.back_lid_flipped
  const symbols    = isL ? FRONT_LID_SYMBOLS         : BACK_LID_SYMBOLS

  const rotKey:  'front_lid_rotation' | 'back_lid_rotation'   = isL ? 'front_lid_rotation'  : 'back_lid_rotation'
  const flipKey: 'front_lid_flipped'  | 'back_lid_flipped'    = isL ? 'front_lid_flipped'   : 'back_lid_flipped'
  const symKey:  'front_lid_symbol'   | 'back_lid_symbol'     = isL ? 'front_lid_symbol'    : 'back_lid_symbol'

  const iconSize = Math.round(Math.min(width, height) * 0.64)

  return (
    <div
      className="absolute group overflow-hidden"
      style={{ left: 0, top: 0, width, height, background: '#1a0a28' }}
    >
      {/* Symbol display */}
      <div className="absolute inset-0 flex items-center justify-center">
        {symbol ? (
          <Image
            src={symbol}
            alt="lid symbol"
            width={iconSize}
            height={iconSize}
            unoptimized
            style={{
              objectFit: 'contain',
              transform: `rotate(${rotation}deg) scaleX(${flipped ? -1 : 1})`,
              filter: 'invert(0.85) sepia(0.2)',
              transition: 'transform 0.2s',
            }}
          />
        ) : (
          <p className="text-white/20 text-[10px] text-center px-2">Click to select symbol</p>
        )}
      </div>

      {/* Symbol picker (hover overlay) */}
      <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 flex flex-col gap-1 p-1.5">
        {/* Rotation/flip controls */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => store.setField(rotKey, (rotation - 90 + 360) % 360)}
            className="p-1 text-white/60 hover:text-white transition-colors"
            title="Rotate CCW"
          >
            <RotateCcw size={10} />
          </button>
          <button
            onClick={() => store.setField(rotKey, (rotation + 90) % 360)}
            className="p-1 text-white/60 hover:text-white transition-colors"
            title="Rotate CW"
          >
            <RotateCw size={10} />
          </button>
          <button
            onClick={() => store.setField(flipKey, !flipped)}
            className="p-1 text-white/60 hover:text-white transition-colors"
            title="Flip"
          >
            <FlipHorizontal size={10} />
          </button>
        </div>

        {/* Symbol grid */}
        <div className="flex flex-wrap justify-center gap-1">
          {symbols.map((s) => (
            <button
              key={s.src}
              onClick={() => store.setField(symKey, s.src)}
              className={`p-0.5 rounded border transition-colors ${symbol === s.src ? 'border-purple-400/80 bg-purple-900/40' : 'border-white/20 hover:border-white/50'}`}
            >
              <Image src={s.src} alt={s.label} width={18} height={18} unoptimized style={{ filter: 'invert(0.8)' }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
