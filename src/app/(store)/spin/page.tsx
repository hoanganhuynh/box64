'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Gift, Copy, Check, Ticket, ArrowRight } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { getMyGameStatus, spinWheel, type MyGameStatus, type SpinResult } from '@/app/actions/gamification'
import { formatVND } from '@/lib/utils/format'

// Segment order MUST match SPIN_REWARD_KEYS on the server — segmentIndex
// from spinWheel() indexes into this same order.
const SEGMENTS = [
  { label: '20% SP đặc biệt', color: '#F0A500' },
  { label: 'Freeship',        color: '#22c55e' },
  { label: '10% hãng xe',     color: '#6366f1' },
  { label: '10% màu',         color: '#e54c8a' },
  { label: 'May mắn lần sau', color: '#484858' },
]
const SEG = 360 / SEGMENTS.length

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} aria-label="Copy" className="text-muted hover:text-gold transition-colors shrink-0">
      {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
    </button>
  )
}

export default function SpinPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [status, setStatus] = useState<MyGameStatus | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<Extract<SpinResult, { success: true }> | null>(null)
  const [error, setError] = useState('')
  const rotationRef = useRef(0)

  useEffect(() => {
    setMounted(true)
    const supabase = createSupabaseClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace('/login?next=/spin')
        return
      }
      setStatus(await getMyGameStatus())
    })
  }, [router])

  if (!mounted || !status) return null

  const pendingSpin = status.spins.find(s => s.status === 'pending')

  async function handleSpin() {
    if (!pendingSpin || spinning) return
    setSpinning(true)
    setError('')
    setResult(null)

    const res = await spinWheel(pendingSpin.id)
    if (!res.success) {
      setSpinning(false)
      setError(res.error)
      setStatus(await getMyGameStatus())
      return
    }

    // Land the winning segment's center under the top pointer, always
    // spinning forward at least 5 full turns from wherever we are.
    const target = 360 - (res.segmentIndex * SEG + SEG / 2)
    const current = rotationRef.current % 360
    const delta = (360 * 5) + ((target - current + 360) % 360)
    rotationRef.current += delta
    setRotation(rotationRef.current)

    setTimeout(async () => {
      setResult(res)
      setSpinning(false)
      setStatus(await getMyGameStatus())
    }, 4300)
  }

  const conic = SEGMENTS.map((s, i) => `${s.color} ${i * SEG}deg ${(i + 1) * SEG}deg`).join(', ')

  const wonSpins = status.spins.filter(s => s.status === 'spun' && s.code)

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col items-center">
      <div className="text-center mb-8">
        <p className="text-gold text-[10px] font-bold tracking-[0.22em] uppercase mb-2.5">
          <span className="opacity-40 mr-1.5">//</span>Vòng quay may mắn
        </p>
        <h1 className="font-display font-extrabold text-white text-3xl sm:text-4xl">Quay là trúng</h1>
        <p className="text-white/40 text-sm mt-2">
          Mỗi đơn hàng thanh toán thành công tặng bạn 1 lượt quay.
        </p>
      </div>

      {/* Wheel */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 mb-6">
        {/* Pointer */}
        <div aria-hidden="true" className="absolute left-1/2 -top-1 -translate-x-1/2 z-10 w-0 h-0
          border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-gold drop-shadow" />
        <div
          className="w-full h-full rounded-full border-4 border-gold/60 shadow-[0_0_60px_rgba(245,158,11,0.15)]"
          style={{
            background: `conic-gradient(${conic})`,
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 4s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          }}
        >
          {SEGMENTS.map((s, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 text-[10px] font-bold text-white/90 whitespace-nowrap select-none"
              style={{
                transform: `rotate(${i * SEG + SEG / 2 - 90}deg) translateX(72px) rotate(90deg)`,
                transformOrigin: '0 0',
              }}
            >
              {s.label}
            </span>
          ))}
        </div>
        {/* Hub */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-[#07070C] border-2 border-gold flex items-center justify-center">
          <Gift size={20} className="text-gold" />
        </div>
      </div>

      {/* Spin button / state */}
      {pendingSpin ? (
        <button
          onClick={handleSpin}
          disabled={spinning}
          className="h-12 px-10 rounded-sm bg-gold text-[#07070C] font-extrabold text-base uppercase tracking-wide hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {spinning ? 'Đang quay…' : `Quay ngay (còn ${status.pendingSpins} lượt)`}
        </button>
      ) : (
        <div className="text-center">
          <p className="text-white/40 text-sm mb-4">Bạn chưa có lượt quay nào — đặt hàng để nhận lượt quay nhé!</p>
          <Link href="/shop" className="inline-flex items-center gap-2 h-10 px-6 rounded-sm bg-gold text-[#07070C] font-bold text-sm hover:bg-gold-mid transition-colors">
            Mua sắm ngay <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {error && <p className="text-error text-sm mt-4">{error}</p>}

      {/* Result */}
      {result && (
        <div className={`w-full mt-6 rounded-xl border px-5 py-5 text-center ${
          result.reward === 'nothing' ? 'bg-surface border-border' : 'bg-gold/5 border-gold/30'
        }`}>
          <p className="font-display font-extrabold text-primary text-lg mb-1">
            {result.reward === 'nothing' ? '🍀 ' : '🎉 '}{result.label}
          </p>
          {result.code && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="font-mono font-bold text-gold text-base tracking-wider">{result.code}</span>
              <CopyButton text={result.code} />
            </div>
          )}
          {result.code && (
            <p className="text-[11px] text-muted mt-2">Tự động hiện ở bước thanh toán · hết hạn sau 7 ngày</p>
          )}
        </div>
      )}

      {/* Won vouchers */}
      {wonSpins.length > 0 && (
        <div className="w-full mt-10">
          <p className="flex items-center gap-1.5 text-[11px] text-muted uppercase tracking-widest font-bold mb-3">
            <Ticket size={13} className="text-gold" /> Voucher đã trúng
          </p>
          <div className="flex flex-col gap-2">
            {wonSpins.map(s => (
              <div key={s.id} className="flex items-center justify-between gap-3 bg-surface border border-border rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono font-bold text-primary text-sm truncate">{s.code}</span>
                  <CopyButton text={s.code!} />
                </div>
                <span className="text-xs text-muted shrink-0">
                  {s.code_type === 'freeship' ? 'Freeship' : s.code_type === 'percent' ? `−${s.code_value}%` : `−${formatVND(s.code_value ?? 0)}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
