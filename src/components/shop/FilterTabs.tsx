'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const TABS = [
  { label: 'All',         value: ''           },
  { label: 'Box Catalog', value: 'box_catalog' },
  { label: 'Box Custom',  value: 'box_custom'  },
  { label: 'Pre-order',   value: 'pre_order'   },
  { label: 'Sale',        value: 'sale'        },
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
              px-4 py-2 rounded-sm text-sm font-medium transition-colors
              ${isActive
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-muted hover:border-primary hover:text-primary'}
            `}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
