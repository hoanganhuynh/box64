'use client'
import { useEffect, useState } from 'react'
import { formatCountdown } from '@/lib/utils/format'

interface Props {
  label: string
  endDate: string
  variant?: 'sale' | 'pre_order' | 'flash_sale'
}

const variantColors: Record<string, string> = {
  sale:       'bg-gold/90',
  flash_sale: 'bg-error/90',
  pre_order:  'bg-blue-600/90',
}

export default function CountdownBadge({ label, endDate, variant = 'sale' }: Props) {
  const [delta, setDelta] = useState<number | null>(null)

  useEffect(() => {
    setDelta(new Date(endDate).getTime() - Date.now())
    const tick = setInterval(() => setDelta(new Date(endDate).getTime() - Date.now()), 1000)
    return () => clearInterval(tick)
  }, [endDate])

  if (delta === null || delta <= 0) return null

  const { days, hours, minutes, seconds } = formatCountdown(delta)
  const timeStr = days > 0
    ? `${days}d ${hours}h ${minutes}m`
    : `${hours}h ${minutes}m ${seconds}s`

  return (
    <div className={`
      absolute bottom-2 right-2
      ${variantColors[variant] ?? variantColors.sale}
      backdrop-blur-sm text-white rounded-sm px-2 py-1 flex flex-col items-end
    `}>
      <span className="text-[9px] font-bold tracking-widest uppercase leading-none">{label}</span>
      <span className="text-[11px] font-mono font-bold leading-tight tabular-nums">{timeStr}</span>
    </div>
  )
}
