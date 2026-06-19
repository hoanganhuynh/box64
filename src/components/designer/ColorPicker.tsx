'use client'

import { useRef } from 'react'

interface Props {
  label: string
  value: string
  onChange: (hex: string) => void
}

const PRESETS = [
  '#111212', '#1a1a2e', '#16213e', '#0f3460',
  '#1b1b2f', '#2c2c54', '#2f4858', '#1a3a1a',
  '#C9A84C', '#E5C158', '#B8860B', '#DAA520',
  '#E63946', '#457B9D', '#2D6A4F', '#FFFFFF',
]

export default function ColorPicker({ label, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          className="w-8 h-8 rounded border-2 border-border shrink-0 shadow-sm transition-transform hover:scale-110"
          style={{ backgroundColor: value }}
          aria-label={`Pick color for ${label}`}
        />
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="sr-only"
        />
        <span className="font-mono text-xs text-muted">{value.toUpperCase()}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map(hex => (
          <button
            key={hex}
            onClick={() => onChange(hex)}
            className="w-5 h-5 rounded transition-transform hover:scale-125 border border-white/10"
            style={{ backgroundColor: hex, outline: value === hex ? '2px solid #C9A84C' : undefined, outlineOffset: 1 }}
            aria-label={hex}
          />
        ))}
      </div>
    </div>
  )
}
