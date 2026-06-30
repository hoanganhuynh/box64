'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { MagnifyingGlass, X } from '@phosphor-icons/react'

export function SearchInput({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue ?? '')

  const push = useCallback((val: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (val.trim()) params.set('search', val.trim())
    else params.delete('search')
    params.set('page', '0')
    router.push(`${pathname}?${params.toString()}`)
  }, [pathname, router, searchParams])

  return (
    <form onSubmit={e => { e.preventDefault(); push(value) }} className="relative flex-1 max-w-xs">
      <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484858] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Tên, SĐT, mã đơn..."
        className="w-full h-9 pl-8 pr-7 bg-[#111118] border border-[#1E1E28] rounded-xl text-sm text-[#EEEEF4] placeholder-[#383848] focus:outline-none focus:border-[#F0A500]/50 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => { setValue(''); push('') }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#484858] hover:text-[#7A7A90] transition-colors"
        >
          <X size={13} />
        </button>
      )}
    </form>
  )
}
