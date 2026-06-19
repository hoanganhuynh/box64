import Image from 'next/image'
import { useDesignerStore } from '@/lib/store/designer'

interface Props { width: number; height: number }

type SpecKey = 'spec_engine' | 'spec_power' | 'spec_torque' | 'spec_acceleration' | 'spec_top_speed' | 'spec_bodykit'

const SPEC_FIELDS: { key: SpecKey; iconSrc: string; label: string }[] = [
  { key: 'spec_engine',       iconSrc: '/icons/Engine.svg',       label: 'Engine' },
  { key: 'spec_power',        iconSrc: '/icons/Power.svg',        label: 'Power' },
  { key: 'spec_torque',       iconSrc: '/icons/Torque.svg',       label: 'Torque' },
  { key: 'spec_acceleration', iconSrc: '/icons/Acceleration.svg', label: '0-100' },
  { key: 'spec_top_speed',    iconSrc: '/icons/Top Speed.svg',    label: 'Top Spd' },
  { key: 'spec_bodykit',      iconSrc: '/icons/Bodykit.svg',      label: 'Bodykit' },
]

export default function FaceBlueT({ width, height }: Props) {
  const state = useDesignerStore()
  const { car_name, spec_social, accent_color } = state
  const fs = Math.round(height * 0.075)

  return (
    <div
      className="absolute overflow-hidden"
      style={{ left: 0, top: 0, width, height, background: '#0d1b2a' }}
    >
      <div style={{ padding: '5px 8px', height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Car name header */}
        {car_name && (
          <p style={{
            color: '#C9A84C', fontSize: fs * 1.1,
            fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 700,
            lineHeight: 1, letterSpacing: '0.04em',
          }}>
            {car_name.toUpperCase()}
          </p>
        )}

        {/* Accent divider */}
        <div style={{ height: 1, background: accent_color, opacity: 0.5, margin: '1px 0' }} />

        {/* Specs grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 6px', flex: 1 }}>
          {SPEC_FIELDS.map(({ key, iconSrc, label }) => {
            const val = state[key as keyof typeof state] as string
            if (!val) return null
            return (
              <div key={key} className="flex items-center gap-1" style={{ minWidth: 0 }}>
                <Image
                  src={iconSrc}
                  alt={label}
                  width={Math.round(fs * 1.2)}
                  height={Math.round(fs * 1.2)}
                  className="shrink-0"
                  style={{ filter: 'invert(1) sepia(1) saturate(2) hue-rotate(5deg) brightness(0.9)' }}
                  unoptimized
                />
                <div style={{ minWidth: 0 }}>
                  <p style={{ color: '#9ab', fontSize: fs * 0.55, lineHeight: 1 }}>{label}</p>
                  <p style={{ color: '#e8dcc0', fontSize: fs * 0.72, fontWeight: 700, lineHeight: 1.1, fontFamily: '"Barlow Condensed",sans-serif' }}>
                    {val}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Social + box icon row */}
        <div className="flex items-center gap-2" style={{ marginTop: 2 }}>
          <Image src="/icons/box.svg" alt="box64" width={Math.round(fs*1.3)} height={Math.round(fs*1.3)} unoptimized style={{ filter: 'invert(0.7)' }} />
          {spec_social && (
            <>
              <Image src="/icons/facebook.svg" alt="fb" width={Math.round(fs)} height={Math.round(fs)} unoptimized style={{ filter: 'invert(0.7)' }} />
              <Image src="/icons/insta.svg" alt="ig" width={Math.round(fs)} height={Math.round(fs)} unoptimized style={{ filter: 'invert(0.7)' }} />
              <p style={{ color: '#9ab', fontSize: fs * 0.65, fontFamily: 'monospace' }}>{spec_social}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
