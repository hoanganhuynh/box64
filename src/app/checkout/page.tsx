'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, MapPin, Phone, User, FileText, Building2 } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { formatVND } from '@/lib/utils/format'
import { placeOrder } from '@/app/actions/checkout'
import { createSupabaseClient } from '@/lib/supabase/client'

const PROVINCES = [
  'TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'Bình Dương', 'Đồng Nai', 'Khánh Hòa', 'Lâm Đồng', 'Nghệ An',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Phước', 'Bình Thuận',
  'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên',
  'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh',
  'Hải Dương', 'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Kiên Giang',
  'Kon Tum', 'Lai Châu', 'Lạng Sơn', 'Lào Cai', 'Long An',
  'Nam Định', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
  'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
  'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
  'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
  'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', phone: '', address: '', city: 'TP. Hồ Chí Minh', note: '',
  })

  // Pre-fill name from Google profile
  useEffect(() => {
    setMounted(true)
    const supabase = createSupabaseClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.user_metadata?.full_name) {
        setForm(f => ({ ...f, name: data.user!.user_metadata.full_name as string }))
      }
    })
  }, [])

  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0)
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return setError('Vui lòng nhập họ tên.')
    if (!form.phone.trim()) return setError('Vui lòng nhập số điện thoại.')
    if (!form.address.trim()) return setError('Vui lòng nhập địa chỉ.')
    if (!items.length) return setError('Giỏ hàng trống.')

    setLoading(true)
    const result = await placeOrder(form, items, subtotal)
    setLoading(false)

    if (!result.success) {
      setError(result.error ?? 'Có lỗi xảy ra, vui lòng thử lại.')
      return
    }

    clearCart()
    router.push(`/checkout/success?order=${result.orderId}`)
  }

  if (!mounted) return null

  if (!items.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-muted mb-4">Giỏ hàng trống.</p>
        <Link href="/shop" className="text-gold hover:text-gold/80 text-sm font-semibold">← Tiếp tục mua sắm</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/cart" className="text-muted hover:text-primary transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-jakarta font-extrabold text-primary text-2xl sm:text-3xl">Checkout</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Left: Shipping form (3/5) ── */}
          <div className="lg:col-span-3 flex flex-col gap-6">

            {/* Shipping info */}
            <section className="bg-surface border border-border rounded-xl p-5 sm:p-6">
              <h2 className="font-jakarta font-bold text-primary text-base mb-5 flex items-center gap-2">
                <MapPin size={16} className="text-gold" />
                Thông tin giao hàng
              </h2>

              <div className="flex flex-col gap-4">
                <Field icon={<User size={14} />} label="Họ và tên *">
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className={INPUT}
                  />
                </Field>

                <Field icon={<Phone size={14} />} label="Số điện thoại *">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="0901 234 567"
                    className={INPUT}
                  />
                </Field>

                <Field icon={<MapPin size={14} />} label="Địa chỉ *">
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => set('address', e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                    className={INPUT}
                  />
                </Field>

                <Field icon={<Building2 size={14} />} label="Tỉnh / Thành phố *">
                  <select
                    value={form.city}
                    onChange={e => set('city', e.target.value)}
                    className={INPUT}
                  >
                    {PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </Field>

                <Field icon={<FileText size={14} />} label="Ghi chú">
                  <textarea
                    value={form.note}
                    onChange={e => set('note', e.target.value)}
                    placeholder="Ghi chú cho shop (không bắt buộc)"
                    rows={2}
                    className={INPUT + ' resize-none'}
                  />
                </Field>
              </div>
            </section>

            {/* Payment method — placeholder */}
            <section className="bg-surface border border-border rounded-xl p-5 sm:p-6">
              <h2 className="font-jakarta font-bold text-primary text-base mb-4 flex items-center gap-2">
                <span className="text-gold">💳</span>
                Phương thức thanh toán
              </h2>

              <div className="flex flex-col gap-2">
                {/* Active option */}
                <label className="flex items-center gap-3 p-3.5 rounded-lg border border-gold/40 bg-gold/5 cursor-pointer">
                  <span className="w-4 h-4 rounded-full border-2 border-gold flex items-center justify-center shrink-0">
                    <span className="w-2 h-2 rounded-full bg-gold" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-primary">Chuyển khoản ngân hàng</p>
                    <p className="text-[11px] text-muted mt-0.5">Thông tin tài khoản gửi sau khi đặt hàng</p>
                  </div>
                </label>

                {/* Coming soon */}
                {[
                  { name: 'VNPay QR', desc: 'Quét QR — tất cả ngân hàng VN' },
                  { name: 'MoMo', desc: 'Ví điện tử MoMo' },
                ].map(m => (
                  <div key={m.name} className="flex items-center gap-3 p-3.5 rounded-lg border border-border opacity-40 cursor-not-allowed">
                    <span className="w-4 h-4 rounded-full border-2 border-border shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-primary">{m.name}</p>
                      <p className="text-[11px] text-muted">{m.desc} — <span className="text-gold/70">Sắp có</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Right: Order summary (2/5) ── */}
          <div className="lg:col-span-2">
            <div className="bg-surface border border-border rounded-xl p-5 sticky top-24">
              <h2 className="font-jakarta font-bold text-primary text-base mb-4">
                Đơn hàng ({totalItems} sản phẩm)
              </h2>

              {/* Items */}
              <div className="flex flex-col gap-3 mb-5 max-h-64 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-sm overflow-hidden bg-[#0F1729] shrink-0">
                      <Image src={item.image_url || '/products/p1.jpg'} alt={item.product_name} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-primary line-clamp-2 leading-snug">{item.product_name}</p>
                      <p className="text-[11px] text-muted mt-0.5">x{item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold text-primary shrink-0">{formatVND(item.unit_price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-4 flex flex-col gap-2 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-muted">Tạm tính</span>
                  <span className="text-primary font-medium">{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Phí vận chuyển</span>
                  <span className="text-muted text-xs italic">Tính khi giao hàng</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 mt-1">
                  <span className="font-bold text-primary">Tổng cộng</span>
                  <span className="font-extrabold text-gold text-base">{formatVND(subtotal)}</span>
                </div>
              </div>

              {error && (
                <p className="text-xs text-error mb-3 bg-error/10 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-lg bg-gold text-[#07070C] font-bold text-sm flex items-center justify-center gap-2 hover:bg-gold/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xử lý…' : <>Đặt hàng <ArrowRight size={15} /></>}
              </button>

              <p className="text-[10px] text-faint text-center mt-3 leading-relaxed">
                Bằng cách đặt hàng, bạn đồng ý với điều khoản dịch vụ của chúng tôi.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

const INPUT = 'w-full h-10 px-3 rounded-lg bg-bg border border-border text-sm text-primary placeholder:text-faint focus:outline-none focus:border-gold/60 transition-colors'

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">
        <span className="text-gold/60">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  )
}
