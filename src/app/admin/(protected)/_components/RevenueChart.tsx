'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
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
    <div className="bg-[#16161E] border border-[#1E1E28] rounded-xl px-4 py-3 shadow-xl">
      <p className="text-sm text-[#484858] mb-1">{label}</p>
      <p className="text-sm font-bold text-[#F0A500]">
        {new Intl.NumberFormat('vi-VN').format(payload[0].value)} ₫
      </p>
      <p className="text-sm text-[#484858] mt-0.5">{payload[1]?.value ?? 0} đơn</p>
    </div>
  )
}

export function RevenueChart({ data }: { data: DayStat[] }) {
  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-[#383848] text-sm">
        Chưa có dữ liệu doanh thu
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F0A500" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#F0A500" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#1A1A24" />
        <XAxis
          dataKey="day"
          tickFormatter={fmtDay}
          tick={{ fill: '#484858', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={vnd}
          tick={{ fill: '#484858', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#F0A500', strokeWidth: 1, strokeDasharray: '4 2' }} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#F0A500"
          strokeWidth={2}
          fill="url(#revenueGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#F0A500', strokeWidth: 0 }}
        />
        <Area dataKey="orders" stroke="transparent" fill="transparent" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
