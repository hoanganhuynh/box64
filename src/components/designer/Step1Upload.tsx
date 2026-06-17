'use client'

import { useRef, useState } from 'react'
import { Upload, ImagePlus } from 'lucide-react'
import { useDesignerStore } from '@/lib/store/designer'

export default function Step1Upload() {
  const { car_image_url, setCarImageUrl, nextStep } = useDesignerStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function loadFile(file: File | null) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => { if (e.target?.result) setCarImageUrl(e.target.result as string) }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-1">
        <h2 className="font-jakarta font-extrabold text-primary text-xl">Upload Car Photo</h2>
        <p className="text-muted text-sm">PNG or JPG · transparent background recommended</p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); loadFile(e.dataTransfer.files[0]) }}
        className={[
          'relative border-2 border-dashed rounded-lg p-8 cursor-pointer transition-all text-center',
          dragging ? 'border-gold bg-gold-light' : 'border-border hover:border-gold/50 bg-surface',
        ].join(' ')}
      >
        {car_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={car_image_url} alt="Car preview" className="max-h-40 mx-auto object-contain" />
        ) : (
          <div className="space-y-3">
            <ImagePlus className="mx-auto text-faint" size={48} />
            <p className="text-muted text-sm">Drag & drop or click to upload</p>
            <p className="text-faint text-xs">Max 5MB · PNG / JPG / WEBP</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={e => loadFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {car_image_url && (
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setCarImageUrl(null)}
            className="px-4 py-2 rounded border border-border text-muted text-sm hover:border-error/50 hover:text-error transition-colors"
          >
            Remove
          </button>
          <button
            onClick={nextStep}
            className="px-6 py-2 rounded bg-gold text-white font-semibold text-sm hover:bg-gold-mid transition-colors flex items-center gap-2"
          >
            Next <Upload size={14} />
          </button>
        </div>
      )}

      <button
        onClick={nextStep}
        className="w-full text-center text-xs text-faint hover:text-muted underline underline-offset-2 transition-colors"
      >
        Skip — design without a car photo
      </button>
    </div>
  )
}
