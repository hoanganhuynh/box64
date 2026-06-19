'use client'

import { useDesignerStore } from '@/lib/store/designer'
import ColorPicker from './ColorPicker'
import LogoSelector from './LogoSelector'

export default function Step3Visual() {
  const { bg_color, accent_color, text_color, logo_tint, setField, nextStep, prevStep } = useDesignerStore()

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-1">
        <h2 className="font-jakarta font-extrabold text-primary text-xl">Colors & Logo</h2>
        <p className="text-muted text-sm">Customize the look of your box</p>
      </div>

      <div className="space-y-5 bg-surface rounded-lg border border-border p-4">
        <ColorPicker
          label="Background"
          value={bg_color}
          onChange={v => setField('bg_color', v)}
        />
        <div className="border-t border-border" />
        <ColorPicker
          label="Accent Stripe"
          value={accent_color}
          onChange={v => setField('accent_color', v)}
        />
        <div className="border-t border-border" />
        <ColorPicker
          label="Text Color"
          value={text_color}
          onChange={v => setField('text_color', v)}
        />
        <div className="border-t border-border" />
        <ColorPicker
          label="Logo Tint"
          value={logo_tint}
          onChange={v => setField('logo_tint', v)}
        />
        <div className="border-t border-border" />
        <LogoSelector />
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
          className="flex-1 py-2.5 rounded bg-gold text-white font-semibold text-sm hover:bg-gold-mid transition-colors"
        >
          Preview Box →
        </button>
      </div>
    </div>
  )
}
