'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import Image from 'next/image'
interface Props {
  images: string[]
  name: string
  badge?: ReactNode
}

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
          data-product-main-image
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {badge && <div className="absolute bottom-3 left-3">{badge}</div>}
      </div>

      {/* Thumbnails — centered strip, fixed 80px */}
      <div className="flex items-center justify-center gap-2">
        {thumbs.map((src, i) => {
          const imgIdx = i % images.length
          const isActive = imgIdx === active
          return (
            <button
              key={i}
              onClick={() => setActive(imgIdx)}
              style={{ width: 80, height: 80 }}
              className={`relative shrink-0 rounded-sm overflow-hidden bg-[#0C0C18] border transition-all duration-200 ${
                isActive
                  ? 'border-gold opacity-50'
                  : 'border-border opacity-100 hover:border-gold/40'
              }`}
              aria-label={`View image ${imgIdx + 1}`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="80px" />
            </button>
          )
        })}
      </div>

    </div>
  )
}
