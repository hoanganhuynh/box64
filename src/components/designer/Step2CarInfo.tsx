'use client'

import { useDesignerStore } from '@/lib/store/designer'

const BOX_SIZES = [
  { value: 'minigt' as const,  label: 'MiniGT',  dims: '120×55×40mm' },
  { value: 'poprace' as const, label: 'Poprace',  dims: '115×60×45mm' },
]

export default function Step2CarInfo() {
  const { car_name, specs_line, box_size, setField, nextStep, prevStep } = useDesignerStore()

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-1">
        <h2 className="font-jakarta font-extrabold text-primary text-xl">Car Details</h2>
        <p className="text-muted text-sm">This text will be printed on the box</p>
      </div>

      <div className="space-y-4">
        {/* Car name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
            Car Name <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={car_name}
            onChange={e => setField('car_name', e.target.value)}
            placeholder="e.g. Lamborghini Aventador SVJ"
            maxLength={60}
            className="w-full h-11 px-3 rounded border border-border bg-surface text-primary placeholder:text-faint text-sm focus:outline-none focus:border-gold transition-colors"
          />
          <p className="text-[10px] text-faint text-right">{car_name.length}/60</p>
        </div>

        {/* Specs line */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider block">Specs Line</label>
          <input
            type="text"
            value={specs_line}
            onChange={e => setField('specs_line', e.target.value)}
            placeholder="1:64 Scale · Diecast"
            maxLength={50}
            className="w-full h-11 px-3 rounded border border-border bg-surface text-primary placeholder:text-faint text-sm focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        {/* Box size */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Box Size</p>
          <div className="grid grid-cols-2 gap-2">
            {BOX_SIZES.map(sz => (
              <button
                key={sz.value}
                onClick={() => setField('box_size', sz.value)}
                className={[
                  'flex flex-col items-start gap-0.5 rounded border p-3 text-left transition-colors',
                  box_size === sz.value
                    ? 'border-gold bg-gold-light'
                    : 'border-border bg-surface hover:border-gold/40',
                ].join(' ')}
              >
                <span className={`font-bold text-sm ${box_size === sz.value ? 'text-gold' : 'text-primary'}`}>
                  {sz.label}
                </span>
                <span className="text-[10px] text-faint">{sz.dims}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={prevStep}
          className="px-4 py-2.5 rounded border border-border text-muted text-sm hover:border-border/70 transition-colors"
        >
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={!car_name.trim()}
          className="flex-1 py-2.5 rounded bg-gold text-white font-semibold text-sm hover:bg-gold-mid transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next — Choose Colors
        </button>
      </div>
    </div>
  )
}
