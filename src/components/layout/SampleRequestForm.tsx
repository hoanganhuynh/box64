'use client'

import { useState, useRef } from 'react'
import { Add, Minus, TickCircle, Call, Sms, Car, GalleryAdd } from 'iconsax-react'
import { submitCustomRequest } from '@/app/actions/custom-requests'

interface CarEntry { id: number; model: string }

export default function SampleRequestForm({
  defaultCarModel = '',
  searchQuery,
  source = 'footer',
}: {
  defaultCarModel?: string
  searchQuery?: string
  source?: 'search' | 'footer'
}) {
  const [name, setName]       = useState('')
  const [phone, setPhone]     = useState('')
  const [cars, setCars]       = useState<CarEntry[]>([{ id: 1, model: defaultCarModel }])
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const nextId = useRef(2)

  const addCar = () => {
    setCars(cs => [...cs, { id: nextId.current++, model: '' }])
  }

  const removeCar = (id: number) => {
    setCars(cs => cs.filter(c => c.id !== id))
  }

  const updateCar = (id: number, model: string) => {
    setCars(cs => cs.map(c => c.id === id ? { ...c, model } : c))
  }

  const updateImageUrl = (i: number, value: string) => {
    setImageUrls(urls => urls.map((u, idx) => idx === i ? value : u))
  }

  const addImageUrl = () => {
    if (imageUrls.length < 3) setImageUrls(urls => [...urls, ''])
  }

  const removeImageUrl = (i: number) => {
    setImageUrls(urls => urls.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const result = await submitCustomRequest({
      name,
      phone,
      carModels: cars.map(c => c.model),
      imageUrls,
      searchQuery,
      source,
    })
    setSubmitting(false)
    if (!result.success) {
      setError(result.error ?? 'Có lỗi xảy ra, vui lòng thử lại.')
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <TickCircle size={36} color="var(--gold)" variant="Bold" />
        <p className="font-display font-extrabold text-primary text-lg uppercase tracking-wide">Đã nhận yêu cầu!</p>
        <p className="text-muted text-sm max-w-xs">
          Chúng tôi sẽ liên hệ qua điện thoại trong vòng 24h để trao đổi về mẫu box của bạn.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Name + Phone row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Họ tên</span>
          <div className="relative">
            <Call size={13} color="rgba(245,158,11,0.4)" variant="Bold" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Minh Hoàng"
              className="w-full h-10 bg-bg border border-border rounded-sm pl-8 pr-3 text-sm text-primary placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Điện thoại / Zalo</span>
          <div className="relative">
            <Sms size={13} color="rgba(245,158,11,0.4)" variant="Bold" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="0901 234 567"
              className="w-full h-10 bg-bg border border-border rounded-sm pl-8 pr-3 text-sm text-primary placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors"
            />
          </div>
        </label>
      </div>

      {/* Car models */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Mẫu xe</span>
        {cars.map((car, i) => (
          <div key={car.id} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Car size={13} color="rgba(245,158,11,0.4)" variant="Bold" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={car.model}
                onChange={e => updateCar(car.id, e.target.value)}
                placeholder="VD: Porsche 911 GT3-R #77 AO Racing"
                className="w-full h-10 bg-bg border border-border rounded-sm pl-8 pr-3 text-sm text-primary placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors"
              />
            </div>
            {cars.length > 1 && (
              <button
                type="button"
                onClick={() => removeCar(car.id)}
                aria-label="Xoá mẫu xe"
                className="w-10 h-10 flex items-center justify-center text-white/25 hover:text-error border border-border hover:border-error/30 rounded-sm transition-colors shrink-0"
              >
                <Minus size={14} color="currentColor" />
              </button>
            )}
            {i === cars.length - 1 && cars.length < 6 && (
              <button
                type="button"
                onClick={addCar}
                aria-label="Thêm mẫu xe"
                className="w-10 h-10 flex items-center justify-center text-white/25 hover:text-gold border border-border hover:border-gold/30 rounded-sm transition-colors shrink-0"
              >
                <Add size={14} color="currentColor" />
              </button>
            )}
          </div>
        ))}
        {cars.length < 6 && (
          <p className="text-[10px] text-white/25">Tối đa 6 mẫu xe · bấm + để thêm</p>
        )}
      </div>

      {/* Image links */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">
          Link ảnh tham khảo <span className="normal-case font-normal opacity-60">(không bắt buộc, tối đa 3)</span>
        </span>
        {imageUrls.map((url, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="relative flex-1">
              <GalleryAdd size={13} color="rgba(245,158,11,0.4)" variant="Bold" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="url"
                value={url}
                onChange={e => updateImageUrl(i, e.target.value)}
                placeholder="https://..."
                className="w-full h-10 bg-bg border border-border rounded-sm pl-8 pr-3 text-sm text-primary placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors"
              />
            </div>
            {imageUrls.length > 1 && (
              <button
                type="button"
                onClick={() => removeImageUrl(i)}
                aria-label="Xoá link ảnh"
                className="w-10 h-10 flex items-center justify-center text-white/25 hover:text-error border border-border hover:border-error/30 rounded-sm transition-colors shrink-0"
              >
                <Minus size={14} color="currentColor" />
              </button>
            )}
            {i === imageUrls.length - 1 && imageUrls.length < 3 && (
              <button
                type="button"
                onClick={addImageUrl}
                aria-label="Thêm link ảnh"
                className="w-10 h-10 flex items-center justify-center text-white/25 hover:text-gold border border-border hover:border-gold/30 rounded-sm transition-colors shrink-0"
              >
                <Add size={14} color="currentColor" />
              </button>
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-error text-sm">{error}</p>}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="h-11 rounded-sm bg-gold text-[#07070C] font-bold text-sm tracking-wide uppercase hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'Đang gửi…' : 'Yêu cầu mẫu box'}
      </button>
    </form>
  )
}
