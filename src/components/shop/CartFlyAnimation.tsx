'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'

interface FlyState {
  id: number
  imgSrc: string
  startTop: number
  startLeft: number
  startSize: number
  endTop: number
  endLeft: number
  phase: 'init' | 'flying' | 'done'
}

export default function CartFlyAnimation() {
  const flyEvent = useCartStore(s => s.flyEvent)
  const clearFly = useCartStore(s => s.clearFly)
  const [fly, setFly] = useState<FlyState | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!flyEvent) return

    const cartIcon = document.querySelector('[data-cart-icon]')
    if (!cartIcon) { clearFly(); return }

    const cartRect = cartIcon.getBoundingClientRect()
    const endTop = cartRect.top + cartRect.height / 2
    const endLeft = cartRect.left + cartRect.width / 2

    const { startRect } = flyEvent
    const startSize = Math.min(startRect.width, startRect.height, 80)

    setFly({
      id: flyEvent.id,
      imgSrc: flyEvent.imgSrc,
      startTop: startRect.top,
      startLeft: startRect.left,
      startSize,
      endTop,
      endLeft,
      phase: 'init',
    })

    // Next frame: trigger transition to flying state
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setFly(f => f ? { ...f, phase: 'flying' } : null)
      })
    })

    clearFly()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyEvent])

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  if (!fly || fly.phase === 'done') return null

  const isFlying = fly.phase === 'flying'

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        zIndex: 9999,
        pointerEvents: 'none',
        top: isFlying ? fly.endTop - 12 : fly.startTop,
        left: isFlying ? fly.endLeft - 12 : fly.startLeft,
        width: isFlying ? 24 : fly.startSize,
        height: isFlying ? 24 : fly.startSize,
        opacity: isFlying ? 0 : 1,
        borderRadius: isFlying ? '50%' : '8px',
        overflow: 'hidden',
        transition: isFlying
          ? 'top 0.55s cubic-bezier(0.16, 1, 0.3, 1), left 0.55s cubic-bezier(0.16, 1, 0.3, 1), width 0.55s cubic-bezier(0.16, 1, 0.3, 1), height 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease 0.38s, border-radius 0.3s ease'
          : 'none',
      }}
      onTransitionEnd={() => {
        setFly(f => f ? { ...f, phase: 'done' } : null)
        const badge = document.querySelector('[data-cart-badge]')
        if (badge) {
          badge.classList.remove('badge-bump')
          void (badge as HTMLElement).offsetWidth // reflow to restart
          badge.classList.add('badge-bump')
          badge.addEventListener('animationend', () => badge.classList.remove('badge-bump'), { once: true })
        }
      }}
    >
      <Image
        src={fly.imgSrc}
        alt=""
        fill
        className="object-cover"
        sizes="80px"
      />
    </div>
  )
}
