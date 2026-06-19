'use client'
import { useEffect, useState } from 'react'
import { formatCountdown } from '@/lib/utils/format'

export default function FlashCountdown({ endDate }: { endDate: string }) {
  const [delta, setDelta] = useState(() => new Date(endDate).getTime() - Date.now())

  useEffect(() => {
    const tick = setInterval(() => setDelta(new Date(endDate).getTime() - Date.now()), 1000)
    return () => clearInterval(tick)
  }, [endDate])

  if (delta <= 0) return null

  const { days, hours, minutes, seconds } = formatCountdown(delta)
  const parts = days > 0
    ? [{ v: String(days).padStart(2, '0'), l: 'D' }, { v: String(hours).padStart(2, '0'), l: 'H' }, { v: String(minutes).padStart(2, '0'), l: 'M' }]
    : [{ v: String(hours).padStart(2, '0'), l: 'H' }, { v: String(minutes).padStart(2, '0'), l: 'M' }, { v: String(seconds).padStart(2, '0'), l: 'S' }]

  return (
    <div className="flex items-center gap-1.5">
      {parts.map(({ v, l }, i) => (
        <span key={l} className="flex items-center gap-1.5">
          <span className="flex flex-col items-center">
            <span className="font-mono font-black text-white text-xl tabular-nums leading-none">{v}</span>
            <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest leading-none mt-0.5">{l}</span>
          </span>
          {i < parts.length - 1 && (
            <span className="font-mono font-black text-white/40 text-base -mt-2">:</span>
          )}
        </span>
      ))}
    </div>
  )
}
