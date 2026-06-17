'use client'

import { useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { useDesignerStore } from '@/lib/store/designer'
import { ICON_LIST } from '@/lib/designer-constants'
import ColorPicker from './ColorPicker'

const FIELD = 'text-xs font-semibold text-muted uppercase tracking-wider mb-1 block'
const INPUT = 'w-full h-9 px-3 rounded border border-border bg-surface text-primary placeholder:text-faint text-sm focus:outline-none focus:border-gold transition-colors'

const BOX_SIZES = [
  { value: 'minigt' as const,  label: 'MiniGT',  dims: '120×55×40mm' },
  { value: 'poprace' as const, label: 'Poprace',  dims: '115×60×45mm' },
]

export default function SidePanelLeft() {
  const store = useDesignerStore()
  const { car_image_url, car_name, specs_line, bg_color, accent_color, text_color, box_size,
          spec_engine, spec_power, spec_torque, spec_acceleration, spec_top_speed, spec_bodykit, spec_social,
          car_image_scale,
          setField, setCarImageUrl } = store

  const inputRef = useRef<HTMLInputElement>(null)

  function loadFile(file: File | null) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => { if (e.target?.result) setCarImageUrl(e.target.result as string) }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Section: Photo */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Car Photo</h3>
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
          className="relative border-2 border-dashed border-border rounded-lg overflow-hidden cursor-pointer hover:border-gold/50 transition-colors"
          style={{ height: 90 }}
        >
          {car_image_url ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={car_image_url} alt="car" className="w-full h-full object-contain" />
              <button
                onClick={e => { e.stopPropagation(); setCarImageUrl(null) }}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center"
              >
                <X size={10} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-1 text-faint">
              <ImagePlus size={20} />
              <span className="text-[10px]">Upload / drag & drop</span>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={e => loadFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {car_image_url && (
          <div className="space-y-1">
            <label className={FIELD}>Image Scale</label>
            <input
              type="range" min="0.5" max="2.5" step="0.05"
              value={car_image_scale}
              onChange={e => setField('car_image_scale', parseFloat(e.target.value))}
              className="w-full accent-[#C9A84C]"
            />
          </div>
        )}
      </section>

      {/* Section: Box Info */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Box Info</h3>

        <div>
          <label className={FIELD}>Car Name</label>
          <input type="text" value={car_name} maxLength={60}
            placeholder="e.g. LB-Silhouette Lamborghini Huracán"
            onChange={e => setField('car_name', e.target.value)}
            className={INPUT}
          />
        </div>

        <div>
          <label className={FIELD}>Specs Line</label>
          <input type="text" value={specs_line} maxLength={50}
            onChange={e => setField('specs_line', e.target.value)}
            className={INPUT}
          />
        </div>

        <div>
          <p className={FIELD}>Box Size</p>
          <div className="grid grid-cols-2 gap-2">
            {BOX_SIZES.map(sz => (
              <button
                key={sz.value}
                onClick={() => setField('box_size', sz.value)}
                className={[
                  'flex flex-col items-start rounded border p-2 text-left transition-colors',
                  box_size === sz.value ? 'border-gold bg-gold-light' : 'border-border bg-surface hover:border-gold/40',
                ].join(' ')}
              >
                <span className={`font-bold text-xs ${box_size === sz.value ? 'text-gold' : 'text-primary'}`}>{sz.label}</span>
                <span className="text-[9px] text-faint">{sz.dims}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Colors */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Colors</h3>
        <ColorPicker label="Background"   value={bg_color}     onChange={v => setField('bg_color', v)} />
        <ColorPicker label="Accent Stripe" value={accent_color} onChange={v => setField('accent_color', v)} />
        <ColorPicker label="Text"          value={text_color}   onChange={v => setField('text_color', v)} />
      </section>

      {/* Section: Specs (for Blue T face) */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Specs (Blue T face)</h3>
        {([
          ['spec_engine',       'Engine'],
          ['spec_power',        'Power'],
          ['spec_torque',       'Torque'],
          ['spec_acceleration', '0-100 km/h'],
          ['spec_top_speed',    'Top Speed'],
          ['spec_bodykit',      'Bodykit'],
          ['spec_social',       'Social / URL'],
        ] as const).map(([key, label]) => (
          <div key={key}>
            <label className={FIELD}>{label}</label>
            <input
              type="text"
              value={store[key]}
              placeholder={label}
              onChange={e => setField(key, e.target.value)}
              className={INPUT}
            />
          </div>
        ))}
      </section>

      {/* Section: Icon palette (drag onto Green face) */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Icons → Green Face</h3>
        <p className="text-[10px] text-faint">Drag an icon onto the Green face to place it.</p>
        <div className="flex flex-wrap gap-2">
          {ICON_LIST.map(icon => (
            <div
              key={icon.src}
              draggable
              onDragStart={e => { e.dataTransfer.setData('text/icon-src', icon.src) }}
              title={icon.label}
              className="w-8 h-8 flex items-center justify-center rounded border border-border bg-surface cursor-grab hover:border-gold/50 transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={icon.src} alt={icon.label} width={18} height={18} style={{ filter: 'invert(0.6)' }} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
