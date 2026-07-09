'use client'
import { useRef, useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, MapPin, Phone, User, FileText, Building2, Tag } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { formatVND } from '@/lib/utils/format'
import { placeOrder } from '@/app/actions/checkout'
import { getBadgeDiscountPreview } from '@/app/actions/gamification'
import { getApplicableCodes, applyCouponCode, type ApplicableCode } from '@/app/actions/promotions'
import { getCartPrices } from '@/app/actions/prices'
import { createSupabaseClient } from '@/lib/supabase/client'

interface GeoItem { code: number; name: string }
interface DvhcvnWard { code: string; name: string }
interface DvhcvnProvince { code: string; name: string; wards: DvhcvnWard[] }

const PRIORITY_PROVINCES = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ']
function sortProvinces<T extends { name: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const ai = PRIORITY_PROVINCES.findIndex(k => a.name.includes(k))
    const bi = PRIORITY_PROVINCES.findIndex(k => b.name.includes(k))
    if (ai !== -1 && bi !== -1) return ai - bi
    if (ai !== -1) return -1
    if (bi !== -1) return 1
    return 0
  })
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items: cartItems, deselectedIds, syncPrices } = useCartStore()
  // Only the items the customer selected on the cart page are checked out —
  // the rest stay in the cart untouched.
  const items = useMemo(
    () => cartItems.filter(i => !deselectedIds.includes(i.id)),
    [cartItems, deselectedIds],
  )
  const [mounted, setMounted] = useState(false)
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const [applicableCodes, setApplicableCodes] = useState<ApplicableCode[]>([])
  const [selectedCode, setSelectedCode] = useState<string>('')
  const [manualCode, setManualCode] = useState('')
  const [manualLoading, setManualLoading] = useState(false)
  const [manualError, setManualError] = useState('')
  const [badgePreview, setBadgePreview] = useState<{ discount: number; label: string | null }>({ discount: 0, label: null })

  // Address system toggle
  const [addressType, setAddressType] = useState<'new' | 'old'>('new')

  // Old system (63 provinces) — cascading API
  const [apiProvinces, setApiProvinces] = useState<GeoItem[]>([])
  const [districts, setDistricts] = useState<GeoItem[]>([])
  const [wards, setWards] = useState<GeoItem[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(true)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingWards, setLoadingWards] = useState(false)

  // New system (34 provinces) — local JSON
  const [dvhcvnProvinces, setDvhcvnProvinces] = useState<DvhcvnProvince[]>([])
  const [newWards, setNewWards] = useState<DvhcvnWard[]>([])
  const [loadingDvhcvn, setLoadingDvhcvn] = useState(true)

  // Saved address from last order
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [savedAddress, setSavedAddress] = useState<Record<string, any> | null>(null)
  const [addressApplied, setAddressApplied] = useState(false)

  const [form, setForm] = useState({
    name: '', phone: '', address: '',
    provinceCode: 0, city: '',
    districtCode: 0, district: '',
    ward: '',
    note: '',
  })

  useEffect(() => {
    setMounted(true)

    // Cart lines carry a unit_price snapshot from add-to-cart time — refresh
    // it against current admin-set prices before the customer pays.
    const priceIds = cartItems.filter(i => !i.variant_key).map(i => i.product_id)
    if (priceIds.length > 0) getCartPrices(priceIds).then(syncPrices)

    // Returning from SePay's hosted checkout after a cancel or error
    const sp = new URLSearchParams(window.location.search)
    if (sp.get('cancelled')) setError('Bạn đã huỷ thanh toán. Vui lòng đặt hàng lại khi sẵn sàng.')
    else if (sp.get('error')) setError('Thanh toán thất bại. Vui lòng thử lại hoặc chọn ngân hàng khác.')

    // Load both address systems in parallel
    fetch('https://provinces.open-api.vn/api/p/')
      .then(r => r.json())
      .then(data => { setApiProvinces(data); setLoadingProvinces(false) })
      .catch(() => setLoadingProvinces(false))

    fetch('/dvhcvn.json')
      .then(r => r.json())
      .then((data: DvhcvnProvince[]) => { setDvhcvnProvinces(data); setLoadingDvhcvn(false) })
      .catch(() => setLoadingDvhcvn(false))

    // Require login — checkout uses the logged-in account's email for the
    // order confirmation. Redirect guests to login, return here afterwards.
    const supabase = createSupabaseClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace('/login?next=/checkout')
        return
      }
      setIsAuthed(true)

      if (data.user?.user_metadata?.full_name) {
        setForm(f => ({ ...f, name: data.user!.user_metadata.full_name as string }))
      }
      if (data.user?.id) {
        const { data: lastOrder } = await supabase
          .from('orders')
          .select('shipping')
          .eq('user_id', data.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        if (lastOrder?.shipping?.line1) {
          setSavedAddress(lastOrder.shipping)
        }
      }
    })
  }, [])

  // ── Old system handlers ──
  async function onProvinceChange(code: number, name: string) {
    setForm(f => ({ ...f, provinceCode: code, city: name, districtCode: 0, district: '', ward: '' }))
    setDistricts([])
    setWards([])
    if (!code) return
    setLoadingDistricts(true)
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`)
      const data = await res.json()
      setDistricts(data.districts ?? [])
    } finally { setLoadingDistricts(false) }
  }

  async function onDistrictChange(code: number, name: string) {
    setForm(f => ({ ...f, districtCode: code, district: name, ward: '' }))
    setWards([])
    if (!code) return
    setLoadingWards(true)
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`)
      const data = await res.json()
      setWards(data.wards ?? [])
    } finally { setLoadingWards(false) }
  }

  // ── New system handler ──
  function onNewProvinceChange(code: string, name: string) {
    const prov = dvhcvnProvinces.find(p => p.code === code)
    setNewWards(prov?.wards ?? [])
    setForm(f => ({ ...f, city: name, provinceCode: +code, district: '', districtCode: 0, ward: '' }))
  }

  // ── Switch address type ──
  function switchAddressType(type: 'new' | 'old') {
    setAddressType(type)
    setForm(f => ({ ...f, city: '', provinceCode: 0, district: '', districtCode: 0, ward: '' }))
    setDistricts([])
    setWards([])
    setNewWards([])
    setAddressApplied(false)
  }

  // ── Apply saved address ──
  async function applyAddress() {
    if (!savedAddress) return
    setForm(f => ({
      ...f,
      name: savedAddress.name ?? f.name,
      phone: savedAddress.phone ?? f.phone,
      address: savedAddress.line1 ?? f.address,
    }))
    setAddressApplied(true)

    if (addressType === 'old') {
      setForm(f => ({
        ...f,
        ward: savedAddress.ward ?? '',
        district: savedAddress.district ?? '',
        districtCode: savedAddress.district_code ?? 0,
        city: savedAddress.city ?? '',
        provinceCode: savedAddress.province_code ?? 0,
      }))
      const pCode = savedAddress.province_code
      const dCode = savedAddress.district_code
      if (pCode) {
        setLoadingDistricts(true)
        try {
          const res = await fetch(`https://provinces.open-api.vn/api/p/${pCode}?depth=2`)
          const data = await res.json()
          setDistricts(data.districts ?? [])
        } finally { setLoadingDistricts(false) }
      }
      if (dCode) {
        setLoadingWards(true)
        try {
          const res = await fetch(`https://provinces.open-api.vn/api/d/${dCode}?depth=2`)
          const data = await res.json()
          setWards(data.wards ?? [])
        } finally { setLoadingWards(false) }
      }
    } else {
      // New system has no old→new province code mapping, so match the saved
      // address by name instead — works whenever the saved order was itself
      // placed under the new (34-province) system, which stores the same
      // "Thành phố Đà Nẵng" / "Phường An Thắng" style names we compare here.
      const prov = dvhcvnProvinces.find(p => p.name === savedAddress.city)
      if (prov) {
        setNewWards(prov.wards)
        const ward = prov.wards.find(w => w.name === savedAddress.ward)
        setForm(f => ({
          ...f,
          city: prov.name,
          provinceCode: +prov.code,
          district: '', districtCode: 0,
          ward: ward?.name ?? '',
        }))
      }
    }
  }

  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0)
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const shippingFee = subtotal >= 500_000 ? 0 : 11_000
  const selected = applicableCodes.find(c => c.code === selectedCode)
  const discount = selected?.discount ?? 0

  useEffect(() => {
    if (!isAuthed || items.length === 0) { setApplicableCodes([]); setBadgePreview({ discount: 0, label: null }); return }
    getApplicableCodes(items, subtotal, shippingFee).then(codes => {
      setApplicableCodes(codes)
      // Auto-apply the single best code; let the shopper choose among several.
      setSelectedCode(prev => codes.some(c => c.code === prev) ? prev : (codes[0]?.code ?? ''))
    })
    // Preview only — placeOrder recomputes the badge discount server-side.
    getBadgeDiscountPreview(items).then(setBadgePreview).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, items.length, subtotal, shippingFee])

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function applyManualCode() {
    const code = manualCode.trim().toUpperCase()
    if (!code) return
    setManualLoading(true)
    setManualError('')
    const result = await applyCouponCode(code, items, subtotal, shippingFee)
    setManualLoading(false)
    if (result.error) {
      setManualError(result.error)
      return
    }
    setApplicableCodes(prev => {
      const withoutDup = prev.filter(c => c.code !== code)
      return [...withoutDup, { code, label: code, discount: result.discount ?? 0 }]
    })
    setSelectedCode(code)
    setManualCode('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return setError('Vui lòng nhập họ tên.')
    if (!form.phone.trim()) return setError('Vui lòng nhập số điện thoại.')
    if (!/^(\+?84|0)[3-9]\d{8}$/.test(form.phone.replace(/\s/g, ''))) return setError('Số điện thoại không hợp lệ (VD: 0901 234 567).')
    if (!form.address.trim()) return setError('Vui lòng nhập địa chỉ.')
    if (!form.city) return setError('Vui lòng chọn tỉnh/thành phố.')
    if (addressType === 'old' && !form.district) return setError('Vui lòng chọn quận/huyện.')
    if (!items.length) return setError('Giỏ hàng trống.')

    setLoading(true)
    setError('')

    const result = await placeOrder(
      {
        name: form.name, phone: form.phone, address: form.address,
        ward: form.ward, district: form.district, districtCode: form.districtCode,
        city: form.city, provinceCode: form.provinceCode, note: form.note,
      },
      items,
      subtotal,
      selectedCode || undefined,
      shippingFee,
      'sepay',
    )

    if (!result.success) {
      setLoading(false)
      setError(result.error ?? 'Có lỗi xảy ra, vui lòng thử lại.')
      return
    }

    // Server truth: placeOrder already applied flash re-pricing, coupon and
    // badge discounts — never re-derive the payable amount client-side.
    const total = result.total ?? (subtotal + shippingFee - discount - badgePreview.discount)
    sessionStorage.setItem('lastOrder', JSON.stringify({
      orderId: result.orderId,
      items,
      shippingFee,
      amount: total,
      paymentMethod: 'sepay',
      customerName: form.name,
    }))
    // Cart is cleared on the success page instead — if the customer cancels
    // or hits an error at SePay's checkout, they land back here with their
    // cart intact instead of having to re-add everything.

    // Redirect to SePay's hosted VietQR checkout — SePay confirms payment
    // via IPN webhook automatically, no manual admin step needed.
    const params = new URLSearchParams({
      order: result.orderId!,
      amount: String(total),
      name: form.name,
    })
    window.location.href = `/api/sepay/checkout?${params.toString()}`
  }

  // Wait for mount + auth check (redirect to login happens in the effect).
  if (!mounted || isAuthed === null) return null

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

      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Left: Shipping form (3/5) ── */}
          <div className="lg:col-span-3 flex flex-col gap-6">

            {/* Shipping info */}
            <section className="bg-surface border border-border rounded-xl p-5 sm:p-6">
              <h2 className="font-jakarta font-bold text-primary text-base mb-5 flex items-center gap-2">
                <MapPin size={16} className="text-gold" />
                Thông tin giao hàng
              </h2>

              {/* Address system toggle */}
              <div className="flex rounded-xl border border-border overflow-hidden mb-5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => switchAddressType('new')}
                  className={`flex-1 py-2.5 transition-colors ${addressType === 'new' ? 'bg-gold text-[#07070C]' : 'text-muted hover:text-primary'}`}
                >
                  Hệ thống mới · 34 tỉnh
                </button>
                <button
                  type="button"
                  onClick={() => switchAddressType('old')}
                  className={`flex-1 py-2.5 transition-colors border-l border-border ${addressType === 'old' ? 'bg-gold text-[#07070C]' : 'text-muted hover:text-primary'}`}
                >
                  Hệ thống cũ · 63 tỉnh
                </button>
              </div>

              {/* Saved address card */}
              {savedAddress && !addressApplied && (
                <div className="flex items-start gap-3 bg-gold/5 border border-white/10 rounded-xl p-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-gold uppercase tracking-wider mb-1">Địa chỉ đã lưu</p>
                    <p className="text-sm font-medium text-primary">{savedAddress.name} · {savedAddress.phone}</p>
                    <p className="text-xs text-muted mt-0.5 truncate">
                      {[savedAddress.line1, savedAddress.ward, savedAddress.district, savedAddress.city].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={applyAddress}
                    className="shrink-0 text-xs font-bold text-gold border border-gold/30 rounded-lg px-3 py-1.5 hover:bg-gold/10 transition-colors whitespace-nowrap"
                  >
                    Dùng lại
                  </button>
                </div>
              )}

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

                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                    <span className="text-gold/60"><Phone size={14} /></span>
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    onBlur={() => {
                      const v = form.phone.replace(/\s/g, '')
                      if (v && !/^(\+?84|0)[3-9]\d{8}$/.test(v))
                        setError('Số điện thoại không hợp lệ (VD: 0901 234 567).')
                      else if (error.includes('điện thoại')) setError('')
                    }}
                    placeholder="0901 234 567"
                    className={INPUT + (error.includes('điện thoại') ? ' border-error/60' : '')}
                  />
                  {error.includes('điện thoại') && (
                    <p className="text-[11px] text-error mt-1">{error}</p>
                  )}
                </div>

                {addressType === 'new' ? (
                  <>
                    {/* NEW system: Tỉnh/TP → Phường/Xã */}
                    <Field icon={<Building2 size={14} />} label="Tỉnh / Thành phố *">
                      <select
                        value={form.provinceCode || ''}
                        onChange={e => {
                          const opt = e.target.options[e.target.selectedIndex]
                          onNewProvinceChange(e.target.value, opt.text)
                        }}
                        className={INPUT}
                        disabled={loadingDvhcvn}
                      >
                        <option value="">
                          {loadingDvhcvn ? 'Đang tải...' : '-- Chọn tỉnh / thành phố --'}
                        </option>
                        {sortProvinces(dvhcvnProvinces).map(p => (
                          <option key={p.code} value={p.code}>{p.name}</option>
                        ))}
                      </select>
                    </Field>

                    <Field icon={<Building2 size={14} />} label="Phường / Xã">
                      <select
                        value={form.ward}
                        onChange={e => setForm(f => ({ ...f, ward: e.target.value }))}
                        className={INPUT}
                        disabled={!form.city}
                      >
                        <option value="">
                          {form.city ? '-- Chọn phường / xã --' : '-- Chọn tỉnh trước --'}
                        </option>
                        {newWards.map(w => (
                          <option key={w.code} value={w.name}>{w.name}</option>
                        ))}
                      </select>
                    </Field>
                  </>
                ) : (
                  <>
                    {/* OLD system: Tỉnh → Quận/Huyện → Phường/Xã */}
                    <Field icon={<Building2 size={14} />} label="Tỉnh / Thành phố *">
                      <select
                        value={form.provinceCode}
                        onChange={e => {
                          const opt = e.target.options[e.target.selectedIndex]
                          onProvinceChange(+e.target.value, opt.text)
                        }}
                        className={INPUT}
                        disabled={loadingProvinces}
                      >
                        <option value={0}>
                          {loadingProvinces ? 'Đang tải danh sách tỉnh...' : '-- Chọn tỉnh / thành phố --'}
                        </option>
                        {sortProvinces(apiProvinces).map(p => (
                          <option key={p.code} value={p.code}>{p.name}</option>
                        ))}
                      </select>
                    </Field>

                    <Field icon={<Building2 size={14} />} label="Quận / Huyện *">
                      <select
                        value={form.districtCode}
                        onChange={e => {
                          const opt = e.target.options[e.target.selectedIndex]
                          onDistrictChange(+e.target.value, opt.text)
                        }}
                        className={INPUT}
                        disabled={!form.provinceCode || loadingDistricts}
                      >
                        <option value={0}>
                          {loadingDistricts ? 'Đang tải...' : form.provinceCode ? '-- Chọn quận / huyện --' : '-- Chọn tỉnh trước --'}
                        </option>
                        {districts.map(d => (
                          <option key={d.code} value={d.code}>{d.name}</option>
                        ))}
                      </select>
                    </Field>

                    <Field icon={<Building2 size={14} />} label="Phường / Xã">
                      <select
                        value={form.ward}
                        onChange={e => setForm(f => ({ ...f, ward: e.target.value }))}
                        className={INPUT}
                        disabled={!form.districtCode || loadingWards}
                      >
                        <option value="">
                          {loadingWards ? 'Đang tải...' : form.districtCode ? '-- Chọn phường / xã --' : '-- Chọn quận trước --'}
                        </option>
                        {wards.map(w => (
                          <option key={w.code} value={w.name}>{w.name}</option>
                        ))}
                      </select>
                    </Field>
                  </>
                )}

                {/* Số nhà, tên đường — common to both systems */}
                <Field icon={<MapPin size={14} />} label="Số nhà, tên đường *">
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => set('address', e.target.value)}
                    placeholder="VD: 123 Nguyễn Huệ"
                    className={INPUT}
                  />
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

            {/* Payment — PayOS coming soon */}
          </div>

          {/* ── Right: Order summary (2/5) ── */}
          <div className="lg:col-span-2">
            <div className="bg-surface border border-border rounded-xl p-5 sticky top-24">
              <h2 className="font-jakarta font-bold text-primary text-base mb-4">
                Đơn hàng ({totalItems} sản phẩm)
              </h2>

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

              {/* Promo code */}
              <div className="border-t border-border pt-4 mb-1">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                  <Tag size={14} className="text-gold/60" /> Mã giảm giá
                </label>

                {applicableCodes.length === 1 ? (
                  <div className="flex items-center justify-between bg-gold/5 border border-gold/25 rounded-lg px-3 py-2 mb-2">
                    <span className="font-mono text-xs font-bold text-gold">{applicableCodes[0].code}</span>
                    <span className="text-xs text-gold">-{formatVND(applicableCodes[0].discount)}</span>
                  </div>
                ) : applicableCodes.length > 1 ? (
                  <select value={selectedCode} onChange={e => setSelectedCode(e.target.value)} className={`${INPUT} mb-2`}>
                    <option value="">Không dùng mã</option>
                    {applicableCodes.map(c => (
                      <option key={c.code} value={c.code}>{c.label} · -{formatVND(c.discount)}</option>
                    ))}
                  </select>
                ) : null}

                <div className="flex gap-2">
                  <input
                    value={manualCode}
                    onChange={e => { setManualCode(e.target.value); setManualError('') }}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyManualCode())}
                    placeholder="Nhập mã giảm giá"
                    className={`${INPUT} font-mono uppercase`}
                  />
                  <button
                    type="button"
                    onClick={applyManualCode}
                    disabled={manualLoading || !manualCode.trim()}
                    className="shrink-0 h-10 px-4 rounded-lg border border-border text-xs font-semibold text-primary hover:border-gold/40 hover:text-gold transition-colors disabled:opacity-40"
                  >
                    {manualLoading ? '...' : 'Áp dụng'}
                  </button>
                </div>
                {manualError && <p className="text-[11px] text-error mt-1.5">{manualError}</p>}
              </div>

              <div className="border-t border-border pt-4 flex flex-col gap-2 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-muted">Tạm tính</span>
                  <span className="text-primary font-medium">{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Phí vận chuyển <span className="text-faint text-xs">· SPX</span></span>
                  {shippingFee === 0
                    ? <span className="text-success text-xs font-semibold">Miễn phí</span>
                    : <span className="text-primary">{formatVND(shippingFee)}</span>
                  }
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted">Giảm giá</span>
                    <span className="text-success font-medium">-{formatVND(discount)}</span>
                  </div>
                )}
                {badgePreview.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gold">🏆 {badgePreview.label}</span>
                    <span className="text-success font-medium">-{formatVND(badgePreview.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2 mt-1">
                  <span className="font-bold text-primary">Tổng cộng</span>
                  <span className="font-extrabold text-gold text-base">{formatVND(subtotal + shippingFee - discount - badgePreview.discount)}</span>
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
                {loading ? 'Đang xử lý…' : <>Đặt hàng & Thanh toán <ArrowRight size={15} /></>}
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
