'use client'

import { useState, useRef } from 'react'
import { Add, Minus, DocumentUpload, TickCircle, Call, Sms, Car } from 'iconsax-react'

interface CarEntry { id: number; model: string }

export default function SampleRequestForm() {
  const [name, setName]       = useState('')
  const [phone, setPhone]     = useState('')
  const [cars, setCars]       = useState<CarEntry[]>([{ id: 1, model: '' }])
  const [fileName, setFileName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    // Simulate submission — replace with real endpoint
    await new Promise(r => setTimeout(r, 900))
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <TickCircle size={36} color="var(--gold)" variant="Bold" />
        <p className="font-display font-extrabold text-primary text-lg uppercase tracking-wide">Request received!</p>
        <p className="text-muted text-sm max-w-xs">
          We&apos;ll contact you via phone or email within 24h to discuss your custom boxes.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Name + Phone row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Your name</span>
          <div className="relative">
            <Call size={13} color="rgba(245,158,11,0.4)" variant="Bold" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Minh Hoàng"
              className="w-full h-10 bg-bg border border-border rounded-sm pl-8 pr-3 text-sm text-primary placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Phone / Zalo</span>
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
        <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Car model(s)</span>
        {cars.map((car, i) => (
          <div key={car.id} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Car size={13} color="rgba(245,158,11,0.4)" variant="Bold" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={car.model}
                onChange={e => updateCar(car.id, e.target.value)}
                placeholder={`e.g. Porsche 911 GT3-R #77 AO Racing`}
                className="w-full h-10 bg-bg border border-border rounded-sm pl-8 pr-3 text-sm text-primary placeholder:text-white/20 focus:outline-none focus:border-gold/40 transition-colors"
              />
            </div>
            {cars.length > 1 && (
              <button
                type="button"
                onClick={() => removeCar(car.id)}
                aria-label="Remove car"
                className="w-10 h-10 flex items-center justify-center text-white/25 hover:text-error border border-border hover:border-error/30 rounded-sm transition-colors shrink-0"
              >
                <Minus size={14} color="currentColor" />
              </button>
            )}
            {i === cars.length - 1 && cars.length < 6 && (
              <button
                type="button"
                onClick={addCar}
                aria-label="Add another car"
                className="w-10 h-10 flex items-center justify-center text-white/25 hover:text-gold border border-border hover:border-gold/30 rounded-sm transition-colors shrink-0"
              >
                <Add size={14} color="currentColor" />
              </button>
            )}
          </div>
        ))}
        {cars.length < 6 && (
          <p className="text-[10px] text-white/25">Up to 6 cars per request · click + to add more</p>
        )}
      </div>

      {/* Image attachment */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Reference image <span className="normal-case font-normal opacity-60">(optional)</span></span>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-3 h-10 px-3 bg-bg border border-border rounded-sm text-sm text-white/30 hover:border-gold/30 hover:text-white/50 transition-colors text-left w-full"
        >
          <DocumentUpload size={15} color="currentColor" />
          <span className="truncate">{fileName || 'Upload car photo or livery reference'}</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => setFileName(e.target.files?.[0]?.name ?? '')}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="h-11 rounded-sm bg-gold text-[#07070C] font-bold text-sm tracking-wide uppercase hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'Sending…' : 'Request Sample Boxes'}
      </button>
    </form>
  )
}
