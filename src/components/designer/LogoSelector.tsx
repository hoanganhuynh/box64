'use client'

import type { LogoVariant } from '@/lib/types'
import { useDesignerStore } from '@/lib/store/designer'

const OPTIONS: { value: LogoVariant; label: string; desc: string }[] = [
  { value: 'minigt',  label: 'MiniGT™',  desc: 'Official MiniGT logo text' },
  { value: 'poprace', label: 'Poprace',   desc: 'Official Poprace logo text' },
  { value: 'custom',  label: 'Custom',    desc: 'First word of car name' },
]

export default function LogoSelector() {
  const { logo_variant, setField } = useDesignerStore()

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted uppercase tracking-wider">Brand Logo</p>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setField('logo_variant', opt.value)}
            className={[
              'flex flex-col items-center gap-1 rounded border px-2 py-2 text-center transition-colors text-xs',
              logo_variant === opt.value
                ? 'border-gold bg-gold-light text-gold font-semibold'
                : 'border-border bg-surface text-muted hover:border-gold/40',
            ].join(' ')}
          >
            <span className="font-extrabold text-sm tracking-tight">{opt.label}</span>
            <span className="text-[10px] leading-tight opacity-70">{opt.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
