import { formatVND } from '@/lib/utils/format'

interface Props {
  price: number
  discountPct?: number
  salePrice?: number   // exact sale price — overrides discountPct math
  className?: string
  dark?: boolean
}

export default function PriceDisplay({ price, discountPct, salePrice, className = '', dark = false }: Props) {
  const finalSale = salePrice ?? (discountPct ? Math.round(price * (1 - discountPct / 100)) : undefined)
  if (!finalSale || finalSale >= price) {
    return (
      <span className={`font-semibold ${dark ? 'text-primary' : 'text-ink'} ${className}`}>
        {formatVND(price)}
      </span>
    )
  }
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="font-bold text-error">{formatVND(finalSale)}</span>
      <span className={`line-through text-sm ${dark ? 'text-faint' : 'text-ink-faint'}`}>
        {formatVND(price)}
      </span>
    </span>
  )
}
