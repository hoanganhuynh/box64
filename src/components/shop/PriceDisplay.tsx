import { formatVND } from '@/lib/utils/format'

interface Props {
  price: number
  discountPct?: number
  className?: string
}

export default function PriceDisplay({ price, discountPct, className = '' }: Props) {
  if (!discountPct) {
    return <span className={`font-semibold text-ink ${className}`}>{formatVND(price)}</span>
  }
  const salePrice = Math.round(price * (1 - discountPct / 100))
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="font-bold text-error">{formatVND(salePrice)}</span>
      <span className="text-ink-faint line-through text-sm">{formatVND(price)}</span>
    </span>
  )
}
