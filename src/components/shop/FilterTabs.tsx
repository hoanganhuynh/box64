'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const TABS = [
  { label: 'All',        value: '' },
  { label: 'On Sale',    value: 'sale' },
  { label: 'Pre-order',  value: 'pre_order' },
]

export default function FilterTabs() {
  const params = useSearchParams()
  const active = params.get('type') ?? ''

  return (
    <div className="flex gap-2 flex-wrap">
      {TABS.map(tab => {
        const href = tab.value ? `/shop?type=${tab.value}` : '/shop'
        const isActive = active === tab.value
        return (
          <Link
            key={tab.value}
            href={href}
            className={`
              h-11 px-4 rounded-sm text-sm font-medium transition-colors inline-flex items-center
              ${isActive
                ? 'bg-gold text-[#09090F]'
                : 'bg-surface border border-border text-muted hover:border-gold/40 hover:text-primary'}
            `}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
