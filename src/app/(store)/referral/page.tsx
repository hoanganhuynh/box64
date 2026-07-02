'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, Gift, Users } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { getMyReferral, type MyReferral } from '@/app/actions/referral'
import { formatVND } from '@/lib/utils/format'

export default function ReferralPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [referral, setReferral] = useState<MyReferral | null>(null)
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setMounted(true)
    setOrigin(window.location.origin)
    const supabase = createSupabaseClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace('/login?next=/referral')
        return
      }
      const r = await getMyReferral()
      setReferral(r)
    })
  }, [router])

  if (!mounted || !referral) return null

  const referralUrl = `${origin}/r/${referral.referralCode}`

  function copyLink() {
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="text-gold text-[10px] font-bold tracking-[0.22em] uppercase mb-2">
          <span className="opacity-40 mr-1.5">//</span>Mời bạn bè
        </p>
        <h1 className="font-jakarta font-extrabold text-primary text-2xl sm:text-3xl">
          Mời bạn, cả hai cùng nhận 20.000đ
        </h1>
        <p className="text-sm text-muted mt-2 max-w-md mx-auto">
          Chia sẻ link bên dưới. Khi bạn bè đăng ký thành công, cả bạn và họ đều nhận voucher 20.000đ để mua box.
        </p>
      </div>

      {/* QR + link */}
      <div className="w-full bg-surface border border-border rounded-xl p-6 flex flex-col items-center gap-5">
        <div className="rounded-xl overflow-hidden border border-white/10 bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(referralUrl)}`}
            alt="QR mời bạn bè"
            width={200}
            height={200}
            className="block"
          />
        </div>

        <div className="w-full flex items-center gap-2 bg-bg border border-border rounded-lg px-4 py-3">
          <span className="flex-1 text-sm font-mono text-primary truncate">{referralUrl}</span>
          <button onClick={copyLink} className="shrink-0 text-muted hover:text-gold transition-colors">
            {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
          </button>
        </div>

        <div className="w-full flex items-center justify-center gap-2 text-xs text-muted">
          <Users size={13} className="text-gold" />
          Đã mời thành công <span className="text-primary font-bold">{referral.referralsCount}</span> người
        </div>
      </div>

      {/* Vouchers */}
      <div className="w-full">
        <p className="text-[11px] text-muted uppercase tracking-widest font-bold mb-3 flex items-center gap-1.5">
          <Gift size={13} className="text-gold" /> Voucher của bạn
        </p>
        {referral.vouchers.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl px-5 py-8 text-center text-sm text-faint">
            Chưa có voucher nào. Mời bạn bè để nhận voucher đầu tiên!
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {referral.vouchers.map(v => (
              <div key={v.id} className={`flex items-center justify-between gap-3 border rounded-lg px-4 py-3 ${
                v.used ? 'bg-surface/40 border-border opacity-50' : 'bg-gold/5 border-gold/25'
              }`}>
                <div>
                  <p className="font-mono font-bold text-primary text-sm">{v.code}</p>
                  <p className="text-xs text-muted mt-0.5">{v.used ? 'Đã sử dụng' : 'Tự động áp dụng khi thanh toán'}</p>
                </div>
                <p className="font-extrabold text-gold text-base shrink-0">{formatVND(v.value)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
