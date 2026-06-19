import { formatVND } from '@/lib/utils/format'

interface Props {
  price: number
  discountPct?: number
  className?: string
  dark?: boolean
}

export default function PriceDisplay({ price, discountPct, className = '', dark = false }: Props) {
  if (!discountPct) {
    return (
      <span className={`font-semibold ${dark ? 'text-primary' : 'text-ink'} ${className}`}>
        {formatVND(price)}
      </span>
    )
  }
  const salePrice = Math.round(price * (1 - discountPct / 100))
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="font-bold text-error">{formatVND(salePrice)}</span>
      <span className={`line-through text-sm ${dark ? 'text-faint' : 'text-ink-faint'}`}>
        {formatVND(price)}
      </span>
    </span>
  )
}
