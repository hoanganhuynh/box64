'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { DayStat } from '@/lib/admin/queries'

function vnd(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return n.toString()
}

function fmtDay(d: string) {
  const date = new Date(d)
  return `${date.getDate()}/${date.getMonth() + 1}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#111120] border border-[#1C1C26] rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[11px] text-[#555] mb-1">{label}</p>
      <p className="text-base font-bold text-[#F0A500]">
        {new Intl.NumberFormat('vi-VN').format(payload[0].value)} ₫
      </p>
      <p className="text-[11px] text-[#555] mt-0.5">{payload[1]?.value ?? 0} đơn</p>
    </div>
  )
}

export function RevenueChart({ data }: { data: DayStat[] }) {
  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-[#444] text-sm">
        Chưa có dữ liệu doanh thu
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }} barSize={14}>
        <CartesianGrid vertical={false} stroke="#1C1C26" />
        <XAxis
          dataKey="day"
          tickFormatter={fmtDay}
          tick={{ fill: '#444', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={vnd}
          tick={{ fill: '#444', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(240,165,0,0.06)' }} />
        <Bar dataKey="revenue" fill="#F0A500" radius={[3, 3, 0, 0]} />
        <Bar dataKey="orders" fill="#1C1C26" radius={[3, 3, 0, 0]} hide />
      </BarChart>
    </ResponsiveContainer>
  )
}
