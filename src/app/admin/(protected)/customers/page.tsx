export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getCustomers } from '@/lib/admin/queries'
import CustomersClient from './_client'

export default function CustomersPage() {
  return (
    <div className="p-6 lg:p-8">
      <Suspense fallback={
        <div className="p-8 flex items-center gap-3 text-[#484858] text-sm">
          <span className="w-4 h-4 border-2 border-[#F0A500] border-t-transparent rounded-full animate-spin" />
          Đang tải...
        </div>
      }>
        <CustomersDataLoader />
      </Suspense>
    </div>
  )
}

async function CustomersDataLoader() {
  const customers = await getCustomers()
  return <CustomersClient customers={customers} />
}
