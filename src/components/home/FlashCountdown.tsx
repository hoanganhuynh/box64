'use client'
import { useEffect, useState } from 'react'
import { formatCountdown } from '@/lib/utils/format'

export default function FlashCountdown({ endDate, large }: { endDate: string; large?: boolean }) {
  const [delta, setDelta] = useState<number | null>(null)

  useEffect(() => {
    setDelta(new Date(endDate).getTime() - Date.now())
    const tick = setInterval(() => setDelta(new Date(endDate).getTime() - Date.now()), 1000)
    return () => clearInterval(tick)
  }, [endDate])

  if (delta === null || delta <= 0) return null

  const { days, hours, minutes, seconds } = formatCountdown(delta)
  const parts = days > 0
    ? [{ v: String(days).padStart(2, '0'), l: 'D' }, { v: String(hours).padStart(2, '0'), l: 'H' }, { v: String(minutes).padStart(2, '0'), l: 'M' }]
    : [{ v: String(hours).padStart(2, '0'), l: 'H' }, { v: String(minutes).padStart(2, '0'), l: 'M' }, { v: String(seconds).padStart(2, '0'), l: 'S' }]

  return (
    <div className="flex items-center gap-2">
      {parts.map(({ v, l }, i) => (
        <span key={l} className="flex items-center gap-2">
          <span className="flex flex-col items-center">
            <span className={`font-display font-extrabold text-white tabular-nums leading-none ${large ? 'text-3xl sm:text-4xl' : 'text-xl font-mono'}`}>{v}</span>
            <span className={`text-white/50 font-bold uppercase tracking-widest leading-none mt-1 ${large ? 'text-[10px]' : 'text-[8px]'}`}>{l}</span>
          </span>
          {i < parts.length - 1 && (
            <span className={`font-display font-extrabold text-white/30 -mt-3 ${large ? 'text-3xl' : 'text-base'}`}>:</span>
          )}
        </span>
      ))}
    </div>
  )
}
