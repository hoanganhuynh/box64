'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import Image from 'next/image'
import { TickCircle, Box, TruckFast } from 'iconsax-react'

interface Props {
  images: string[]
  name: string
  badge?: ReactNode
}

const TRUST = [
  { icon: TickCircle, label: 'Print-ready quality' },
  { icon: Box, label: 'Secure packaging' },
  { icon: TruckFast, label: 'Nationwide delivery' },
] as const

export default function ImageGallery({ images, name, badge }: Props) {
  const [active, setActive] = useState(0)
  const thumbs = [...images, ...images, ...images].slice(0, 3)

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-sm overflow-hidden bg-[#0C0C18]">
        <Image
          src={images[active] ?? images[0]}
          alt={name}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {badge && <div className="absolute bottom-3 left-3">{badge}</div>}
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-3 gap-2">
        {thumbs.map((src, i) => {
          const imgIdx = i % images.length
          return (
            <button
              key={i}
              onClick={() => setActive(imgIdx)}
              className={`relative aspect-square rounded-sm overflow-hidden bg-[#0C0C18] border transition-colors ${
                imgIdx === active ? 'border-gold' : 'border-border hover:border-gold/40'
              }`}
              aria-label={`View image ${imgIdx + 1}`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="17vw" />
            </button>
          )
        })}
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-2">
        {TRUST.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 bg-[#0F0F18] border border-border rounded-sm py-3 px-2 text-center"
          >
            <Icon size={15} color="var(--gold)" variant="Bold" />
            <p className="text-xs text-muted leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
