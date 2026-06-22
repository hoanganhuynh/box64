'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const SORT_OPTIONS = [
  { value: '',           label: 'Default' },
  { value: 'latest',     label: 'Latest' },
  { value: 'sale',       label: 'Sale Off' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
]

export default function SortSelect() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const current = params.get('sort') ?? ''

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(params.toString())
    if (e.target.value) next.set('sort', e.target.value)
    else next.delete('sort')
    const qs = next.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`)
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-muted text-xs whitespace-nowrap">Sort by</label>
      <select
        id="sort"
        value={current}
        onChange={handleChange}
        className="text-sm border border-border rounded-sm bg-surface text-primary px-3 py-1.5 focus:outline-none focus:border-gold/50 cursor-pointer"
      >
        {SORT_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
